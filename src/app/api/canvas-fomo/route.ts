import { NextRequest, NextResponse } from 'next/server';

// ── Types ──────────────────────────────────────────
interface PixelCell {
  color: string;
  painterAddr: string;
  painterNick: string;
  timestamp: number;
}

interface RoomPlayer {
  id: string;
  nickname: string;
  paints: number;
  joinedAt: number;
  lastPaint: number;
}

interface Activity {
  type: 'paint' | 'withdraw' | 'join' | 'leave';
  nick: string;
  detail: string;
  time: number;
}

interface GameRoom {
  id: string;
  grid: PixelCell[][];
  players: Map<string, RoomPlayer>;
  prizePool: number;
  leaderId: string | null;
  leaderNick: string;
  totalPaints: number;
  activities: Activity[];
  createdAt: number;
  isBotFill: boolean;
}

interface QueueEntry {
  userId: string;
  nickname: string;
  joinedAt: number;
  roomId: string | null;
}

// ── Constants ──────────────────────────────────────
const GRID = 16;
const EMPTY_COLOR = '#1e293b';
const PAINT_COST = '0.001';
const ROOM_TIMEOUT = 5 * 60 * 1000;
const MATCH_TIMEOUT = 15000;

const BOT_NAMES = ['像素猎人', '涂鸦战士', '链上画家', '暗影刺客', '彩虹猫'];

// ── In-memory state ───────────────────────────────
const matchQueue = new Map<string, QueueEntry>();
const rooms = new Map<string, GameRoom>();

// ── Helpers ─────────────────────────────────────────
function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function makeEmptyGrid(): PixelCell[][] {
  return Array.from({ length: GRID }, () =>
    Array(GRID).fill(null).map(() => ({
      color: EMPTY_COLOR, painterAddr: '', painterNick: '', timestamp: 0,
    }))
  );
}

function createRoom(id: string, isBotFill: boolean): GameRoom {
  return {
    id,
    grid: makeEmptyGrid(),
    players: new Map(),
    prizePool: 0,
    leaderId: null,
    leaderNick: '',
    totalPaints: 0,
    activities: [],
    createdAt: Date.now(),
    isBotFill,
  };
}

function fillBots(room: GameRoom, count: number) {
  for (let i = 0; i < count; i++) {
    const botId = `bot_${room.id}_${i}`;
    const botName = BOT_NAMES[i % BOT_NAMES.length];
    room.players.set(botId, {
      id: botId, nickname: botName,
      paints: 0, joinedAt: Date.now(), lastPaint: Date.now(),
    });
  }
}

function scheduleBotPaint(roomId: string) {
  const room = rooms.get(roomId);
  if (!room || room.players.size === 0) return;

  const botIds = Array.from(room.players.keys()).filter(id => id.startsWith('bot_'));
  if (botIds.length === 0) return;

  const botId = botIds[Math.floor(Math.random() * botIds.length)];
  const bot = room.players.get(botId)!;
  const x = Math.floor(Math.random() * GRID);
  const y = Math.floor(Math.random() * GRID);
  const colors = ['#e74c3c', '#f1c40f', '#3498db', '#9b59b6', '#e91e63', '#4d96ff', '#00d2d3', '#54a0ff'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  room.grid[x][y] = { color, painterAddr: botId, painterNick: bot.nickname, timestamp: Date.now() };
  room.prizePool += parseFloat(PAINT_COST);
  room.leaderId = botId;
  room.leaderNick = bot.nickname;
  room.totalPaints++;
  bot.paints++;
  bot.lastPaint = Date.now();
  room.activities.push({ type: 'paint', nick: bot.nickname, detail: `涂鸦了 (${x}, ${y})`, time: Date.now() });
  if (room.activities.length > 100) room.activities = room.activities.slice(-100);

  setTimeout(() => scheduleBotPaint(roomId), 3000 + Math.random() * 4000);
}

function cleanupStaleRooms() {
  const now = Date.now();
  Array.from(rooms.keys()).forEach(id => {
    const room = rooms.get(id)!;
    if (now - room.createdAt > ROOM_TIMEOUT) rooms.delete(id);
  });
  Array.from(matchQueue.keys()).forEach(id => {
    const entry = matchQueue.get(id)!;
    if (now - entry.joinedAt > 60000) matchQueue.delete(id);
  });
}

function removeFromQueue(userId: string) {
  Array.from(matchQueue.keys()).forEach(id => {
    if (matchQueue.get(id)?.userId === userId) matchQueue.delete(id);
  });
}

function findMatch(userId: string, queueId: string): { entry: QueueEntry; id: string } | null {
  let found: { entry: QueueEntry; id: string } | null = null;
  Array.from(matchQueue.entries()).forEach(([id, e]) => {
    if (!found && id !== queueId && !e.roomId && e.userId !== userId) {
      found = { entry: e, id };
    }
  });
  return found;
}

function addBotJoinActivities(room: GameRoom) {
  Array.from(room.players.entries()).forEach(([botId, bot]) => {
    if (botId.startsWith('bot_')) {
      room.activities.push({ type: 'join', nick: bot.nickname, detail: '加入了游戏', time: Date.now() });
    }
  });
}

setInterval(cleanupStaleRooms, 30000);

// ── API Handlers ──────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const roomId = searchParams.get('roomId');
  const queueId = searchParams.get('queueId');

  if (action === 'match-status' && queueId) {
    const entry = matchQueue.get(queueId);
    if (!entry) return NextResponse.json({ status: 'expired' });
    if (entry.roomId) {
      const room = rooms.get(entry.roomId);
      if (room) {
        return NextResponse.json({
          status: 'matched',
          roomId: entry.roomId,
          players: Array.from(room.players.values()).map(p => ({
            nickname: p.nickname, paints: p.paints, isBot: p.id.startsWith('bot_'),
          })),
        });
      }
    }
    return NextResponse.json({
      status: 'waiting',
      queueLength: matchQueue.size,
      waitTime: Math.min(15, Math.floor((Date.now() - entry.joinedAt) / 1000)),
    });
  }

  if (action === 'room' && roomId) {
    const room = rooms.get(roomId);
    if (!room) return NextResponse.json({ error: 'room not found' }, { status: 404 });
    return NextResponse.json({
      grid: room.grid,
      players: Array.from(room.players.values()),
      prizePool: room.prizePool.toFixed(4),
      leaderId: room.leaderId,
      leaderNick: room.leaderNick,
      totalPaints: room.totalPaints,
      activities: room.activities.slice(-50),
    });
  }

  if (action === 'player') {
    const addr = searchParams.get('addr');
    return NextResponse.json({ addr, nickname: '' });
  }

  return NextResponse.json({
    totalRooms: rooms.size,
    totalPlayers: Array.from(rooms.values()).reduce((s, r) => s + r.players.size, 0),
    queueLength: matchQueue.size,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, nickname } = body;

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const displayName = nickname || shortAddr(userId);

    if (action === 'join-match') {
      removeFromQueue(userId);

      const queueId = `q_${userId}_${Date.now()}`;
      const entry: QueueEntry = { userId, nickname: displayName, joinedAt: Date.now(), roomId: null };
      matchQueue.set(queueId, entry);

      const matched = findMatch(userId, queueId);
      if (matched) {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const room = createRoom(roomId, false);

        room.players.set(matched.entry.userId, {
          id: matched.entry.userId, nickname: matched.entry.nickname,
          paints: 0, joinedAt: Date.now(), lastPaint: Date.now(),
        });
        room.activities.push({ type: 'join', nick: matched.entry.nickname, detail: '加入了游戏', time: Date.now() });

        room.players.set(userId, {
          id: userId, nickname: displayName,
          paints: 0, joinedAt: Date.now(), lastPaint: Date.now(),
        });
        room.activities.push({ type: 'join', nick: displayName, detail: '加入了游戏', time: Date.now() });

        rooms.set(roomId, room);
        entry.roomId = roomId;
        matched.entry.roomId = roomId;
        matchQueue.delete(matched.id);

        return NextResponse.json({
          status: 'matched', roomId, queueId,
          players: Array.from(room.players.values()).map(p => ({
            nickname: p.nickname, paints: p.paints, isBot: false,
          })),
        });
      }

      setTimeout(() => {
        const e = matchQueue.get(queueId);
        if (!e || e.roomId) return;

        const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const room = createRoom(roomId, true);

        room.players.set(userId, {
          id: userId, nickname: displayName,
          paints: 0, joinedAt: Date.now(), lastPaint: Date.now(),
        });
        room.activities.push({ type: 'join', nick: displayName, detail: '加入了游戏', time: Date.now() });

        const botCount = 2 + Math.floor(Math.random() * 2);
        fillBots(room, botCount);
        addBotJoinActivities(room);

        rooms.set(roomId, room);
        e.roomId = roomId;

        setTimeout(() => scheduleBotPaint(roomId), 3000);
      }, MATCH_TIMEOUT);

      return NextResponse.json({ status: 'waiting', queueId, queueLength: matchQueue.size });
    }

    if (action === 'leave-queue') {
      removeFromQueue(userId);
      return NextResponse.json({ success: true });
    }

    if (action === 'paint') {
      const { roomId, x, y, color, cost } = body;
      if (!roomId || x === undefined || y === undefined || !color) {
        return NextResponse.json({ error: 'missing fields' }, { status: 400 });
      }
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ error: 'room not found' }, { status: 404 });
      if (!room.players.has(userId)) {
        return NextResponse.json({ error: 'not in room' }, { status: 403 });
      }

      const paintCost = parseFloat(cost || PAINT_COST);
      room.grid[x][y] = { color, painterAddr: userId, painterNick: displayName, timestamp: Date.now() };
      room.prizePool += paintCost;
      room.leaderId = userId;
      room.leaderNick = displayName;
      room.totalPaints++;

      const player = room.players.get(userId)!;
      player.paints++;
      player.lastPaint = Date.now();

      room.activities.push({ type: 'paint', nick: displayName, detail: `涂鸦了 (${x}, ${y})`, time: Date.now() });
      if (room.activities.length > 100) room.activities = room.activities.slice(-100);

      return NextResponse.json({
        success: true, prizePool: room.prizePool.toFixed(4),
        leaderId: userId, leaderNick: displayName, totalPaints: room.totalPaints,
      });
    }

    if (action === 'withdraw') {
      const { roomId } = body;
      if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ error: 'room not found' }, { status: 404 });
      if (room.leaderId !== userId) return NextResponse.json({ error: 'not the leader' }, { status: 403 });

      const amount = room.prizePool.toFixed(4);
      room.activities.push({ type: 'withdraw', nick: displayName, detail: `提取了 ${amount} ETH`, time: Date.now() });
      room.prizePool = 0;
      room.leaderId = null;
      room.leaderNick = '';

      return NextResponse.json({ success: true, amount });
    }

    if (action === 'leave-room') {
      const { roomId } = body;
      if (roomId) {
        const room = rooms.get(roomId);
        if (room) {
          room.players.delete(userId);
          room.activities.push({ type: 'leave', nick: displayName, detail: '离开了游戏', time: Date.now() });
          const remaining = Array.from(room.players.keys());
          if (remaining.length === 0 || remaining.every(id => id.startsWith('bot_'))) {
            rooms.delete(roomId);
          }
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
