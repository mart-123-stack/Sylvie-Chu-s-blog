'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudio } from '@/lib/audio-context';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───

interface PodcastEpisode {
  id: string;
  podcastName: string;
  episodeTitle: string;
  coverGradient: string;
  coverEmoji: string;
  logLine: string;
}

interface SiteStats {
  bestScore: number;
  totalVisits: number;
  todayVisits: number;
  totalComments: number;
}

// ─── Constants ───

const PODCASTS: PodcastEpisode[] = [
  {
    id: '1',
    podcastName: '代码之外 Beyond Code',
    episodeTitle: 'EP24 · 在数字花园里散步——个人博客的复兴',
    coverGradient: 'from-emerald-900/70 via-teal-800/50 to-cyan-900/70',
    coverEmoji: '🌿',
    logLine: '这期聊到了数字花园的概念，和我搭建这个博客的初心不谋而合。',
  },
  {
    id: '2',
    podcastName: '脑放电波 Neural Discharge',
    episodeTitle: 'EP67 · 从轨道看地球——宇航员的宇宙视角',
    coverGradient: 'from-indigo-900/70 via-violet-800/50 to-purple-900/70',
    coverEmoji: '🌍',
    logLine: '从轨道看地球会改变一个人。听完这期我理解了为什么。',
  },
  {
    id: '3',
    podcastName: '设计乘数 Design Multiplier',
    episodeTitle: 'EP12 · 科幻美学与UI设计的交叉点',
    coverGradient: 'from-sky-900/70 via-blue-800/50 to-cyan-900/70',
    coverEmoji: '✦',
    logLine: '这个控制台的灵感来源。Form follows function, function can be beautiful.',
  },
  {
    id: '4',
    podcastName: '科技乱炖 Tech Stew',
    episodeTitle: 'EP103 · Next.js 14这一年——真实世界的取舍',
    coverGradient: 'from-amber-900/50 via-orange-800/40 to-rose-900/60',
    coverEmoji: '⚡',
    logLine: 'App Router、Server Components、还有生产环境踩过的坑。干货满满。',
  },
];

const CANVAS_W = 300;
const CANVAS_H = 100;
const BAR_COUNT = 48;

// ─── Section Divider ───

function SectionDivider() {
  return (
    <div className="h-px bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-transparent" />
  );
}

// ─── Zone Label ───

function ZoneLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-slate-600">
        // {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-800/60 to-transparent" />
    </div>
  );
}

// ─── Zone A: Spectrum Monitor ───

function SpectrumMonitor({
  isPlaying,
  volume,
}: {
  isPlaying: boolean;
  volume: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.scale(dpr, dpr);

    const bars = new Float32Array(BAR_COUNT).fill(1.5);
    let frame = 0;
    let animId: number;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // ── Update bars ──
      if (isPlaying) {
        const energy = 0.4 + volume * 0.6;
        for (let i = 0; i < BAR_COUNT; i++) {
          const target = 1.5 + Math.random() * 22 * energy * (0.3 + 0.7 * (1 - i / BAR_COUNT));
          bars[i] += (target - bars[i]) * 0.2;
        }
      } else {
        for (let i = 0; i < BAR_COUNT; i++) {
          const t = frame * 0.006;
          const wave = Math.sin(i * 0.15 + t) * 2 + Math.sin(i * 0.05 + t * 0.5) * 3;
          const target = bars[i] + (Math.max(1, 4 + wave) - bars[i]) * 0.03;
          bars[i] = target;
        }
      }

      // ── Draw ──
      const barW = CANVAS_W / BAR_COUNT;
      const gap = 0.8;
      const midY = CANVAS_H / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const h = bars[i];
        const x = i * barW + gap / 2;
        const w = barW - gap;
        const a = Math.min(1, 0.25 + h / 28);

        // Top half
        const g1 = ctx.createLinearGradient(x, midY - h, x, midY);
        g1.addColorStop(0, `rgba(103,232,249,${a * 0.5})`);
        g1.addColorStop(0.6, `rgba(34,211,238,${a * 0.25})`);
        g1.addColorStop(1, `rgba(34,211,238,${a * 0.06})`);
        ctx.fillStyle = g1;
        ctx.fillRect(x, midY - h, w, h);

        // Bottom half (mirror)
        const g2 = ctx.createLinearGradient(x, midY, x, midY + h);
        g2.addColorStop(0, `rgba(34,211,238,${a * 0.06})`);
        g2.addColorStop(0.4, `rgba(34,211,238,${a * 0.25})`);
        g2.addColorStop(1, `rgba(103,232,249,${a * 0.5})`);
        ctx.fillStyle = g2;
        ctx.fillRect(x, midY, w, h);
      }

      // ── Center accent line ──
      ctx.fillStyle = 'rgba(103,232,249,0.08)';
      ctx.fillRect(0, midY - 0.5, CANVAS_W, 1);

      // ── Vignette ──
      const vg = ctx.createRadialGradient(CANVAS_W * 0.5, CANVAS_H * 0.5, 10, CANVAS_W * 0.5, CANVAS_H * 0.5, CANVAS_W * 0.5);
      vg.addColorStop(0, 'rgba(2,6,23,0)');
      vg.addColorStop(1, 'rgba(2,6,23,0.25)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, volume]);

  return (
    <div className="relative select-none">
      <canvas
        ref={canvasRef}
        style={{ width: CANVAS_W, height: CANVAS_H }}
        className="w-full rounded-md"
      />
      <div className="absolute bottom-1.5 left-2 flex items-center gap-2">
        <span
          className={`inline-block w-1 h-1 rounded-full transition-colors duration-500 ${
            isPlaying
              ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.4)]'
              : 'bg-slate-700'
          }`}
        />
        <span className="text-[8px] font-mono text-slate-700 tracking-wider">
          {isPlaying ? 'RX::LOCKED' : 'RX::STANDBY'}
        </span>
      </div>
      <div className="absolute bottom-1.5 right-2">
        <span className="text-[8px] font-mono text-slate-700 tracking-wider tabular-nums">
          {isPlaying ? `${(98.4 + Math.random() * 0.2).toFixed(1)} MHz` : '--.— MHz'}
        </span>
      </div>
    </div>
  );
}

// ─── Zone B: Podcast Card ───

function PodcastCard({
  episode,
  index,
  onEntry,
}: {
  episode: PodcastEpisode;
  index: number;
  onEntry: (ep: PodcastEpisode) => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.04, duration: 0.3, ease: 'easeOut' }}
      className="group relative flex items-start gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-500 cursor-default"
    >
      {/* Hover ambient glow */}
      <div
        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-cyan-500/[0.04] to-sky-500/[0.04]
          blur-2xl transition-all duration-700 pointer-events-none"
      />

      {/* Cover */}
      <div
        className={`relative w-10 h-10 shrink-0 rounded-md bg-gradient-to-br ${episode.coverGradient}
          flex items-center justify-center text-base overflow-hidden ring-1 ring-white/[0.04]`}
      >
        <span className="relative z-10">{episode.coverEmoji}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[8px] font-semibold tracking-widest text-slate-600 uppercase">
            {episode.podcastName}
          </span>
        </div>
        <h4 className="font-serif font-medium leading-snug text-[13px] text-slate-300
          group-hover:text-slate-200 transition-colors duration-500 line-clamp-1">
          {episode.episodeTitle}
        </h4>
        <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-1 mt-0.5">
          {episode.logLine}
        </p>
      </div>

      {/* Entry button */}
      <div className="flex items-center shrink-0 mt-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); onEntry(episode); }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          className={`
            relative px-2.5 py-1.5 rounded-md text-[8px] font-semibold tracking-widest uppercase
            transition-all duration-300 select-none
            ${
              pressed
                ? 'bg-cyan-950/40 text-cyan-400/60 scale-[0.97]'
                : 'text-slate-500 hover:text-cyan-400/80 border border-transparent hover:border-cyan-500/20'
            }
          `}
        >
          {/* Hover glow behind button */}
          <div
            className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100
              bg-gradient-to-r from-cyan-500/[0.04] to-sky-500/[0.04]
              blur-md transition-all duration-500"
          />
          <span className="relative z-10 flex items-center gap-1">
            <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            ENTER
          </span>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Zone C: Player Controls ───

function PlayerControls({
  isPlaying,
  track,
  currentIndex,
  tracks,
  volume,
  onTogglePlay,
  onPrevious,
  onNext,
  onVolumeChange,
}: {
  isPlaying: boolean;
  track: { name: string; icon: string };
  currentIndex: number;
  tracks: { name: string; icon: string }[];
  volume: number;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Track icon */}
      <span className="text-lg leading-none">{track.icon}</span>

      {/* Track info + controls */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-serif font-medium text-xs text-slate-300 truncate leading-snug">
            {track.name}
          </span>
          {isPlaying && (
            <span className="inline-block w-1 h-1 rounded-full bg-cyan-400/60 animate-pulse shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="text-slate-600 hover:text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors duration-300"
            aria-label="Previous track"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={onTogglePlay}
            className="relative w-6 h-6 rounded-full flex items-center justify-center
              transition-all duration-300
              text-slate-400 hover:text-cyan-400"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100
              bg-cyan-500/[0.06] blur-md transition-opacity duration-500" />
            {isPlaying ? (
              <svg className="w-2.5 h-2.5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5 relative z-10 ml-[1px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={onNext}
            disabled={currentIndex === tracks.length - 1}
            className="text-slate-600 hover:text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors duration-300"
            aria-label="Next track"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6v12h2V6h-2zM6 18l8.5-6L6 6v12z" />
            </svg>
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1.5 ml-2">
            <svg className="w-2.5 h-2.5 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3z" />
            </svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-0.5 appearance-none bg-slate-800 rounded-full cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/80
                [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(34,211,238,0.2)]
                [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:duration-300
                hover:[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.4)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Zone D: Telemetry ───

function TelemetryRow({ label, value, unit, accent = false }: { label: string; value: string | number; unit?: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[8px] font-mono tracking-wider text-slate-700 mb-0.5">{label}</div>
      <div className={`font-mono text-sm font-medium leading-none ${accent ? 'text-cyan-400/90' : 'text-slate-300'}`}>
        {value}
        {unit && <span className="text-[9px] text-slate-700 ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Main: Cosmic Command Deck ───

export default function CosmicCommandDeck() {
  const {
    isPlaying, track, currentIndex, tracks,
    togglePlay, volume, setVolume, selectTrack,
  } = useAudio();

  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<SiteStats>({
    bestScore: 0,
    totalVisits: 0,
    todayVisits: 0,
    totalComments: 0,
  });

  const fetchStats = useCallback(async () => {
    const saved = localStorage.getItem('dino-best');
    const bestScore = saved ? parseInt(saved, 10) : 0;
    setStats((prev) => ({ ...prev, bestScore }));

    try {
      const [visitsRes, commentsRes] = await Promise.all([
        fetch('/api/visits'),
        fetch('/api/comments'),
      ]);
      if (visitsRes.ok) {
        const v = await visitsRes.json();
        setStats((prev) => ({
          ...prev,
          totalVisits: v.total ?? 0,
          todayVisits: v.today ?? 0,
        }));
      }
      if (commentsRes.ok) {
        const c = await commentsRes.json();
        if (Array.isArray(c)) {
          setStats((prev) => ({ ...prev, totalComments: c.length }));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!expanded) return;
    fetchStats();
    const iv = setInterval(fetchStats, 15000);
    return () => clearInterval(iv);
  }, [expanded, fetchStats]);

  // Listen for score updates from localStorage
  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem('dino-best');
      if (saved) setStats((prev) => ({ ...prev, bestScore: parseInt(saved, 10) }));
    };
    window.addEventListener('storage', handler);
    const iv = setInterval(handler, 5000);
    return () => { window.removeEventListener('storage', handler); clearInterval(iv); };
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expanded]);

  const handlePodcastEntry = useCallback((ep: PodcastEpisode) => {
    console.log('[Command Deck] Entry:', ep.podcastName, ep.episodeTitle);
  }, []);

  // ── Collapsed trigger ──
  const triggerButton = (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`
        relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs
        transition-all duration-500
        ${expanded || isPlaying
          ? 'text-cyan-400/80'
          : 'text-slate-500 hover:text-slate-400'
        }
      `}
      aria-label="Cosmic Command Deck"
    >
      {isPlaying ? (
        <span className="flex items-end gap-[1.5px] h-3">
          {[0,1,2,3].map((i) => (
            <span
              key={i}
              className="w-[1.5px] bg-cyan-400/60 rounded-full"
              style={{
                height: `${2 + (i + 1) * 2}px`,
                transition: 'height 0.3s',
              }}
            />
          ))}
        </span>
      ) : expanded ? (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      ) : (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="2" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      <span className="hidden sm:inline text-[9px] font-semibold tracking-widest">
        COMMAND DECK
      </span>
    </button>
  );

  return (
    <div className="relative" ref={panelRef}>
      {/* Ambient glow behind trigger when playing */}
      <div
        className={`absolute -inset-3 rounded-full opacity-0 blur-3xl transition-opacity duration-1000 pointer-events-none
          ${isPlaying ? 'opacity-30' : ''}`}
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
        }}
      />
      {triggerButton}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 z-50 origin-top-right"
          >
            {/* ── Panel ── */}
            <div
              className="w-[520px] max-w-[calc(100vw-32px)]
                bg-[#030712]/95 backdrop-blur-2xl
                border border-slate-800/60
                rounded-2xl
                shadow-[0_0_80px_rgba(34,211,238,0.06)]
                overflow-hidden"
            >
              {/* Subtle top sheen */}
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />

              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-semibold tracking-[0.3em] text-slate-500 uppercase">
                    Cosmic Command Deck
                  </span>
                  <span className="text-[7px] font-mono text-slate-800 px-1.5 py-0.5 rounded
                    border border-slate-800/60 bg-slate-900/50 tracking-wider">
                    OS::STARLINK
                  </span>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-slate-700 hover:text-slate-500 transition-colors duration-300 p-0.5"
                  aria-label="Close"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* ── Zone A: Spectrum Monitor ── */}
              <div className="px-5 pb-3">
                <ZoneLabel label="Signal Monitor" />
                <SpectrumMonitor isPlaying={isPlaying} volume={volume} />
              </div>

              <SectionDivider />

              {/* ── Zone C: Player + Zone B: Podcast Deck ── */}
              <div className="px-5 pt-3 pb-2">
                <PlayerControls
                  isPlaying={isPlaying}
                  track={track}
                  currentIndex={currentIndex}
                  tracks={tracks}
                  volume={volume}
                  onTogglePlay={togglePlay}
                  onPrevious={() => selectTrack(currentIndex - 1)}
                  onNext={() => selectTrack(currentIndex + 1)}
                  onVolumeChange={setVolume}
                />
              </div>

              <div className="px-5 py-2">
                <ZoneLabel label="Podcast Deck" />
                <div className="space-y-px">
                  {PODCASTS.map((ep, i) => (
                    <PodcastCard
                      key={ep.id}
                      episode={ep}
                      index={i}
                      onEntry={handlePodcastEntry}
                    />
                  ))}
                </div>
                <div className="mt-2 pb-1 text-center">
                  <span className="text-[7px] font-mono text-slate-800 tracking-widest">
                    {PODCASTS.length} EPISODES · XIAOYUZHOU FM
                  </span>
                </div>
              </div>

              <SectionDivider />

              {/* ── Zone D: Telemetry ── */}
              <div className="px-5 pt-3 pb-4">
                <ZoneLabel label="Telemetry" />
                <div className="grid grid-cols-5 gap-4">
                  <TelemetryRow label="BEST_SCORE" value={stats.bestScore.toLocaleString()} unit="LY" accent />
                  <TelemetryRow label="TOTAL_VISITS" value={stats.totalVisits.toLocaleString()} />
                  <TelemetryRow label="TODAY" value={stats.todayVisits.toLocaleString()} />
                  <TelemetryRow label="COMMENTS" value={stats.totalComments.toLocaleString()} />
                  <TelemetryRow
                    label="SYS_STATUS"
                    value="NOMINAL"
                  />
                </div>
              </div>

              {/* Bottom subtle glow line */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-800/40 to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
