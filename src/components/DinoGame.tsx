'use client';

import { useRef, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { CHARACTERS } from "./dino-chars";

const SCALE = 3;
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
    player: { x: 55, y: GROUND_Y, vy: 0, w: 36, h: 48, grounded: true, legPhase: 0 },
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

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, "#dbeafe");
      skyGrad.addColorStop(0.5, "#e0f2fe");
      skyGrad.addColorStop(1, "#f0f9ff");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Distant mountains
      ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      for (let x = 0; x <= W; x += 8) {
        const y = GROUND_Y - 22 - Math.sin(x * 0.005) * 18 - Math.sin(x * 0.013) * 10 - Math.sin(x * 0.025) * 5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      // Second mountain range (closer, slightly darker)
      ctx.fillStyle = "rgba(148, 163, 184, 0.08)";
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      for (let x = 0; x <= W; x += 8) {
        const y = GROUND_Y - 14 - Math.sin(x * 0.008 + 1) * 12 - Math.sin(x * 0.02 + 3) * 6;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      // Clouds — fluffy multi-circle
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      for (const c of s.clouds) {
        ctx.beginPath();
        ctx.arc(c.x + c.w * 0.25, c.y + 3, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c.x + c.w * 0.75, c.y + 3, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c.x + c.w * 0.5, c.y - 1, 13, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground — grass strip + dirt
      ctx.fillStyle = "#86efac";
      ctx.fillRect(0, GROUND_Y - 2, W, 5);
      const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
      groundGrad.addColorStop(0, "#cbd5e1");
      groundGrad.addColorStop(1, "#94a3b8");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, GROUND_Y + 3, W, H - GROUND_Y - 3);

      // Ground line shadow
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + 1);
      ctx.lineTo(W, GROUND_Y + 1);
      ctx.stroke();

      // Ground dashes
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([15, 10]);
      ctx.beginPath();
      ctx.moveTo(s.groundOffset % 25, GROUND_Y + 10);
      ctx.lineTo(W, GROUND_Y + 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- Cacti — rounded with arms ---
      for (const c of s.cacti) {
        const cy = GROUND_Y - c.h;

        // Main body — rounded rect
        ctx.fillStyle = "#059669";
        ctx.beginPath();
        const r = 4;
        ctx.moveTo(c.x + r, cy);
        ctx.lineTo(c.x + c.w - r, cy);
        ctx.quadraticCurveTo(c.x + c.w, cy, c.x + c.w, cy + r);
        ctx.lineTo(c.x + c.w, cy + c.h);
        ctx.lineTo(c.x, cy + c.h);
        ctx.lineTo(c.x, cy + r);
        ctx.quadraticCurveTo(c.x, cy, c.x + r, cy);
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(c.x + 2, cy + 3, 3, c.h - 6);

        // Left arm
        ctx.fillRect(c.x - 3, cy + 6, 4, 8);
        ctx.beginPath();
        ctx.arc(c.x - 2, cy + 6, 3, 0, Math.PI * 2);
        ctx.fill();

        // Right arm
        ctx.fillRect(c.x + c.w - 1, cy + 10, 4, 8);
        ctx.beginPath();
        ctx.arc(c.x + c.w + 1, cy + 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Top flower (random)
        if (c.h > 35) {
          ctx.fillStyle = "#FBBF24";
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const fx = c.x + c.w / 2 + Math.cos(angle) * 3;
            const fy = cy - 2 + Math.sin(angle) * 3;
            ctx.lineTo(fx, fy);
          }
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#F59E0B";
          ctx.beginPath();
          ctx.arc(c.x + c.w / 2, cy - 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Snakes — smooth animated body ---
      for (const sn of s.snakes) {
        const snY = GROUND_Y - sn.h;
        const wave = Math.sin(s.frame * 0.06) * 4;

        // Body — smooth path
        ctx.strokeStyle = "#047857";
        ctx.lineWidth = sn.h * 0.7;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let i = 0; i < sn.w; i += 3) {
          const sx = sn.x + i;
          const sy = snY + 3 + Math.sin(i * 0.08 + s.frame * 0.04) * wave;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Head
        const headX = sn.x + sn.w - 2;
        const headY = snY + 3 + Math.sin(sn.w * 0.08 + s.frame * 0.04) * wave;
        ctx.fillStyle = "#065f46";
        ctx.beginPath();
        ctx.arc(headX, headY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(headX + 2, headY - 1.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headX + 2, headY + 1.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(headX + 3, headY - 1.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headX + 3, headY + 1.5, 1, 0, Math.PI * 2);
        ctx.fill();

        // Tongue
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headX + 5, headY);
        ctx.lineTo(headX + 10, headY - 1);
        ctx.moveTo(headX + 10, headY - 1);
        ctx.lineTo(headX + 9, headY - 2);
        ctx.moveTo(headX + 10, headY - 1);
        ctx.lineTo(headX + 9, headY);
        ctx.stroke();
      }

      // --- Coins — star-shaped with glow ---
      for (const coin of s.coins) {
        if (coin.collected) continue;
        const bob = Math.sin(s.frame * 0.06 + coin.x) * 3;
        const cy = coin.y + bob;
        const pulse = 1 + Math.sin(s.frame * 0.08 + coin.x) * 0.12;

        const radius = coin.r * pulse;

        // Glow
        const glow = ctx.createRadialGradient(coin.x, cy, 0, coin.x, cy, radius + 6);
        glow.addColorStop(0, "rgba(251, 191, 36, 0.3)");
        glow.addColorStop(1, "rgba(251, 191, 36, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(coin.x, cy, radius + 6, 0, Math.PI * 2);
        ctx.fill();

        // Star shape
        ctx.fillStyle = "#FBBF24";
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI * 2) / 10 - Math.PI / 2;
          const r2 = i % 2 === 0 ? radius : radius * 0.45;
          const sx = coin.x + Math.cos(angle) * r2;
          const sy = cy + Math.sin(angle) * r2;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();

        // Center sparkle
        ctx.fillStyle = "#FEF3C7";
        ctx.beginPath();
        ctx.arc(coin.x, cy, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Character shadow on ground ---
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2, p.y + 2, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

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

      // --- HUD (with background) ---
      // Score
      const hudW = Math.min(W - 20, 100);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.roundRect(W - hudW - 8, 8, hudW, best > 0 ? 40 : 24, 8);
      ctx.fill();

      ctx.fillStyle = "#0369a1";
      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(`★ ${s.score.toLocaleString()}`, W - 14, 12);
      if (best > 0) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "8px system-ui, sans-serif";
        ctx.fillText(`Best ${best.toLocaleString()}`, W - 14, 28);
      }

      if (s.coinsCollected > 0) {
        ctx.fillStyle = "#F59E0B";
        ctx.font = "9px system-ui, sans-serif";
        ctx.fillText(`🪙 ${s.coinsCollected}`, W - 14, best > 0 ? 44 : 34);
        ctx.textBaseline = "alphabetic";
      }

      ctx.textBaseline = "alphabetic";

      // --- Overlays ---
      if (s.frame === 0 || (!s.running && s.frame < 5)) {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#0369a1";
        ctx.font = "bold 15px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Sky Dash", W / 2, H / 2 - 12);
        ctx.font = "10px system-ui, sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Press Space / Tap to Start", W / 2, H / 2 + 12);
        ctx.textBaseline = "alphabetic";
      }

      if (!s.running && s.frame > 5) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Game Over", W / 2, H / 2 - 14);
        ctx.font = "10px system-ui, sans-serif";
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 6);
        ctx.font = "9px system-ui, sans-serif";
        ctx.fillText("Press Space or Tap to Restart", W / 2, H / 2 + 24);
        ctx.textBaseline = "alphabetic";
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
            ☁️ Sky Dash
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
        style={{ background: "#f0f9ff", borderRadius: "0 0 0.75rem 0.75rem" }}
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
