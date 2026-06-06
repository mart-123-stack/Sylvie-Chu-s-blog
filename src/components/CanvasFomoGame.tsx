'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatEther, parseEther } from 'ethers';

// ── Types ──────────────────────────────────────────
type GameMode = 'practice' | 'match';
type ConnState = 'disconnected' | 'connecting' | 'connected';
type PageView = 'lobby' | 'canvas';
type ColorTier = 'common' | 'rare' | 'epic' | 'legendary';

interface ColorDef {
  hex: string;
  name: string;
  tier: ColorTier;
  cost: string; // in ETH
}

interface PixelCell {
  color: string;
  painterAddr: string;
  painterNick: string;
  timestamp: number;
}

interface Activity {
  type: 'paint' | 'withdraw' | 'join';
  nick: string;
  addr: string;
  detail: string;
  time: number;
}

interface Player {
  nickname: string;
  wallet: string;
  paints: number;
  lastPaint: number;
}

// ── Constants ──────────────────────────────────────
const GRID = 16;

const ALL_COLORS: ColorDef[] = [
  // 素色 (0.001 ETH) — 明快基础色
  { hex: '#4A90D9', name: '黛蓝', tier: 'common',    cost: '0.001' },
  { hex: '#5CAD6A', name: '艾绿', tier: 'common',    cost: '0.001' },
  { hex: '#D4924A', name: '檀棕', tier: 'common',    cost: '0.001' },
  { hex: '#E88090', name: '藕荷', tier: 'common',    cost: '0.001' },
  { hex: '#5AB0B0', name: '碧青', tier: 'common',    cost: '0.001' },
  { hex: '#B080C8', name: '紫烟', tier: 'common',    cost: '0.001' },
  // 彩色 (0.003 ETH) — 鲜艳饱和
  { hex: '#E8484A', name: '朱砂', tier: 'rare',      cost: '0.003' },
  { hex: '#F0B830', name: '藤黄', tier: 'rare',      cost: '0.003' },
  { hex: '#3D7BD0', name: '靛蓝', tier: 'rare',      cost: '0.003' },
  { hex: '#D04080', name: '绛紫', tier: 'rare',      cost: '0.003' },
  { hex: '#F07088', name: '珊瑚', tier: 'rare',      cost: '0.003' },
  // 宝石 (0.005 ETH) — 浓郁宝石
  { hex: '#D03050', name: '胭脂', tier: 'epic',      cost: '0.005' },
  { hex: '#10B898', name: '琉璃', tier: 'epic',      cost: '0.005' },
  { hex: '#7840D0', name: '紫晶', tier: 'epic',      cost: '0.005' },
  // 至尊 (0.01 ETH) — 极致
  { hex: '#D4A030', name: '赤金', tier: 'legendary',  cost: '0.01'  },
  { hex: '#F5F0EA', name: '月白', tier: 'legendary',  cost: '0.01'  },
];

const TIER_LABEL: Record<ColorTier, string> = {
  common: '素色',
  rare: '彩色',
  epic: '宝石',
  legendary: '至尊',
};

const EMPTY_CELL: PixelCell = { color: '#f1f5f9', painterAddr: '', painterNick: '', timestamp: 0 };

// ── Color assignment ───────────────────────────────
function assignPlayerColors(seed: string): number[] {
  // Deterministic shuffle based on seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  // Ensure at least 2 common + mix of others
  const indices = ALL_COLORS.map((_, i) => i);
  // Fisher-Yates with seeded RNG
  let s = Math.abs(hash);
  for (let i = indices.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 49297;
    const j = s % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  // Take first 5
  return indices.slice(0, 5);
}

function getColorCostHex(hex: string): string {
  return ALL_COLORS.find(c => c.hex === hex)?.cost || '0.001';
}

function getColorTier(hex: string): ColorTier {
  return ALL_COLORS.find(c => c.hex === hex)?.tier || 'common';
}

// ── Helpers ─────────────────────────────────────────
function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

function parseColorToUint24(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

function uint24ToHex(c: number): string {
  return '#' + c.toString(16).padStart(6, '0');
}

// ── Component ───────────────────────────────────────
export default function CanvasFomoGame() {
  const { user, token } = useAuth();

  // Mode
  const [mode, setMode] = useState<GameMode>('practice');
  const [connState, setConnState] = useState<ConnState>('disconnected');
  const [view, setView] = useState<PageView>('lobby');
  const [walletAddr, setWalletAddr] = useState('');
  const [signer, setSigner] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);

  // Canvas
  const [grid, setGrid] = useState<PixelCell[][]>(() =>
    Array.from({ length: GRID }, () => Array(GRID).fill(null).map(() => ({ ...EMPTY_CELL })))
  );
  const [selectedColor, setSelectedColor] = useState(ALL_COLORS[0].hex);
  const [playerColorIndices, setPlayerColorIndices] = useState<number[]>([]);
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(null);

  // Game state
  const [prizePool, setPrizePool] = useState('0');
  const [leaderAddr, setLeaderAddr] = useState('');
  const [leaderNick, setLeaderNick] = useState('');
  const [totalPaints, setTotalPaints] = useState(0);
  const [txPending, setTxPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  // Matchmaking (practice mode)
  const [isSearching, setIsSearching] = useState(false);
  const [matched, setMatched] = useState(false);

  // Refs
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roomPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contractAddrRef = useRef('');
  const [queueId, setQueueId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  // ── Contract ABI ─────────────────────────────────
  const CONTRACT_ABI = [
    { inputs: [{ name: 'x', type: 'uint256' }, { name: 'y', type: 'uint256' }, { name: 'color', type: 'uint24' }], name: 'paint', outputs: [], stateMutability: 'payable', type: 'function' },
    { inputs: [], name: 'withdraw', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [], name: 'currentLeader', outputs: [{ name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'prizePool', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'totalPaints', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'PRICE', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'getCanvasState', outputs: [
      { name: '', type: 'address[256]' }, { name: '', type: 'uint24[256]' }, { name: '', type: 'uint40[256]' },
      { name: '', type: 'address' }, { name: '', type: 'uint256' }, { name: '', type: 'uint256' },
    ], stateMutability: 'view', type: 'function' },
  ];

  // ── Connect wallet (online mode) ─────────────────
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('未检测到 MetaMask，请安装 MetaMask 以进行在线游戏。');
      return;
    }
    setConnState('connecting');
    setError(null);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const s = await provider.getSigner();
      const addr = await s.getAddress();
      setWalletAddr(addr);
      setSigner(s);

      const storedAddr = localStorage.getItem('fomo-contract-addr');
      if (storedAddr) {
        const c = new ethers.Contract(storedAddr, CONTRACT_ABI, s);
        setContract(c);
        contractAddrRef.current = storedAddr;
        await loadOnlineState(c);
      } else {
        const res = await fetch('/api/canvas-fomo?action=contract');
        if (res.ok) {
          const data = await res.json();
          if (data.address) {
            const c = new ethers.Contract(data.address, CONTRACT_ABI, s);
            setContract(c);
            contractAddrRef.current = data.address;
            localStorage.setItem('fomo-contract-addr', data.address);
            await loadOnlineState(c);
          }
        }
      }
      setConnState('connected');
    } catch (e: any) {
      setError(e.message || '连接钱包失败');
      setConnState('disconnected');
    }
  }, []);

  // ── Load on-chain state ──────────────────────────
  const loadOnlineState = async (c: any) => {
    try {
      const state = await c.getCanvasState();
      const [paintersArr, colorsArr, timestampsArr, leader, pool, total] = state;

      const newGrid: PixelCell[][] = Array.from({ length: GRID }, () => Array(GRID).fill(null).map(() => ({ ...EMPTY_CELL })));
      for (let i = 0; i < GRID * GRID; i++) {
        const r = Math.floor(i / GRID);
        const col = i % GRID;
        const painter = paintersArr[i];
        if (painter !== '0x0000000000000000000000000000000000000000') {
          try {
            const res = await fetch(`/api/canvas-fomo?action=player&addr=${painter}`);
            const data = await res.json();
            newGrid[r][col] = {
              color: uint24ToHex(colorsArr[i]),
              painterAddr: painter,
              painterNick: data.nickname || shortAddr(painter),
              timestamp: Number(timestampsArr[i]) * 1000,
            };
          } catch {
            newGrid[r][col] = {
              color: uint24ToHex(colorsArr[i]),
              painterAddr: painter,
              painterNick: shortAddr(painter),
              timestamp: Number(timestampsArr[i]) * 1000,
            };
          }
        }
      }
      setGrid(newGrid);
      setLeaderAddr(leader);
      setPrizePool(ethersFormatEther(pool));
      setTotalPaints(Number(total));

      if (leader && leader !== '0x0000000000000000000000000000000000000000') {
        const res = await fetch(`/api/canvas-fomo?action=player&addr=${leader}`);
        const data = await res.json();
        setLeaderNick(data.nickname || shortAddr(leader));
      }
    } catch (e) {
      console.error('loadOnlineState error:', e);
    }
  };

  // ── Paint (practice) ─────────────────────────────
  const paintPractice = useCallback((r: number, c: number) => {
    const nick = user?.nickname || '玩家';
    const addr = walletAddr || '0xPlayer';

    setGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      next[r][c] = {
        color: selectedColor,
        painterAddr: addr,
        painterNick: nick,
        timestamp: Date.now(),
      };
      return next;
    });

    const prevPool = parseFloat(prizePool);
    const cost = parseFloat(getColorCostHex(selectedColor));
    const newPool = prevPool + cost;
    setPrizePool(newPool.toFixed(4));
    setLeaderAddr(addr);
    setLeaderNick(nick);
    setTotalPaints(prev => prev + 1);

    setActivities(prev => [{
      type: 'paint' as const, nick, addr,
      detail: `涂鸦了 (${r}, ${c})`,
      time: Date.now(),
    }, ...prev].slice(0, 50));

    updatePlayers(nick, addr);
    setSuccessMsg(`${nick} 涂鸦了 (${r}, ${c})`);
    setTimeout(() => setSuccessMsg(null), 2000);
  }, [selectedColor, prizePool, walletAddr, user?.nickname]);

  const updatePlayers = (nick: string, addr: string) => {
    setPlayers(prev => {
      const exists = prev.find(p => p.wallet === addr);
      if (exists) {
        return prev.map(p =>
          p.wallet === addr ? { ...p, paints: p.paints + 1, lastPaint: Date.now() } : p
        );
      }
      return [...prev, { nickname: nick, wallet: addr, paints: 1, lastPaint: Date.now() }];
    });
  };

  // ── Paint (online) ───────────────────────────────
  const paintOnline = useCallback(async (r: number, c: number) => {
    if (!contract || txPending) return;
    setTxPending(true);
    setError(null);
    try {
      const colorVal = parseColorToUint24(selectedColor);
      const cost = getColorCostHex(selectedColor);
      const tx = await contract.paint(r, c, colorVal, { value: ethersParseEther(cost) });
      await tx.wait();
      await loadOnlineState(contract);
      setActivities(prev => [{
        type: 'paint' as const,
        nick: user?.nickname || shortAddr(walletAddr),
        addr: walletAddr,
        detail: `涂鸦了 (${r}, ${c})`,
        time: Date.now(),
      }, ...prev].slice(0, 50));

      fetch('/api/canvas-fomo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'paint',
          wallet: walletAddr,
          nickname: user?.nickname,
          x: r, y: c, color: selectedColor,
        }),
      }).catch(() => {});
    } catch (e: any) {
      setError(e.reason || e.message || '交易失败');
    } finally {
      setTxPending(false);
    }
  }, [contract, txPending, selectedColor, walletAddr, user?.nickname]);

  // ── Withdraw (online) ────────────────────────────
  const handleWithdraw = useCallback(async () => {
    if (!contract || txPending) return;
    setTxPending(true);
    setError(null);
    try {
      const tx = await contract.withdraw();
      await tx.wait();
      setSuccessMsg(`已提取 ${prizePool} ETH！`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadOnlineState(contract);
      setActivities(prev => [{
        type: 'withdraw' as const,
        nick: user?.nickname || shortAddr(walletAddr),
        addr: walletAddr,
        detail: `提取了 ${prizePool} ETH`,
        time: Date.now(),
      }, ...prev].slice(0, 50));
    } catch (e: any) {
      setError(e.reason || e.message || '提取失败');
    } finally {
      setTxPending(false);
    }
  }, [contract, txPending, prizePool, walletAddr, user?.nickname]);

  // ── Withdraw (practice) ──────────────────────────
  const handleWithdrawPractice = useCallback(() => {
    const pool = parseFloat(prizePool);
    if (pool <= 0) {
      setError('奖池为空');
      setTimeout(() => setError(null), 2000);
      return;
    }
    setSuccessMsg(`已提取 ${prizePool} ETH！（模拟）`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setActivities(prev => [{
      type: 'withdraw' as const,
      nick: user?.nickname || '玩家',
      addr: walletAddr || '0xPlayer',
      detail: `提取了 ${prizePool} ETH`,
      time: Date.now(),
    }, ...prev].slice(0, 50));
    setPrizePool('0');
    setLeaderAddr('');
    setLeaderNick('');
  }, [prizePool, walletAddr, user?.nickname]);

  // ── Assign colors to player ──────────────────────
  const assignColors = useCallback(() => {
    const seed = walletAddr || user?.id || Math.random().toString();
    const indices = assignPlayerColors(seed);
    setPlayerColorIndices(indices);
    setSelectedColor(ALL_COLORS[indices[0]].hex);
  }, [walletAddr, user?.id]);

  // ── Matchmaking ──────────────────────────────────
  const startSearch = useCallback(async () => {
    setIsSearching(true);
    setError(null);

    if (mode === 'practice') {
      // Practice mode: local bots
      setTimeout(() => {
        const bots = [
          { nickname: '像素猎人', wallet: 'bot_1' },
          { nickname: '涂鸦战士', wallet: 'bot_2' },
          { nickname: '链上画家', wallet: 'bot_3' },
        ];
        const userNick = user?.nickname || '你';
        const userWallet = 'local_player';

        const allPlayers = [
          { nickname: userNick, wallet: userWallet, paints: 0, lastPaint: Date.now() },
          ...bots.map(b => ({ ...b, paints: Math.floor(Math.random() * 5), lastPaint: Date.now() - Math.floor(Math.random() * 30000) })),
        ];
        setPlayers(allPlayers);
        setActivities([
          { type: 'join' as const, nick: bots[2].nickname, addr: bots[2].wallet, detail: '加入了游戏', time: Date.now() - 1000 },
          { type: 'join' as const, nick: bots[1].nickname, addr: bots[1].wallet, detail: '加入了游戏', time: Date.now() - 2000 },
          { type: 'join' as const, nick: bots[0].nickname, addr: bots[0].wallet, detail: '加入了游戏', time: Date.now() - 3000 },
        ]);
        assignColors();
        setIsSearching(false);
        setMatched(true);
        setView('canvas');
      }, 1500 + Math.random() * 1000);
      return;
    }

    // Match mode: real server matching
    try {
      const uid = user?.id || `anon_${Date.now()}`;
      const res = await fetch('/api/canvas-fomo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join-match',
          userId: uid,
          nickname: user?.nickname || '游客',
        }),
      });
      const data = await res.json();

      if (data.status === 'matched') {
        assignColors();
        setRoomId(data.roomId);
        setQueueId(null);
        setIsSearching(false);
        setMatched(true);
        setView('canvas');
        syncRoomState(data.roomId);
        return;
      }

      if (data.status === 'waiting') {
        setQueueId(data.queueId);
        // Start polling for match status
        const poll = setInterval(async () => {
          try {
            const r = await fetch(`/api/canvas-fomo?action=match-status&queueId=${data.queueId}`);
            const d = await r.json();
            if (d.status === 'matched') {
              clearInterval(poll);
              assignColors();
              setRoomId(d.roomId);
              setQueueId(null);
              setIsSearching(false);
              setMatched(true);
              setView('canvas');
              syncRoomState(d.roomId);
            }
          } catch {}
        }, 2000);
        (window as any).__matchPoll = poll;
      }
    } catch (e: any) {
      setError('匹配失败，请重试');
      setIsSearching(false);
    }
  }, [mode, user?.id, user?.nickname, assignColors]);

  // ── Sync room state (match mode) ─────────────────
  const syncRoomState = useCallback(async (rid: string) => {
    try {
      const res = await fetch(`/api/canvas-fomo?action=room&roomId=${rid}`);
      const data = await res.json();
      if (!data.grid) return;

      setGrid(data.grid);
      setPrizePool(data.prizePool);
      setLeaderAddr(data.leaderId || '');
      setLeaderNick(data.leaderNick || '');
      setTotalPaints(data.totalPaints);
      setPlayers(data.players.map((p: any) => ({
        nickname: p.nickname,
        wallet: p.id,
        paints: p.paints,
        lastPaint: p.lastPaint,
      })));
      setActivities(data.activities.map((a: any) => ({
        type: a.type as any, nick: a.nick, addr: '', detail: a.detail, time: a.time,
      })));
    } catch {}
  }, []);

  // ── Room polling (match mode) ────────────────────
  useEffect(() => {
    if (mode === 'match' && view === 'canvas' && roomId) {
      roomPollRef.current = setInterval(() => syncRoomState(roomId), 2000);
      return () => {
        if (roomPollRef.current) clearInterval(roomPollRef.current);
      };
    }
  }, [mode, view, roomId, syncRoomState]);

  // Cleanup match poll on unmount
  useEffect(() => {
    return () => {
      if ((window as any).__matchPoll) {
        clearInterval((window as any).__matchPoll);
      }
    };
  }, []);

  // ── Simulate bot paints (practice) ───────────────
  useEffect(() => {
    if (mode !== 'practice' || view !== 'canvas' || !matched) return;
    const timer = setInterval(() => {
      const r = Math.floor(Math.random() * GRID);
      const c = Math.floor(Math.random() * GRID);
      const botIdx = Math.floor(Math.random() * Math.max(players.length - 1, 1)) + 1;
      const bot = players[botIdx] || { nickname: 'Bot', wallet: '0xBot' };

      setGrid(prev => {
        const next = prev.map(row => row.map(cell => ({ ...cell })));
        next[r][c] = {
          color: ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)].hex,
          painterAddr: bot.wallet,
          painterNick: bot.nickname,
          timestamp: Date.now(),
        };
        return next;
      });

      setPrizePool(prev => (parseFloat(prev) + 0.003).toFixed(4));
      setLeaderAddr(bot.wallet);
      setLeaderNick(bot.nickname);
      setTotalPaints(prev => prev + 1);

      setPlayers(prev => prev.map(p =>
        p.wallet === bot.wallet ? { ...p, paints: p.paints + 1, lastPaint: Date.now() } : p
      ));

      setActivities(prev => [{
        type: 'paint' as const, nick: bot.nickname, addr: bot.wallet,
        detail: `涂鸦了 (${r}, ${c})`,
        time: Date.now(),
      }, ...prev].slice(0, 50));
    }, 4000 + Math.random() * 4000);

    return () => clearInterval(timer);
  }, [mode, view, matched, players]);

  // ── Leave room (match mode) ──────────────────────
  const leaveRoom = useCallback(async () => {
    if (roomId && mode === 'match') {
      const uid = user?.id || `anon_${Date.now()}`;
      await fetch('/api/canvas-fomo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave-room', roomId, userId: uid }),
      }).catch(() => {});
    }
    if (roomPollRef.current) clearInterval(roomPollRef.current);
    setRoomId(null);
    setView('lobby');
  }, [roomId, mode, user?.id]);

  // ── Disconnect wallet ────────────────────────────
  const disconnectWallet = useCallback(() => {
    setConnState('disconnected');
    setWalletAddr('');
    setSigner(null);
    setContract(null);
    contractAddrRef.current = '';
    setView('lobby');
  }, []);

  // ── Withdraw via API (match mode) ────────────────
  const handleWithdrawMatch = useCallback(async () => {
    if (!roomId) return;
    const uid = user?.id || `anon_${Date.now()}`;
    try {
      const res = await fetch('/api/canvas-fomo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw', roomId, userId: uid }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`已提取 ${data.amount} ETH！`);
        setTimeout(() => setSuccessMsg(null), 4000);
        await syncRoomState(roomId);
      } else {
        setError(data.error || '提取失败');
        setTimeout(() => setError(null), 2000);
      }
    } catch {
      setError('提取失败');
      setTimeout(() => setError(null), 2000);
    }
  }, [roomId, user?.id, syncRoomState]);

  // ── Switch mode ──────────────────────────────────
  const switchMode = useCallback((m: GameMode) => {
    setMode(m);
    setView('lobby');
    setError(null);
    setSuccessMsg(null);
    setMatched(false);
    setIsSearching(false);
    setQueueId(null);
    setRoomId(null);
    if (roomPollRef.current) clearInterval(roomPollRef.current);
    if ((window as any).__matchPoll) {
      clearInterval((window as any).__matchPoll);
      (window as any).__matchPoll = null;
    }
  }, []);

  // ── Paint via API (match mode) ───────────────────
  const paintMatch = useCallback(async (r: number, c: number) => {
    if (!roomId || txPending) return;
    const uid = user?.id || `anon_${Date.now()}`;
    setTxPending(true);
    try {
      const cost = getColorCostHex(selectedColor);
      await fetch('/api/canvas-fomo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'paint',
          roomId, userId: uid, x: r, y: c,
          color: selectedColor, cost,
          nickname: user?.nickname || '游客',
        }),
      });
      await syncRoomState(roomId);
    } catch {
      setError('涂鸦失败');
      setTimeout(() => setError(null), 2000);
    } finally {
      setTxPending(false);
    }
  }, [roomId, txPending, selectedColor, user?.id, user?.nickname, syncRoomState]);

  // ── Canvas click handler ─────────────────────────
  const handleCellClick = useCallback((r: number, c: number) => {
    if (txPending) return;
    if (mode === 'practice') {
      paintPractice(r, c);
    } else if (mode === 'match') {
      paintMatch(r, c);
    } else {
      setError('请先连接钱包');
      setTimeout(() => setError(null), 2000);
    }
  }, [mode, txPending, paintPractice, paintMatch]);

  // ── Ethers helpers ────────────────────────────────
  const ethersFormatEther = useCallback((val: any): string => {
    try { return formatEther(val); } catch { return '0'; }
  }, []);

  const ethersParseEther = useCallback((val: string): any => {
    try { return parseEther(val); } catch { return '0'; }
  }, []);

  // ── Render helpers ───────────────────────────────
  const playerId = mode === 'match' ? (user?.id || `anon_${Date.now()}`) : (walletAddr || '0xPlayer');
  const isLeader = (mode === 'match' && leaderAddr === playerId) ||
    (mode === 'practice' && leaderAddr === 'local_player');

  // ── LOBBY VIEW ───────────────────────────────────
  if (view === 'lobby') {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Mode Toggle — 精致分段控件 */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-2xl bg-white/60 dark:bg-slate-800/60 p-1 border border-slate-200/60 dark:border-slate-700/60 shadow-sm backdrop-blur-sm">
            <button
              onClick={() => switchMode('practice')}
              className={`relative px-7 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                mode === 'practice'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              练习
            </button>
            <button
              onClick={() => switchMode('match')}
              className={`relative px-7 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                mode === 'match'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              匹配
            </button>
          </div>
        </div>

        {/* Match Mode — Player Info */}
        {mode === 'match' && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
                玩家
              </span>
              {user ? (
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-full font-medium tracking-wide">
                  已登录
                </span>
              ) : (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full font-medium tracking-wide">
                  游客模式
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                {user?.nickname?.[0] || '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {user?.nickname || '游客'}
                </p>
                {!user && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">未登录将以游客身份游戏</p>
                )}
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50/80 dark:bg-amber-900/10 rounded-xl border border-amber-200/40 dark:border-amber-700/20">
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed tracking-wide">
                🎯 点击下方按钮匹配在线玩家 · 15 秒内无真人则自动补 Bot
              </p>
            </div>
          </div>
        )}

        {/* Game Rules */}
        <div className="glass-card rounded-2xl p-7 mb-8">
          <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-100 mb-5 tracking-tight">
            规则
          </h3>
          <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-[10px] text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5 font-medium">一</span>
              <span>每笔涂鸦花费 ETH，<span className="font-semibold text-slate-700 dark:text-slate-300">颜色越稀有越贵</span></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-[10px] text-teal-500 dark:text-teal-400 shrink-0 mt-0.5 font-medium">二</span>
              <span>每人仅 <span className="font-semibold text-slate-700 dark:text-slate-300">随机分配 5 种颜色</span>，未拥有的颜色无法使用</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-[10px] text-teal-500 dark:text-teal-400 shrink-0 mt-0.5 font-medium">三</span>
              <span>每次涂鸦花费自动累积到 <span className="font-semibold text-slate-700 dark:text-slate-300">奖池</span></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-[10px] text-teal-500 dark:text-teal-400 shrink-0 mt-0.5 font-medium">四</span>
              <span><span className="font-semibold text-slate-700 dark:text-slate-300">最后一人</span> 独占奖池，可随时提取</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-[10px] text-teal-500 dark:text-teal-400 shrink-0 mt-0.5 font-medium">五</span>
              <span>别人涂鸦后奖池易主 —— <span className="font-semibold text-amber-600 dark:text-amber-400">时机就是一切</span></span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        {view === 'lobby' && (
          <button
            onClick={startSearch}
            disabled={isSearching}
            className={`w-full py-4 rounded-2xl font-semibold text-base tracking-wide transition-all duration-300 ${
              isSearching
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-wait'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/20 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200/60 dark:hover:shadow-indigo-900/30 hover:-translate-y-0.5 active:translate-y-0 border border-indigo-400/30'
            }`}
          >
            {isSearching ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {mode === 'match' ? '匹配中（15秒后补 Bot）…' : '匹配中…'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {mode === 'match' ? '🎯 寻找对战' : '🎨 开始练习'}
              </span>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 p-3 bg-red-50/80 dark:bg-red-900/15 border border-red-200/60 dark:border-red-800/30 rounded-xl text-red-500 dark:text-red-400 text-sm text-center backdrop-blur-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ── CANVAS VIEW ──────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={() => {
            if (mode === 'match') leaveRoom();
            else { setView('lobby'); setMatched(false); }
          }}
          className="group text-sm text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          返回大厅
        </button>

        <div className="flex items-center gap-3">
          <span className={`text-[11px] px-3 py-1 rounded-full font-medium tracking-wide ${
            mode === 'match'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
          }`}>
            {mode === 'match' ? '匹配' : '练习'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* ── Left: Canvas ───────────────────────── */}
        <div>
          {/* Stats bar — 精致数据卡片 */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-[11px] text-slate-400 font-medium tracking-wider mb-2">奖池</p>
                <p className="text-2xl font-bold text-amber-600">{parseFloat(prizePool) > 0 ? prizePool : '0'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">ETH</p>
              </div>
              <div className="text-center border-x border-slate-100 dark:border-slate-700/50">
                <p className="text-[11px] text-slate-400 font-medium tracking-wider mb-2">领先者</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[120px] mx-auto" title={leaderAddr}>
                  {leaderNick || leaderAddr || '—'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{totalPaints} 次涂鸦</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-slate-400 font-medium tracking-wider mb-2">总涂鸦</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalPaints}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">次</p>
              </div>
            </div>
          </div>

          {/* Canvas — 画布 */}
          <div className="glass-card rounded-2xl p-4">
            {/* Canvas info bar */}
            <div className="flex items-center justify-between mb-3 px-0.5">
              <span className="text-[10px] font-medium text-slate-400 tracking-wider">16 × 16</span>
              <span className="text-[10px] text-slate-400">
                {grid.flat().filter(c => c.painterAddr).length} / 256 已涂
              </span>
            </div>
            <div
              className="grid gap-[2px] mx-auto rounded-xl overflow-hidden border border-indigo-200/50 dark:border-indigo-700/30 shadow-sm"
              style={{
                gridTemplateColumns: `repeat(${GRID}, 1fr)`,
                maxWidth: 480,
                aspectRatio: '1',
                backgroundColor: '#ece6dc',
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isHover = hoverCell?.r === r && hoverCell?.c === c;
                  const isPainted = cell.painterAddr !== '';
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      onMouseEnter={() => setHoverCell({ r, c })}
                      onMouseLeave={() => setHoverCell(null)}
                      disabled={txPending}
                      className={`
                        relative w-full aspect-square transition-all duration-100
                        ${isHover && !txPending ? 'scale-[1.18] z-10 ring-2 ring-indigo-400/80 rounded-sm' : ''}
                        ${txPending ? 'cursor-wait' : 'cursor-crosshair'}
                        ${isPainted ? '' : 'bg-[#f4f0e9] dark:bg-slate-700'}
                      `}
                      style={{ backgroundColor: isPainted ? cell.color : undefined }}
                      title={isPainted
                        ? `${cell.painterNick} @ (${r}, ${c})`
                        : `(${r}, ${c})`
                      }
                    >
                      {isHover && !txPending && (
                        <div
                          className="absolute inset-0 opacity-65 rounded-sm"
                          style={{ backgroundColor: selectedColor }}
                        />
                      )}
                      {isPainted && (
                        <div className="absolute bottom-[1px] right-[1px] w-[3px] h-[3px] rounded-full bg-white/50" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Color palette — 调色板 */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <p className="font-serif text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">调色板</p>
                <p className="text-xs text-slate-400">
                  已分配 <span className="text-indigo-500 font-semibold">{playerColorIndices.length}</span> / {ALL_COLORS.length}
                </p>
              </div>
              {(['common', 'rare', 'epic', 'legendary'] as ColorTier[]).map(tier => {
                const tierColors = ALL_COLORS.filter(c => c.tier === tier);
                const tierBadgeClass = tier === 'common' ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400' :
                  tier === 'rare' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                  tier === 'epic' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
                return (
                  <div key={tier} className="mb-3 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider ${tierBadgeClass}`}>
                        {TIER_LABEL[tier]}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-wide">
                        {tier === 'common' ? '0.001 ETH' : tier === 'rare' ? '0.003 ETH' : tier === 'epic' ? '0.005 ETH' : '0.01 ETH'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tierColors.map(c => {
                        const ownedIdx = playerColorIndices.findIndex(i => ALL_COLORS[i].hex === c.hex);
                        const owned = ownedIdx !== -1;
                        return (
                          <button
                            key={c.hex}
                            onClick={() => owned && setSelectedColor(c.hex)}
                            disabled={!owned}
                            className={`
                              relative w-8 h-8 rounded-xl transition-all duration-150
                              ${owned ? 'shadow-sm hover:shadow-md' : 'cursor-not-allowed'}
                              ${selectedColor === c.hex
                                ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-800 scale-110 z-10 shadow-md'
                                : ''}
                              ${owned && selectedColor !== c.hex ? 'hover:scale-110 hover:z-10' : ''}
                            `}
                            style={{ backgroundColor: c.hex, opacity: owned ? 1 : 0.2 }}
                            title={owned
                              ? `${c.name} · ${TIER_LABEL[c.tier]} · ${c.cost} ETH`
                              : `🔒 ${c.name} · ${c.cost} ETH`
                            }
                          >
                            {!owned && (
                              <span className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 drop-shadow-sm">🔒</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* 当前颜色指示 */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm" style={{ backgroundColor: selectedColor }} />
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{ALL_COLORS.find(c => c.hex === selectedColor)?.name}</span>
                  <span className="text-xs text-slate-400 ml-2">· 消耗 {getColorCostHex(selectedColor)} ETH</span>
                </div>
                <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider ${
                  getColorTier(selectedColor) === 'common' ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400' :
                  getColorTier(selectedColor) === 'rare' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                  getColorTier(selectedColor) === 'epic' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                }`}>
                  {TIER_LABEL[getColorTier(selectedColor)]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ──────────────────────── */}
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="glass-card rounded-2xl p-5">
            <h4 className="font-serif text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 tracking-wide">操作</h4>
            <div className="space-y-2.5">
              <button
                onClick={mode === 'match' ? handleWithdrawMatch : mode === 'practice' ? handleWithdrawPractice : handleWithdraw}
                disabled={txPending || !isLeader || parseFloat(prizePool) <= 0}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  txPending || !isLeader || parseFloat(prizePool) <= 0
                    ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'bg-amber-500 text-white shadow-md shadow-amber-200/50 dark:shadow-amber-900/20 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200/60 dark:hover:shadow-amber-900/30 hover:-translate-y-0.5 active:translate-y-0 border border-amber-400/30'
                }`}
              >
                {txPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    处理中…
                  </span>
                ) : `💰 提取奖池 (${parseFloat(prizePool) > 0 ? prizePool : '0'} ETH)`}
              </button>

              {mode === 'practice' && (
                <button
                  onClick={() => {
                    setGrid(Array.from({ length: GRID }, () => Array(GRID).fill(null).map(() => ({ ...EMPTY_CELL }))));
                    setPrizePool('0');
                    setLeaderAddr('');
                    setLeaderNick('');
                    setTotalPaints(0);
                    setActivities([]);
                    setPlayers([]);
                  }}
                  className="w-full py-2.5 rounded-xl font-medium text-sm bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition border border-slate-200 dark:border-slate-700/30 hover:border-slate-300 dark:hover:border-slate-600/50"
                >
                  重置画布
                </button>
              )}
            </div>

            {/* Leader status */}
            {isLeader && parseFloat(prizePool) > 0 && (
              <div className="mt-4 p-3 bg-amber-50/80 dark:bg-amber-900/10 rounded-xl border border-amber-200/40 dark:border-amber-700/20">
                <p className="text-xs text-amber-700 dark:text-amber-400 text-center font-medium leading-relaxed">
                  👑 当前领先 · 趁他人未动，提取奖池！
                </p>
              </div>
            )}
          </div>

          {/* Active Players */}
          <div className="glass-card rounded-2xl p-5">
            <h4 className="font-serif text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 tracking-wide">
              玩家
              <span className="ml-1.5 text-[11px] font-sans font-normal text-slate-400">({players.length})</span>
            </h4>
            {players.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-2xl mb-2 opacity-50">🎨</div>
                <p className="text-xs text-slate-400">尚无涂鸦</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1 -mr-1">
                {[...players].sort((a, b) => b.paints - a.paints).map(p => {
                  const isMe = p.wallet === (walletAddr || '0xPlayer');
                  const isLeading = p.wallet === leaderAddr;
                  return (
                    <div key={p.wallet} className={`flex items-center justify-between py-2 px-2.5 rounded-xl text-xs transition-colors ${
                      isLeading ? 'bg-amber-50/70 dark:bg-amber-900/10 ring-1 ring-amber-200/50 dark:ring-amber-700/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                          isLeading
                            ? 'bg-amber-500 shadow-sm'
                            : 'bg-indigo-500'
                        }`}>
                          {p.nickname[0]}
                        </div>
                        <span className={`truncate max-w-[120px] ${isMe ? 'font-semibold text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                          {p.nickname}
                          {isMe && <span className="text-[10px] text-slate-400 font-normal ml-0.5">(你)</span>}
                        </span>
                        {isLeading && <span className="text-xs">👑</span>}
                      </div>
                      <span className="text-slate-400 text-[11px] font-medium shrink-0 ml-2">{p.paints} 次</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="glass-card rounded-2xl p-5">
            <h4 className="font-serif text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 tracking-wide">动态</h4>
            {activities.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">暂无动态</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 -mr-1">
                {activities.slice(0, 30).map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1.5 text-xs border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <span className="shrink-0 mt-0.5 text-sm">
                      {a.type === 'paint' ? '🎨' : a.type === 'withdraw' ? '💰' : '👋'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{a.nick}</span>
                      <span className="text-slate-400"> {a.detail}</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600 shrink-0 ml-auto text-[10px]">{formatTime(a.time)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status toasts */}
      {successMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-7 py-3.5 rounded-2xl shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/20 text-sm font-medium tracking-wide backdrop-blur-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-7 py-3.5 rounded-2xl shadow-xl shadow-red-200/40 dark:shadow-red-900/20 text-sm font-medium tracking-wide backdrop-blur-sm">
          {error}
        </div>
      )}
    </div>
  );
}
