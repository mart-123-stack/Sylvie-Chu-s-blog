'use client';

import { useRef, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

// ─── Constants ───
const SCALE = 3;
const W = 700;
const H = 250;
const GRAVITY = 0.35;
const THRUST_VEL = -7;
const BASE_SPEED = 3;
const MAX_SPEED = 10;
const SHIP_X = 85;

// ─── Types ───
interface Asteroid {
  x: number;
  y: number;
  size: number;
  rot: number;
  rotSpeed: number;
  verts: { a: number; r: number }[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface Popup {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  rgb: string;
  alpha: number;
  speed: number;
}

interface LBEntry {
  rank: number;
  nickname: string;
  avatar_url?: string;
  score: number;
  date: string;
}

// ─── Helpers ───
function genAsteroidVerts(size: number) {
  const n = 8 + Math.floor(Math.random() * 6);
  const verts: { a: number; r: number }[] = [];
  for (let i = 0; i < n; i++)
    verts.push({ a: (i / n) * Math.PI * 2, r: size * (0.6 + Math.random() * 0.4) });
  return verts;
}

function initStars(): Star[] {
  const s: Star[] = [];
  for (let i = 0; i < 120; i++)
    s.push({ x: Math.random() * W, y: Math.random() * H, size: 0.3 + Math.random() * 0.5, alpha: 0.12 + Math.random() * 0.28, speed: 0.1 + Math.random() * 0.12 });
  for (let i = 0; i < 60; i++)
    s.push({ x: Math.random() * W, y: Math.random() * H, size: 0.5 + Math.random() * 0.7, alpha: 0.25 + Math.random() * 0.35, speed: 0.3 + Math.random() * 0.25 });
  for (let i = 0; i < 25; i++)
    s.push({ x: Math.random() * W, y: Math.random() * H, size: 0.8 + Math.random() * 1.0, alpha: 0.4 + Math.random() * 0.4, speed: 0.6 + Math.random() * 0.4 });
  return s;
}

function initNebula(): Nebula[] {
  return [
    { x: Math.random() * W, y: Math.random() * H * 0.6 + 10, radius: 60 + Math.random() * 40, rgb: '56,189,248', alpha: 0.04 + Math.random() * 0.04, speed: 0.06 + Math.random() * 0.04 },
    { x: Math.random() * W, y: 20 + Math.random() * (H - 40), radius: 50 + Math.random() * 30, rgb: '192,132,252', alpha: 0.03 + Math.random() * 0.03, speed: 0.05 + Math.random() * 0.03 },
    { x: Math.random() * W, y: Math.random() * H * 0.5 + H * 0.25, radius: 50 + Math.random() * 30, rgb: '14,165,233', alpha: 0.03 + Math.random() * 0.02, speed: 0.07 + Math.random() * 0.04 },
  ];
}

// ─── Drawing Functions ───

function drawSpaceBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, W, H);
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], speed: number, speedT: number) {
  const warpIntensity = Math.min(speedT * 1.5, 1);

  for (const star of stars) {
    const stretch = star.speed > 0.5 ? 1 + warpIntensity * 12 * (star.speed / 1.5) : 1;

    if (stretch > 2) {
      ctx.strokeStyle = `rgba(255,255,255,${star.alpha * 0.7})`;
      ctx.lineWidth = star.size * 0.5;
      ctx.beginPath();
      ctx.moveTo(star.x - stretch * 2, star.y);
      ctx.lineTo(star.x + stretch * 2, star.y);
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawNebula(ctx: CanvasRenderingContext2D, nebula: Nebula[]) {
  for (const n of nebula) {
    const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
    grad.addColorStop(0, `rgba(${n.rgb},${n.alpha})`);
    grad.addColorStop(0.5, `rgba(${n.rgb},${n.alpha * 0.5})`);
    grad.addColorStop(1, `rgba(${n.rgb},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateStars(stars: Star[], speed: number) {
  for (const star of stars) {
    star.x -= speed * star.speed;
    if (star.x < -5) {
      star.x = W + 5;
      star.y = Math.random() * H;
    }
  }
}

function updateNebula(nebula: Nebula[], speed: number) {
  for (const n of nebula) {
    n.x -= speed * n.speed;
    if (n.x + n.radius < -10) {
      n.x = W + n.radius + Math.random() * 50;
      n.y = Math.random() * H;
    }
  }
}

function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, hw: number, hh: number, boosting: boolean, bob: number) {
  ctx.save();

  const by = y + bob;

  // ── Engine flame ──
  const flameLen = hw * (boosting ? 0.55 : 0.25 + Math.random() * 0.1);
  const fGrad = ctx.createLinearGradient(x - hw + 4, by, x - hw - flameLen, by);
  fGrad.addColorStop(0, 'rgba(56,189,248,0.9)');
  fGrad.addColorStop(0.3, 'rgba(14,165,233,0.5)');
  fGrad.addColorStop(0.6, 'rgba(14,165,233,0.2)');
  fGrad.addColorStop(1, 'rgba(14,165,233,0)');
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(x - hw + 4, by - hh * 0.2);
  ctx.lineTo(x - hw - flameLen, by);
  ctx.lineTo(x - hw + 4, by + hh * 0.2);
  ctx.closePath();
  ctx.fill();

  // Inner bright core
  if (boosting) {
    ctx.fillStyle = 'rgba(186,230,253,0.6)';
    ctx.beginPath();
    ctx.moveTo(x - hw + 4, by - hh * 0.08);
    ctx.lineTo(x - hw - flameLen * 0.5, by);
    ctx.lineTo(x - hw + 4, by + hh * 0.08);
    ctx.closePath();
    ctx.fill();
  }

  // ── Engine glow ──
  const gGrad = ctx.createRadialGradient(x - hw, by, 0, x - hw, by, hw * 0.5);
  gGrad.addColorStop(0, 'rgba(56,189,248,0.3)');
  gGrad.addColorStop(1, 'rgba(14,165,233,0)');
  ctx.fillStyle = gGrad;
  ctx.beginPath();
  ctx.arc(x - hw, by, hw * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // ── Ship body: sleek teardrop ──
  const nx = x + hw;
  const rx = x - hw;

  ctx.beginPath();
  ctx.moveTo(nx, by);
  ctx.bezierCurveTo(
    nx - hw * 0.35, by - hh * 0.9,
    rx + hw * 0.25, by - hh * 1.05,
    rx + hw * 0.05, by - hh * 0.5
  );
  ctx.lineTo(rx - hw * 0.08, by);
  ctx.lineTo(rx + hw * 0.05, by + hh * 0.5);
  ctx.bezierCurveTo(
    rx + hw * 0.25, by + hh * 1.05,
    nx - hw * 0.35, by + hh * 0.9,
    nx, by
  );
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(x, by - hh, x, by + hh);
  bodyGrad.addColorStop(0, '#f8fafc');
  bodyGrad.addColorStop(0.3, '#e2e8f0');
  bodyGrad.addColorStop(0.6, '#cbd5e1');
  bodyGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(148,163,184,0.35)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // ── Panel line detail ──

  // ── Panel line detail ──
  ctx.strokeStyle = 'rgba(148,163,184,0.15)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - hw * 0.35, by - hh * 0.7);
  ctx.lineTo(x + hw * 0.4, by - hh * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - hw * 0.35, by + hh * 0.7);
  ctx.lineTo(x + hw * 0.4, by + hh * 0.05);
  ctx.stroke();

  // ── Cockpit ──
  const cx = x + hw * 0.2;
  ctx.beginPath();
  ctx.ellipse(cx, by, hw * 0.13, hh * 0.42, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0c4a6e';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx, by, hw * 0.14, hh * 0.44, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(56,189,248,0.25)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Cockpit glass reflection
  ctx.beginPath();
  ctx.ellipse(cx - 0.5, by - hh * 0.1, hw * 0.06, hh * 0.16, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56,189,248,0.4)';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx - 0.5, by - hh * 0.05, hw * 0.03, hh * 0.08, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(186,230,253,0.6)';
  ctx.fill();

  // ── Nose cone accent ──
  ctx.beginPath();
  ctx.moveTo(nx - 2, by - hh * 0.15);
  ctx.lineTo(nx, by);
  ctx.lineTo(nx - 2, by + hh * 0.15);
  ctx.strokeStyle = 'rgba(148,163,184,0.2)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

function emitIonTrail(particles: Particle[], x: number, y: number, hw: number, hh: number, speed: number) {
  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x - hw + 2 + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * hh * 0.6,
      vx: -(0.3 + Math.random() * 0.8) - speed * 0.05,
      vy: (Math.random() - 0.5) * 0.3,
      life: 18 + Math.random() * 14,
      maxLife: 32,
      size: 1.5 + Math.random() * 2.5,
      color: Math.random() > 0.5 ? '56,189,248' : '14,165,233',
    });
  }
}

function drawIonTrail(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const t = p.life / p.maxLife;
    ctx.globalAlpha = t * 0.5;
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (0.5 + t * 0.5));
    grad.addColorStop(0, `rgba(${p.color},0.7)`);
    grad.addColorStop(0.6, `rgba(${p.color},0.2)`);
    grad.addColorStop(1, `rgba(${p.color},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.5 + t * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawAsteroid(ctx: CanvasRenderingContext2D, a: Asteroid) {
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rot);

  // Outer glow
  ctx.strokeStyle = 'rgba(56,189,248,0.1)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < a.verts.length; i++) {
    const v = a.verts[i];
    if (i === 0) ctx.moveTo(Math.cos(v.a) * (v.r + 3), Math.sin(v.a) * (v.r + 3));
    else ctx.lineTo(Math.cos(v.a) * (v.r + 3), Math.sin(v.a) * (v.r + 3));
  }
  ctx.closePath();
  ctx.stroke();

  // Body fill
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  for (let i = 0; i < a.verts.length; i++) {
    const v = a.verts[i];
    if (i === 0) ctx.moveTo(Math.cos(v.a) * v.r, Math.sin(v.a) * v.r);
    else ctx.lineTo(Math.cos(v.a) * v.r, Math.sin(v.a) * v.r);
  }
  ctx.closePath();
  ctx.fill();

  // Glow border
  ctx.strokeStyle = 'rgba(56,189,248,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Subtle surface detail
  ctx.strokeStyle = 'rgba(148,163,184,0.08)';
  ctx.lineWidth = 0.5;
  const idx = Math.floor(a.verts.length * 0.25);
  if (a.verts[idx]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a.verts[idx].a) * a.verts[idx].r * 0.5, Math.sin(a.verts[idx].a) * a.verts[idx].r * 0.5);
    ctx.stroke();
  }

  ctx.restore();
}

function collision(sx: number, sy: number, sw: number, sh: number, ax: number, ay: number, ar: number) {
  const cx = Math.max(sx, Math.min(ax, sx + sw));
  const cy = Math.max(sy, Math.min(ay, sy + sh));
  const dx = ax - cx;
  const dy = ay - cy;
  return dx * dx + dy * dy < ar * ar;
}

// ─── Main Component ───
export default function DinoGame() {
  const { user, token } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'idle' | 'playing' | 'dead'>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lb, setLb] = useState<LBEntry[]>([]);
  const [showBoard, setShowBoard] = useState(false);
  const animRef = useRef(0);

  const g = useRef({
    ship: { x: SHIP_X, y: H / 2, vy: 0, hw: 22, hh: 9 },
    asteroids: [] as Asteroid[],
    particles: [] as Particle[],
    popups: [] as Popup[],
    stars: initStars(),
    nebula: initNebula(),
    speed: BASE_SPEED,
    score: 0,
    frame: 0,
    spawnTimer: 0,
    running: false,
    speedT: 0,
  });

  const fetchLeaderboard = useCallback(() => {
    fetch('/api/game/score')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLb(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('dino-best');
    if (saved) setBest(parseInt(saved, 10));
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Auto-refresh leaderboard while panel is open
  useEffect(() => {
    if (!showBoard) return;
    const iv = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(iv);
  }, [showBoard, fetchLeaderboard]);

  const resetScene = useCallback(() => {
    const s = g.current;
    s.stars = initStars();
    s.nebula = initNebula();
  }, []);

  const startGame = useCallback(() => {
    const s = g.current;
    s.ship.y = H / 2;
    s.ship.vy = 0;
    s.asteroids = [];
    s.particles = [];
    s.popups = [];
    s.speed = BASE_SPEED;
    s.score = 0;
    s.speedT = 0;
    s.frame = 0;
    s.spawnTimer = 0;
    s.running = true;
    setScore(0);
    setState('playing');
  }, []);

  const jump = useCallback(() => {
    if (state === 'idle') { resetScene(); startGame(); return; }
    if (state === 'dead') { resetScene(); startGame(); return; }
    g.current.ship.vy = THRUST_VEL;
  }, [state, startGame, resetScene]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [jump]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = g.current;
      const p = s.ship;

      // ── UPDATE ──
      if (s.running) {
        p.vy += GRAVITY;
        p.y += p.vy;

        // Clamp to vertical bounds
        if (p.y - p.hh < 6) { p.y = p.hh + 6; p.vy = 0; }
        if (p.y + p.hh > H - 6) { p.y = H - p.hh - 6; p.vy = 0; }

        // Score
        s.score += Math.floor(s.speed * 0.4 + 0.5);
        if (s.frame % 60 === 0) setScore(s.score);

        // Speed up
        if (s.frame % 120 === 0) s.speed = Math.min(s.speed + 0.08, MAX_SPEED);
        s.speedT = (s.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);

        // Emit ion trail
        emitIonTrail(s.particles, p.x, p.y, p.hw, p.hh, s.speed);

        // Spawn asteroids
        s.spawnTimer--;
        if (s.spawnTimer <= 0) {
          const size = 8 + Math.random() * 10;
          s.asteroids.push({
            x: W + 20,
            y: 10 + Math.random() * (H - 10),
            size,
            rot: 0,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            verts: genAsteroidVerts(size),
          });
          s.spawnTimer = 35 + Math.floor(Math.random() * 50 - s.speedT * 15);
          if (s.spawnTimer < 18) s.spawnTimer = 18;
        }

        // Move asteroids
        for (let i = s.asteroids.length - 1; i >= 0; i--) {
          const a = s.asteroids[i];
          a.x -= s.speed + 0.5;
          a.rot += a.rotSpeed;
          if (a.x + a.size < -10) s.asteroids.splice(i, 1);
        }

        // Collision
        const shipLeft = p.x - p.hw * 0.65;
        const shipRight = p.x + p.hw * 0.65;
        const shipTop = p.y - p.hh * 0.65;
        const shipBottom = p.y + p.hh * 0.65;

        for (const a of s.asteroids) {
          if (collision(shipLeft, shipTop, shipRight - shipLeft, shipBottom - shipTop, a.x, a.y, a.size * 0.85)) {
            s.running = false;
            setState('dead');
            setScore(s.score);

            // Explosion particles
            for (let i = 0; i < 20; i++) {
              const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.5;
              const spd = 1 + Math.random() * 3;
              s.particles.push({
                x: p.x, y: p.y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 20 + Math.random() * 20,
                maxLife: 40,
                size: 2 + Math.random() * 3,
                color: Math.random() > 0.5 ? '56,189,248' : '186,230,253',
              });
            }
            for (let i = 0; i < 10; i++) {
              s.particles.push({
                x: p.x + (Math.random() - 0.5) * 20,
                y: p.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 15 + Math.random() * 15,
                maxLife: 30,
                size: 1 + Math.random() * 2,
                color: '255,255,255',
              });
            }

            // Best score
            const finalScore = s.score;
            if (finalScore > (parseInt(localStorage.getItem('dino-best') || '0', 10) || best)) {
              setBest(finalScore);
              localStorage.setItem('dino-best', String(finalScore));
            }
            if (finalScore > 0 && token) {
              console.log(`[DinoGame] Submitting score ${finalScore} for user ${user?.nickname}`);
              fetch('/api/game/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ score: finalScore }),
              })
                .then((r) => {
                  if (!r.ok) console.error(`[DinoGame] POST failed: ${r.status} ${r.statusText}`);
                  return r.json();
                })
                .then((data) => {
                  if (data.error) console.error(`[DinoGame] POST error: ${data.error}`);
                  else console.log(`[DinoGame] Score saved successfully`);
                })
                .catch((err) => console.error('[DinoGame] POST network error:', err));
            } else {
              if (!token) console.log('[DinoGame] No token — score not submitted');
              if (finalScore <= 0) console.log('[DinoGame] Score is 0 — not submitted');
            }

            // Always refresh leaderboard, regardless of POST outcome
            fetchLeaderboard();
            break;
          }
        }

        // Update popups
        for (let i = s.popups.length - 1; i >= 0; i--) {
          const pop = s.popups[i];
          pop.y -= 1;
          pop.life--;
          if (pop.life <= 0) s.popups.splice(i, 1);
        }

        s.frame++;
      }

      // Update particles (always, even when dead)
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.02;
        pt.life--;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      // Update stars and nebula (always, for living background)
      const bgSpeed = s.running ? s.speed : 0.3;
      updateStars(s.stars, bgSpeed);
      updateNebula(s.nebula, bgSpeed);

      // ── RENDER ──
      ctx.save();
      ctx.scale(SCALE, SCALE);
      ctx.clearRect(0, 0, W, H);

      // Deep space background
      drawSpaceBackground(ctx);

      // Far nebula
      drawNebula(ctx, s.nebula);

      // Stars (drawn in order: far = low speed = layer 1)
      drawStars(ctx, s.stars, bgSpeed, s.speedT);

      // Ion trail (behind ship)
      drawIonTrail(ctx, s.particles);

      // Asteroids
      for (const a of s.asteroids) drawAsteroid(ctx, a);

      // Ship
      const bob = !s.running ? Math.sin(s.frame * 0.03) * 2 : 0;
      const isBoosting = s.running && p.vy < -1;
      drawShip(ctx, p.x, p.y, p.hw, p.hh, isBoosting, bob);

      // Particles (on top)
      for (const pt of s.particles) {
        const t = pt.life / pt.maxLife;
        ctx.globalAlpha = t * 0.8;
        ctx.fillStyle = `rgba(${pt.color},${t})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * t, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Floating popups
      for (const pop of s.popups) {
        const t = pop.life / pop.maxLife;
        ctx.globalAlpha = t;
        ctx.fillStyle = pop.color;
        ctx.font = `bold ${pop.size}px system-ui,sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pop.text, pop.x, pop.y);
      }
      ctx.globalAlpha = 1;

      // ── HUD (playing) ──
      if (s.running) {
        const ly = s.score;

        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        // Score glow
        ctx.shadowColor = 'rgba(56,189,248,0.3)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#e0f2fe';
        ctx.font = 'bold 13px ui-monospace,SFMono-Regular,monospace';
        ctx.fillText(`${ly.toLocaleString()} LY`, W - 12, 10);
        ctx.shadowBlur = 0;

        if (best > 0) {
          ctx.fillStyle = 'rgba(148,163,184,0.6)';
          ctx.font = '8px ui-monospace,SFMono-Regular,monospace';
          ctx.fillText(`BEST ${best.toLocaleString()}`, W - 12, 27);
        }
      }

      // ── IDLE overlay ──
      if (!s.running && s.frame < 5) {
        ctx.fillStyle = 'rgba(3,7,18,0.4)';
        ctx.fillRect(0, 0, W, H);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(56,189,248,0.35)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#e0f2fe';
        ctx.font = 'bold 16px system-ui,sans-serif';
        ctx.fillText('✦ SKY DASH', W / 2, H / 2 - 16);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(148,163,184,0.7)';
        ctx.font = '10px system-ui,sans-serif';
        ctx.fillText('PRESS SPACE TO LAUNCH', W / 2, H / 2 + 10);

        ctx.fillStyle = 'rgba(148,163,184,0.4)';
        ctx.font = '8px system-ui,sans-serif';
        ctx.fillText('Navigate the cosmos — Dodge dark matter debris', W / 2, H / 2 + 28);
      }

      // ── DEAD overlay ──
      if (!s.running && s.frame > 5) {
        ctx.fillStyle = 'rgba(3,7,18,0.6)';
        ctx.fillRect(0, 0, W, H);

        // Scan line effect
        ctx.fillStyle = 'rgba(56,189,248,0.03)';
        ctx.fillRect(0, (s.frame * 2) % H, W, 2);

        ctx.textAlign = 'center';

        // "GAME OVER" title with holographic glow
        ctx.shadowColor = 'rgba(56,189,248,0.4)';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#e0f2fe';
        ctx.font = 'bold 14px system-ui,sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 32);
        ctx.shadowBlur = 0;

        // Score
        ctx.shadowColor = 'rgba(56,189,248,0.25)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px ui-monospace,SFMono-Regular,monospace';
        ctx.fillText(`${s.score.toLocaleString()} LY`, W / 2, H / 2 - 8);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(148,163,184,0.5)';
        ctx.font = '8px system-ui,sans-serif';
        ctx.fillText('LIGHT YEARS TRAVELED', W / 2, H / 2 + 8);

        // Restart prompt
        ctx.fillStyle = 'rgba(148,163,184,0.6)';
        ctx.font = '10px system-ui,sans-serif';
        ctx.fillText('Press Space to Launch Again', W / 2, H / 2 + 28);
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [best, token, fetchLeaderboard]);

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-sky-100">
            ✦ Sky Dash
          </h3>
          <p className="text-sm text-sky-300/50 mt-0.5">
            Navigate the cosmos &bull; Dodge dark matter debris
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeaderboard}
            className="px-2 py-1.5 rounded-lg text-xs font-medium text-sky-400/50 hover:text-sky-300 border border-transparent hover:border-sky-500/20 transition"
            title="Refresh leaderboard"
            aria-label="Refresh leaderboard"
          >
            ↻
          </button>
          <button
            onClick={() => setShowBoard((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
              showBoard
                ? 'bg-sky-900/40 text-sky-200 border-sky-500/30'
                : 'text-sky-300/50 hover:text-sky-200 border-transparent hover:border-sky-500/20'
            }`}
          >
            {showBoard ? '× CLOSE' : 'SCORES'}
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={Math.round(W * SCALE)}
        height={Math.round(H * SCALE)}
        className="w-full cursor-pointer select-none"
        style={{ background: '#030712', borderRadius: '0 0 0.75rem 0.75rem' }}
        onClick={jump}
        onTouchEnd={(e) => { e.preventDefault(); jump(); }}
      />

      {/* Leaderboard */}
      {showBoard && (
        <div className="border-t border-white/5 px-6 py-4">
          <h4 className="text-sm font-semibold text-sky-100 mb-3">
            LEADERBOARD
          </h4>
          {lb.length === 0 ? (
            <p className="text-sm text-sky-300/30 text-center py-4">
              {user
                ? 'No data yet. Fly a mission!'
                : 'Login to save your scores'}
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {lb.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    user && entry.nickname === user.nickname
                      ? 'bg-sky-900/30 ring-1 ring-sky-500/30'
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-bold text-sky-300/40 shrink-0 text-xs">
                      {entry.rank <= 3 ? ['❶','❷','❸'][entry.rank - 1] : `#${entry.rank}`}
                    </span>
                    {entry.avatar_url ? (
                      <img
                        src={entry.avatar_url}
                        alt={entry.nickname}
                        className="w-6 h-6 rounded-full shrink-0 ring-1 ring-white/10"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-sky-900/40 shrink-0 ring-1 ring-white/5 flex items-center justify-center text-[10px] text-sky-300/40 font-medium">
                        {entry.nickname?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                    <span className="font-medium text-sky-200/70 truncate text-xs">
                      {entry.nickname}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-sky-200 shrink-0 text-xs">
                    {entry.score.toLocaleString()} <span className="text-sky-300/40">LY</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
