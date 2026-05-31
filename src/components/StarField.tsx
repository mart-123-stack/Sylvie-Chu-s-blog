'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/theme-context';

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: number;
  driftX: number;
  driftY: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  tail: number;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
  const timeRef = useRef(0);
  const scrollRef = useRef(0);
  const dimsRef = useRef({ w: 0, h: 0 });

  const initStars = useCallback((w: number, h: number) => {
    const count = Math.min(250, Math.floor((w * h) / 4000));
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      const layer = Math.random();
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.3 + Math.random() * (layer > 0.7 ? 2.2 : 1.2),
        baseOpacity: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.5 + Math.random() * 2.5,
        twinklePhase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 30 : 220) : 0,
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.08,
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      dimsRef.current = { w, h };
      initStars(w, h);
    };

    resize();
    window.addEventListener('resize', resize);
    const scrollListener = () => { scrollRef.current = window.scrollY; };
    window.addEventListener('scroll', scrollListener, { passive: true });

    let animId: number;

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const { w, h } = dimsRef.current;
      const parallax = scrollRef.current * 0.02;

      ctx.clearRect(0, 0, w, h);

      // --- Shooting stars (rare) ---
      if (Math.random() < 0.003 && shootingRef.current.length < 2) {
        shootingRef.current.push({
          x: Math.random() * w * 0.8 + w * 0.1,
          y: Math.random() * h * 0.3,
          vx: -4 - Math.random() * 4,
          vy: 1.5 + Math.random() * 2,
          life: 0,
          maxLife: 30 + Math.random() * 40,
          tail: 25 + Math.random() * 35,
        });
      }

      // Update & draw shooting stars
      for (let i = shootingRef.current.length - 1; i >= 0; i--) {
        const s = shootingRef.current[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        if (s.life > s.maxLife) { shootingRef.current.splice(i, 1); continue; }
        const progress = s.life / s.maxLife;
        const alpha = 1 - progress;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * (s.tail / s.maxLife) * (1 - progress), s.y - s.vy * (s.tail / s.maxLife) * (1 - progress));
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 3, s.y - s.vy * 3);
        grad.addColorStop(0, `rgba(200, 220, 255, ${alpha})`);
        grad.addColorStop(1, 'rgba(200, 220, 255, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Subtle vignette overlay for content readability
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.15, w * 0.5, h * 0.45, Math.max(w, h) * 0.7);
      vg.addColorStop(0, 'rgba(15, 23, 42, 0.0)');
      vg.addColorStop(0.5, 'rgba(15, 23, 42, 0.15)');
      vg.addColorStop(1, 'rgba(15, 23, 42, 0.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      // --- Draw stars ---
      for (const star of starsRef.current) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinklePhase);
        const opacity = star.baseOpacity * twinkle;
        const sx = star.x + Math.sin(t * star.driftX) * 2;
        const sy = star.y + Math.sin(t * star.driftY) * 2 + parallax * star.size * 0.5;

        let color: string;
        if (star.hue) {
          color = `hsla(${star.hue}, 60%, 75%, ${opacity})`;
        } else {
          const brightness = 200 + Math.floor(55 * twinkle);
          color = `rgba(${brightness}, ${brightness + 5}, 255, ${opacity})`;
        }

        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Glow for brighter stars
        if (star.size > 1.8) {
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 200, 255, ${opacity * 0.08})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', scrollListener);
    };
  }, [initStars, theme]);

  // Pause canvas when not in dark mode by clearing it
  useEffect(() => {
    if (theme !== 'dark') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        opacity: theme === 'dark' ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    />
  );
}
