'use client';

import { useRef, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { CHARACTERS } from "./dino-chars";

const SCALE = 1.5;
const W = 700;
const H = 250;
const GROUND_Y = 180;
const GRAVITY = 0.55;
const JUMP_VEL = -10.5;
const BASE_SPEED = 5;

interface Cactus {
  x: number;
  w: number;
  h: number;
}

interface Coin {
  x: number;
  y: number;
  r: number;
  collected: boolean;
}

interface Snake {
  x: number;
  w: number;
  h: number;
}

interface LBEntry {
  rank: number;
  nickname: string;
  score: number;
  date: string;
}

const MEDAL = ["🥇", "🥈", "🥉"];

function getSavedChar(): string {
  if (typeof window === "undefined") return "girl";
  return localStorage.getItem("dino-char") || "girl";
}

export default function DinoGame() {
  const { user, token } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"idle" | "playing" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [charId, setCharId] = useState("girl");
  const [lb, setLb] = useState<LBEntry[]>([]);
  const [showBoard, setShowBoard] = useState(false);
  const [coinCount, setCoinCount] = useState(0);
  const drawFnRef = useRef(
    CHARACTERS.find((c) => c.id === charId)?.draw || CHARACTERS[0].draw
  );
  const animRef = useRef(0);

  // Keep draw ref in sync without triggering game-loop restart
  useEffect(() => {
    const c = CHARACTERS.find((c) => c.id === charId);
    if (c) drawFnRef.current = c.draw;
  }, [charId]);

  const g = useRef({
    player: { x: 55, y: GROUND_Y, vy: 0, w: 32, h: 42, grounded: true, legPhase: 0 },
    cacti: [] as Cactus[],
    snakes: [] as Snake[],
    coins: [] as Coin[],
    clouds: [] as { x: number; y: number; w: number }[],
    speed: BASE_SPEED,
    score: 0,
    coinsCollected: 0,
    groundOffset: 0,
    frame: 0,
    cactusTimer: 0,
    snakeTimer: 0,
    coinTimer: 0,
    running: false,
  });

  // Load saved prefs + leaderboard
  useEffect(() => {
    const saved = localStorage.getItem("dino-best");
    if (saved) setBest(parseInt(saved, 10));
    setCharId(getSavedChar());
    fetch("/api/game/score")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLb(data); })
      .catch(() => {});
  }, []);

  const startGame = useCallback(() => {
    const s = g.current;
    s.player.y = GROUND_Y;
    s.player.vy = 0;
    s.player.grounded = true;
    s.player.legPhase = 0;
    s.cacti = [];
    s.snakes = [];
    s.coins = [];
    s.clouds = [];
    s.speed = BASE_SPEED;
    s.score = 0;
    s.coinsCollected = 0;
    s.groundOffset = 0;
    s.frame = 0;
    s.cactusTimer = 0;
    s.snakeTimer = 0;
    s.coinTimer = 0;
    s.running = true;
    setScore(0);
    setCoinCount(0);
    setState("playing");
  }, []);

  const jump = useCallback(() => {
    if (state === "idle") return startGame();
    if (state === "dead") return startGame();
    const s = g.current;
    if (s.player.grounded) {
      s.player.vy = JUMP_VEL;
      s.player.grounded = false;
    }
  }, [state, startGame]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [jump]);

  // Switch character
  const switchChar = useCallback(() => {
    const s = g.current;
    if (s.running) return; // don't switch mid-game
    const current = getSavedChar();
    const idx = CHARACTERS.findIndex((c) => c.id === current);
    const next = CHARACTERS[(idx + 1) % CHARACTERS.length];
    localStorage.setItem("dino-char", next.id);
    setCharId(next.id);
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const s = g.current;
      const p = s.player;

      // --- UPDATE ---
      if (s.running) {
        if (!p.grounded) {
          p.vy += GRAVITY;
          p.y += p.vy;
          if (p.y >= GROUND_Y) {
            p.y = GROUND_Y;
            p.vy = 0;
            p.grounded = true;
          }
        }
        p.legPhase += 0.2;

        s.score += Math.floor(s.speed * 0.4 + 0.5);
        if (s.frame % 60 === 0) {
          setScore(s.score);
          s.speed = Math.min(s.speed + 0.12, 13);
        }

        // --- Spawn cacti ---
        s.cactusTimer--;
        if (s.cactusTimer <= 0) {
          const h = 22 + Math.random() * 28;
          s.cacti.push({ x: W + 10, w: 10 + Math.random() * 8, h });
          s.cactusTimer = 50 + Math.floor(Math.random() * 90);
        }
        // Spawn snakes
        s.snakeTimer--;
        if (s.snakeTimer <= 0) {
          s.snakes.push({ x: W + 20, w: 35 + Math.random() * 20, h: 12 + Math.random() * 6 });
          s.snakeTimer = 80 + Math.floor(Math.random() * 120);
        }
        // Spawn coins
        s.coinTimer--;
        if (s.coinTimer <= 0) {
          s.coins.push({
            x: W + 20,
            y: GROUND_Y - 50 - Math.random() * 50,
            r: 7,
            collected: false,
          });
          s.coinTimer = 30 + Math.floor(Math.random() * 80);
        }

        // Move cacti
        for (let i = s.cacti.length - 1; i >= 0; i--) {
          s.cacti[i].x -= s.speed;
          if (s.cacti[i].x + s.cacti[i].w < -10) s.cacti.splice(i, 1);
        }
        // Move snakes
        for (let i = s.snakes.length - 1; i >= 0; i--) {
          s.snakes[i].x -= s.speed;
          if (s.snakes[i].x + s.snakes[i].w < -20) s.snakes.splice(i, 1);
        }
        // Move coins
        for (let i = s.coins.length - 1; i >= 0; i--) {
          s.coins[i].x -= s.speed;
          if (s.coins[i].x + s.coins[i].r * 2 < -10) s.coins.splice(i, 1);
        }

        if (s.frame % 180 === 0) {
          s.clouds.push({ x: W + 20, y: 20 + Math.random() * 50, w: 40 + Math.random() * 50 });
        }
        for (let i = s.clouds.length - 1; i >= 0; i--) {
          s.clouds[i].x -= s.speed * 0.25;
          if (s.clouds[i].x + s.clouds[i].w < -20) s.clouds.splice(i, 1);
        }

        s.groundOffset = (s.groundOffset - s.speed) % 20;
        s.frame++;

        const left = p.x + 4;
        const right = p.x + p.w - 4;
        const top = p.y - p.h + 8;
        const bottom = p.y - 4;

        // Collision: cacti → game over
        for (const c of s.cacti) {
          const cactusTop = GROUND_Y - c.h;
          if (
            left < c.x + c.w - 2 && right > c.x + 2 &&
            top < cactusTop + c.h - 2 && bottom > cactusTop + 2
          ) {
            doGameOver(s, p);
            break;
          }
        }
        // Collision: snakes → game over
        for (const sn of s.snakes) {
          const snakeTop = GROUND_Y - sn.h;
          if (
            left < sn.x + sn.w - 2 && right > sn.x + 2 &&
            top < snakeTop + sn.h - 2 && bottom > snakeTop + 2
          ) {
            doGameOver(s, p);
            break;
          }
        }
        // Collision: coins → collect
        for (const coin of s.coins) {
          if (coin.collected) continue;
          const dx = (p.x + p.w / 2) - coin.x;
          const dy = (p.y - p.h / 2) - coin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < coin.r + 14) {
            coin.collected = true;
            s.coinsCollected++;
            s.score += 100;
            setCoinCount(s.coinsCollected);
          }
        }
      }

      // Game over helper
      function doGameOver(state: typeof s, player: typeof p) {
        if (!state.running) return;
        state.running = false;
        setState("dead");
        const finalScore = state.score;
        setScore(finalScore);
        if (finalScore > (parseInt(localStorage.getItem("dino-best") || "0", 10) || best)) {
          setBest(finalScore);
          localStorage.setItem("dino-best", String(finalScore));
        }
        if (finalScore > 0 && token) {
          fetch("/api/game/score", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ score: finalScore }),
          })
            .then(() => fetch("/api/game/score")
              .then((r) => r.json())
              .then((data) => { if (Array.isArray(data)) setLb(data); })
              .catch(() => {}))
            .catch(() => {});
        }
      }

      // --- RENDER ---
      ctx.save();
      ctx.scale(SCALE, SCALE);
      ctx.clearRect(0, 0, W, H);

      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#e0f2fe");
      grad.addColorStop(1, "#bae6fd");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Clouds
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (const c of s.clouds) {
        ctx.beginPath();
        ctx.ellipse(c.x + c.w / 2, c.y, c.w / 2, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x + c.w * 0.3, c.y - 6, c.w * 0.3, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();

      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;
      for (let x = s.groundOffset; x < W; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y + 6);
        ctx.lineTo(x + 10, GROUND_Y + 6);
        ctx.stroke();
      }

      // --- Cacti ---
      for (const c of s.cacti) {
        ctx.fillStyle = "#059669";
        const r = 3;
        const cx = c.x,
          cy = GROUND_Y - c.h;
        ctx.beginPath();
        ctx.moveTo(cx + r, cy);
        ctx.lineTo(cx + c.w - r, cy);
        ctx.quadraticCurveTo(cx + c.w, cy, cx + c.w, cy + r);
        ctx.lineTo(cx + c.w, cy + c.h);
        ctx.lineTo(cx, cy + c.h);
        ctx.lineTo(cx, cy + r);
        ctx.quadraticCurveTo(cx, cy, cx + r, cy);
        ctx.fill();
        ctx.fillRect(cx - 3, cy + 6, 4, 9);
        ctx.fillRect(cx + c.w - 1, cy + 10, 4, 9);
      }

      // --- Snakes ---
      for (const sn of s.snakes) {
        const snY = GROUND_Y - sn.h;
        const wave = Math.sin(s.frame * 0.08) * 3;
        // Body segments
        const segs = Math.floor(sn.w / 6);
        for (let i = 0; i < segs; i++) {
          const sx = sn.x + i * 6 + wave * Math.sin(i * 0.8);
          const syY = snY + 2 + Math.sin(i * 0.5 + s.frame * 0.05) * 2;
          ctx.fillStyle = i === segs - 1 ? "#065f46" : "#047857";
          ctx.beginPath();
          ctx.arc(sx + 3, syY + 4, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Head
        ctx.fillStyle = "#065f46";
        ctx.fillRect(sn.x + sn.w - 6, snY - 2, 10, 9);
        // Eyes
        ctx.fillStyle = "#fff";
        ctx.fillRect(sn.x + sn.w - 3, snY + 1, 3, 3);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(sn.x + sn.w - 2, snY + 2, 2, 2);
      }

      // --- Coins ---
      for (const coin of s.coins) {
        if (coin.collected) continue;
        const bob = Math.sin(s.frame * 0.06 + coin.x) * 3;
        const cy = coin.y + bob;
        const pulse = 1 + Math.sin(s.frame * 0.08 + coin.x) * 0.15;

        // Glow
        ctx.beginPath();
        ctx.arc(coin.x, cy, coin.r * pulse + 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(251, 191, 36, 0.25)";
        ctx.fill();

        // Coin body
        ctx.beginPath();
        ctx.arc(coin.x, cy, coin.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = "#FBBF24";
        ctx.fill();
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 2;
        ctx.stroke();

        // $ symbol
        ctx.fillStyle = "#B45309";
        ctx.font = "bold 10px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", coin.x, cy + 0.5);
      }

      // --- Character ---
      drawFnRef.current(
        ctx,
        p.x,
        p.y,
        p.w,
        p.h,
        p.legPhase,
        p.grounded
      );

      // --- HUD ---
      ctx.fillStyle = "#0369a1";
      ctx.font = "bold 15px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`Score: ${s.score}`, W - 16, 28);
      // Coin count
      if (s.coinsCollected > 0) {
        ctx.fillStyle = "#F59E0B";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.fillText(`🪙 ${s.coinsCollected}`, W - 16, 48);
      }
      if (best > 0) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText(`Best: ${best}`, W - 16, s.coinsCollected > 0 ? 65 : 48);
      }

      // --- Overlays ---
      if (s.frame === 0 || (!s.running && s.frame < 5)) {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#0369a1";
        ctx.font = "bold 22px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("小蓝和她的朋友们", W / 2, H / 2 - 16);
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Press Space / Tap to Start", W / 2, H / 2 + 18);
      }

      if (!s.running && s.frame > 5) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", W / 2, H / 2 - 15);
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillText("Press Space or Tap to Restart", W / 2, H / 2 + 18);
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [best]);

  return (
    <div className="glass-card rounded-xl">
      <div className="px-6 pt-5 pb-3 border-b border-sky-100 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-sky-900 dark:text-white">
            🏃‍♂️ 小蓝和她的朋友们
          </h3>
          <p className="text-sm text-foreground/50 mt-0.5">
            Jump over cacti &amp; snakes, collect 🪙 coins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBoard((v) => !v)}
            className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition
              ${showBoard
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                : "text-foreground/50 hover:text-amber-600 dark:hover:text-amber-400"
              }`}
            title="Leaderboard"
          >
            🏆 {showBoard ? "Hide" : "Scores"}
          </button>
          <div className="flex gap-1 bg-sky-50 dark:bg-slate-700 rounded-lg p-0.5">
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                onClick={switchChar}
                disabled={g.current.running}
                title={char.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition
                  ${
                    charId === char.id
                      ? "bg-white dark:bg-slate-600 text-sky-700 dark:text-sky-200 shadow-sm"
                      : "text-sky-500 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-200"
                  }
                  ${g.current.running ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {char.icon}
                {char.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={Math.round(W * SCALE)}
        height={Math.round(H * SCALE)}
        className="w-full cursor-pointer select-none"
        style={{ imageRendering: "pixelated" }}
        onClick={jump}
        onTouchEnd={(e) => {
          e.preventDefault();
          jump();
        }}
      />

      {/* Leaderboard */}
      {showBoard && (
        <div className="border-t border-sky-100 dark:border-slate-700 px-6 py-4">
          <h4 className="text-sm font-semibold text-sky-900 dark:text-white mb-3">
            🏆 Leaderboard
          </h4>
          {lb.length === 0 ? (
            <p className="text-sm text-foreground/40 text-center py-4">
              {user
                ? "No scores yet. Play a round to get on the board!"
                : "Login to save your scores and see the leaderboard!"}
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {lb.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    ${
                      user && entry.nickname === user.nickname
                        ? "bg-sky-100 dark:bg-sky-900/40 ring-1 ring-sky-300 dark:ring-sky-700"
                        : "bg-sky-50/50 dark:bg-slate-700/50"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-bold text-foreground/40 shrink-0">
                      {entry.rank <= 3 ? MEDAL[entry.rank - 1] : `#${entry.rank}`}
                    </span>
                    <span className="font-medium text-foreground/80 truncate">
                      {entry.nickname}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-sky-800 dark:text-sky-200">
                      {entry.score.toLocaleString()}
                    </span>
                    {entry.date && (
                      <span className="text-xs text-foreground/40 hidden sm:inline">
                        {entry.date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
