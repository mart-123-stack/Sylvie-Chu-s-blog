'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Visitor {
  lat: number;
  lon: number;
  country: string;
  city: string;
  country_code: string;
  path: string;
  created_at: string;
}

interface Stats {
  total: number;
  today: number;
  countries: { country: string; country_code: string; count: number }[];
  recentVisitors: Visitor[];
}

// Equirectangular projection
function project(lat: number, lon: number, w: number, h: number) {
  return { x: (lon + 180) / 360 * w, y: (90 - lat) / 180 * h };
}

function flagEmoji(code: string): string {
  if (!code || code.length < 2) return '';
  const cc = code.toUpperCase();
  return String.fromCodePoint(cc.charCodeAt(0) - 65 + 0x1F1E6, cc.charCodeAt(1) - 65 + 0x1F1E6);
}

export default function VisitorMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const animRef = useRef(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/visits');
      const data = await res.json();
      setStats(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Draw map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stats) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
      bg.addColorStop(0, '#0c1929');
      bg.addColorStop(1, '#060d18');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      for (let lat = -90; lat <= 90; lat += 30) {
        const { y } = project(lat, 0, W, H);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      for (let lon = -180; lon <= 180; lon += 30) {
        const { x } = project(0, lon, W, H);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Equator highlight
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1.5;
      const eqY = project(0, 0, W, H).y;
      ctx.beginPath();
      ctx.moveTo(0, eqY);
      ctx.lineTo(W, eqY);
      ctx.stroke();

      // Draw dots for recent visitors
      const now = Date.now();
      for (const v of stats.recentVisitors) {
        if (v.lat === null || v.lon === null) continue;
        const { x, y } = project(v.lat, v.lon, W, H);
        const age = now - new Date(v.created_at).getTime();
        const hoursAgo = age / (1000 * 60 * 60);

        // Glow
        const glowRadius = hoursAgo < 1 ? 12 : hoursAgo < 24 ? 8 : 5;
        const alpha = Math.max(0.15, 1 - hoursAgo / 48);

        const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        grad.addColorStop(0, `rgba(56, 189, 248, ${alpha})`);
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Dot
        ctx.fillStyle = hoursAgo < 1
          ? `rgba(251, 191, 36, ${alpha})`
          : `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, hoursAgo < 1 ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();

        // White core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pulse ring for recent visitors (last hour)
      const pulse = Math.sin(now * 0.003) * 0.3 + 0.7;
      for (const v of stats.recentVisitors) {
        if (v.lat === null || v.lon === null) continue;
        const age = now - new Date(v.created_at).getTime();
        if (age > 60 * 60 * 1000) continue;
        const { x, y } = project(v.lat, v.lon, W, H);
        ctx.strokeStyle = `rgba(251, 191, 36, ${pulse * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 8 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [stats]);

  // Mouse tracking for tooltip
  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !stats) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let found: { x: number; y: number; text: string } | null = null;
    for (const v of stats.recentVisitors) {
      if (v.lat === null || v.lon === null) continue;
      const { x, y } = project(v.lat, v.lon, canvasRef.current.width, canvasRef.current.height);
      const dx = mx * scaleX - x;
      const dy = my * scaleY - y;
      if (dx * dx + dy * dy < 100) {
        found = { x: e.clientX - rect.left, y: e.clientY - rect.top - 10, text: `${v.city}, ${v.country}` };
        break;
      }
    }
    setTooltip(found);
  }, [stats]);

  if (loading) {
    return (
      <div className="h-[400px] bg-slate-900 rounded-xl flex items-center justify-center">
        <div className="animate-pulse text-sky-400/60">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-4 border border-sky-100 dark:border-slate-700">
          <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{stats?.total ?? '-'}</p>
          <p className="text-sm text-foreground/60">Total Visits</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-4 border border-sky-100 dark:border-slate-700">
          <p className="text-2xl font-bold text-amber-500">{stats?.today ?? '-'}</p>
          <p className="text-sm text-foreground/60">Today</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-4 border border-sky-100 dark:border-slate-700">
          <p className="text-2xl font-bold text-emerald-500">{stats?.countries?.length ?? '-'}</p>
          <p className="text-sm text-foreground/60">Countries</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-4 border border-sky-100 dark:border-slate-700">
          <p className="text-2xl font-bold text-purple-400">{stats?.recentVisitors?.length ?? '-'}</p>
          <p className="text-sm text-foreground/60">Recent Visitors</p>
        </div>
      </div>

      {/* Map */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-sky-900/50">
        <canvas
          ref={canvasRef}
          width={900}
          height={400}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouse}
          onMouseLeave={() => setTooltip(null)}
        />
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg border border-sky-700"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
          >
            {tooltip.text}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-4 text-xs text-sky-300/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Recent
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> &lt; 1h
          </span>
        </div>
      </div>

      {/* Country list */}
      {stats && stats.countries.length > 0 && (
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-4 border border-sky-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-foreground/80 mb-3">From all over the world</h3>
          <div className="flex flex-wrap gap-2">
            {stats.countries.map(c => (
              <span key={c.country_code} className="text-xs px-2.5 py-1 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full">
                {flagEmoji(c.country_code) && <span className="mr-1">{flagEmoji(c.country_code)}</span>}
                {c.country}
                <span className="ml-1 text-foreground/40">{c.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
