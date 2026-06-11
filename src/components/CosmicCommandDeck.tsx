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

interface MixerLevels {
  whiteNoise: number;
  engineThrust: number;
  podcastVolume: number;
}

interface TelemetryData {
  bestScore: number;
  totalVisits: number;
  todayVisits: number;
}

// ─── Mock Podcast Data ───

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

// ─── Constants ───

const CANVAS_W = 340;
const CANVAS_H = 130;
const BAR_COUNT = 48;

// ─── Corner Bracket ───

function CornerBrackets() {
  return (
    <>
      {/* Top-left */}
      <div className="absolute -top-px -left-px w-4 h-4 pointer-events-none">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-sky-500/40 rounded-tl" />
      </div>
      {/* Top-right */}
      <div className="absolute -top-px -right-px w-4 h-4 pointer-events-none">
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-sky-500/40 rounded-tr" />
      </div>
      {/* Bottom-left */}
      <div className="absolute -bottom-px -left-px w-4 h-4 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-sky-500/40 rounded-bl" />
      </div>
      {/* Bottom-right */}
      <div className="absolute -bottom-px -right-px w-4 h-4 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-sky-500/40 rounded-br" />
      </div>
    </>
  );
}

// ─── Zone Label ───

function ZoneLabel({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className={`text-[10px] font-semibold tracking-[0.2em] uppercase ${accent ? 'text-cyan-400' : 'text-slate-500'}`}>
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-700/80 to-transparent" />
    </div>
  );
}

// ─── Zone A: Signal Monitor (Canvas Visualizer) ───

function SignalMonitor({
  isPlaying,
  mixerLevels,
  onInteraction,
}: {
  isPlaying: boolean;
  mixerLevels: MixerLevels;
  onInteraction: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const dataRef = useRef<number[]>(Array(BAR_COUNT).fill(2));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const bars = dataRef.current;

      if (isPlaying) {
        // Active equalizer — dynamic bars with energy from mixer levels
        const energy = 0.5 + mixerLevels.podcastVolume * 0.5;
        for (let i = 0; i < BAR_COUNT; i++) {
          const target = 2 + Math.random() * 28 * energy * (0.3 + 0.7 * (1 - i / BAR_COUNT));
          bars[i] += (target - bars[i]) * 0.25;
        }
      } else {
        // CMB scanning mode — gentle sine waves
        for (let i = 0; i < BAR_COUNT; i++) {
          const t = frame * 0.008;
          const wave = Math.sin(i * 0.18 + t) * 3 + Math.sin(i * 0.07 + t * 0.6) * 4;
          const target = Math.max(1, 6 + wave + Math.sin(i * 0.03 + t * 0.3) * 2);
          bars[i] += (target - bars[i]) * 0.05;
        }
      }

      // ── Draw grid lines ──
      ctx.strokeStyle = 'rgba(56,189,248,0.05)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < CANVAS_H; y += CANVAS_H / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }

      // ── Draw bars ──
      const barW = CANVAS_W / BAR_COUNT;
      const gap = 1;
      const midY = CANVAS_H / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const h = bars[i];
        const x = i * barW + gap / 2;
        const w = barW - gap;
        const alpha = 0.4 + (h / 30) * 0.6;

        // Top bar
        const grad = ctx.createLinearGradient(x, midY - h, x, midY);
        grad.addColorStop(0, `rgba(56,189,248,${alpha * 0.9})`);
        grad.addColorStop(0.5, `rgba(14,165,233,${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(14,165,233,${alpha * 0.1})`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, midY - h, w, h, [0, 0, 1, 1]);
        ctx.fill();

        // Bottom bar (mirror)
        const gradB = ctx.createLinearGradient(x, midY, x, midY + h);
        gradB.addColorStop(0, `rgba(14,165,233,${alpha * 0.1})`);
        gradB.addColorStop(0.5, `rgba(14,165,233,${alpha * 0.5})`);
        gradB.addColorStop(1, `rgba(56,189,248,${alpha * 0.9})`);

        ctx.fillStyle = gradB;
        ctx.beginPath();
        ctx.roundRect(x, midY, w, h, [1, 1, 0, 0]);
        ctx.fill();

        // Glow center line
        if (h > 8) {
          ctx.fillStyle = `rgba(186,230,253,${alpha * 0.15})`;
          ctx.beginPath();
          ctx.roundRect(x, midY - 0.5, w, 1, [0.5]);
          ctx.fill();
        }
      }

      // ── Overlay gradient fade ──
      const fadeGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      fadeGrad.addColorStop(0, 'rgba(2,6,23,0)');
      fadeGrad.addColorStop(0.08, 'rgba(2,6,23,0)');
      fadeGrad.addColorStop(0.45, 'rgba(2,6,23,0)');
      fadeGrad.addColorStop(0.55, 'rgba(2,6,23,0)');
      fadeGrad.addColorStop(0.92, 'rgba(2,6,23,0)');
      fadeGrad.addColorStop(1, 'rgba(2,6,23,0.15)');
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, mixerLevels.podcastVolume]);

  return (
    <div className="relative cursor-pointer" onClick={onInteraction}>
      <canvas
        ref={canvasRef}
        style={{ width: CANVAS_W, height: CANVAS_H }}
        className="w-full rounded-lg"
      />

      {/* Status overlay — bottom-left */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]' : 'bg-slate-600'}`} />
        <span className="text-[10px] font-mono text-slate-400">
          {isPlaying ? 'SIGNAL: LOCKED' : 'SCANNING COSMOS'}
        </span>
      </div>

      {/* Frequency readout — bottom-right */}
      <div className="absolute bottom-2 right-2">
        <span className="text-[10px] font-mono text-slate-500">
          FREQ: {isPlaying ? (98.4 + Math.random() * 0.2).toFixed(1) : '---.--'} MHz
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.35, ease: 'easeOut' }}
      className="group relative flex gap-3 p-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40
        hover:bg-slate-900/70 hover:border-sky-500/25 transition-all duration-300 cursor-default"
    >
      <CornerBrackets />

      {/* Cover art */}
      <div
        className={`relative w-14 h-14 shrink-0 rounded-lg bg-gradient-to-br ${episode.coverGradient}
          flex items-center justify-center text-2xl overflow-hidden ring-1 ring-white/5`}
      >
        <span className="relative z-10">{episode.coverEmoji}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-semibold tracking-wider text-sky-400/70 uppercase">
            {episode.podcastName}
          </span>
          <svg className="w-2.5 h-2.5 text-sky-500/40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h4 className="text-xs font-semibold text-slate-200 truncate leading-tight mb-1">
          {episode.episodeTitle}
        </h4>
        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 italic">
          {episode.logLine}
        </p>
      </div>

      {/* Entry button */}
      <div className="flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); onEntry(episode); }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          className={`
            relative px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase
            transition-all duration-100 select-none
            ${pressed
              ? 'bg-sky-900/60 text-sky-300 shadow-inner shadow-black/40 translate-y-[1px] border-sky-500/40'
              : 'bg-sky-950/60 text-sky-400/80 hover:text-sky-300 shadow-lg shadow-black/20 border border-sky-500/20 hover:border-sky-400/40 hover:bg-sky-900/50'
            }
          `}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            ENTRY
          </span>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Zone C: Audio Mixer Slider ───

function MixerSlider({
  label,
  value,
  onChange,
  accentColor = 'sky',
  icon,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accentColor?: 'sky' | 'cyan' | 'emerald';
  icon: string;
}) {
  const colorMap = {
    sky: { track: 'bg-sky-500/20', fill: 'bg-sky-400', thumb: 'border-sky-400', glow: 'rgba(56,189,248,0.3)' },
    cyan: { track: 'bg-cyan-500/20', fill: 'bg-cyan-400', thumb: 'border-cyan-400', glow: 'rgba(34,211,238,0.3)' },
    emerald: { track: 'bg-emerald-500/20', fill: 'bg-emerald-400', thumb: 'border-emerald-400', glow: 'rgba(52,211,153,0.3)' },
  };
  const c = colorMap[accentColor];

  return (
    <div className="flex items-center gap-3 group">
      <span className="w-5 text-center text-xs leading-none">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-mono font-semibold tracking-widest text-slate-500 uppercase">
            {label}
          </span>
          <span className="text-[10px] font-mono text-slate-600 tabular-nums">
            {Math.round(value * 100)}%
          </span>
        </div>
        <div className="relative h-2">
          {/* Track */}
          <div className={`absolute inset-0 rounded-full ${c.track}`} />
          {/* Fill */}
          <div
            className={`absolute top-0 left-0 h-full rounded-full ${c.fill} transition-[width] duration-75`}
            style={{
              width: `${value * 100}%`,
              boxShadow: `0 0 6px ${c.glow}`,
              opacity: 0.7,
            }}
          />
          {/* Hidden range input */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {/* Custom thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 bg-slate-900 pointer-events-none
              transition-shadow duration-150 group-hover:shadow-[0_0_8px_var(--thumb-glow)]"
            style={{
              left: `calc(${value * 100}% - 7px)`,
              borderColor: c.thumb.replace('border-', ''),
              '--thumb-glow': c.glow,
            } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Zone D: Telemetry Row ───

function TelemetryRow({ label, value, unit, accent = false }: { label: string; value: string | number; unit?: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-900/40 border border-slate-800/30">
      <span className="text-[10px] font-mono text-slate-500 tracking-wide">{label}</span>
      <span className={`font-mono text-xs font-bold ${accent ? 'text-cyan-400' : 'text-slate-300'}`}>
        {value}
        {unit && <span className="text-[10px] text-slate-600 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

// ─── Audio Mixer Engine (Web Audio API) ───

function useMixerEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const whiteNoiseGainRef = useRef<GainNode | null>(null);
  const thrustGainRef = useRef<GainNode | null>(null);
  const initializedRef = useRef(false);

  const init = useCallback(() => {
    if (initializedRef.current) return;
    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      // ── White Noise ──
      const bufSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

      const wnSource = ctx.createBufferSource();
      wnSource.buffer = buffer;
      wnSource.loop = true;

      const wnGain = ctx.createGain();
      wnGain.gain.value = 0;
      wnSource.connect(wnGain);
      wnGain.connect(ctx.destination);
      wnSource.start();
      whiteNoiseGainRef.current = wnGain;

      // ── Engine Thrust (filtered noise with LFO) ──
      const thrustBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const thrustData = thrustBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) thrustData[i] = Math.random() * 2 - 1;

      const thrustSource = ctx.createBufferSource();
      thrustSource.buffer = thrustBuf;
      thrustSource.loop = true;

      const thrustFilter = ctx.createBiquadFilter();
      thrustFilter.type = 'lowpass';
      thrustFilter.frequency.value = 200;
      thrustFilter.Q.value = 1.5;

      const thrustGain = ctx.createGain();
      thrustGain.gain.value = 0;
      thrustSource.connect(thrustFilter);
      thrustFilter.connect(thrustGain);
      thrustGain.connect(ctx.destination);
      thrustSource.start();
      thrustGainRef.current = thrustGain;

      // LFO for thrust modulation
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 2.5;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 120;
      lfo.connect(lfoGain);
      lfoGain.connect(thrustFilter.frequency);
      lfo.start();

      initializedRef.current = true;
    } catch {
      // AudioContext may not be available
    }
  }, []);

  const setWhiteNoise = useCallback((vol: number) => {
    if (whiteNoiseGainRef.current) {
      whiteNoiseGainRef.current.gain.setTargetAtTime(vol * 0.08, ctxRef.current!.currentTime, 0.1);
    }
  }, []);

  const setThrust = useCallback((vol: number) => {
    if (thrustGainRef.current) {
      thrustGainRef.current.gain.setTargetAtTime(vol * 0.06, ctxRef.current!.currentTime, 0.1);
    }
  }, []);

  const dispose = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
      initializedRef.current = false;
    }
  }, []);

  return { init, setWhiteNoise, setThrust, dispose };
}

// ─── Main: Cosmic Command Deck ───

export default function CosmicCommandDeck() {
  const {
    isPlaying, track, currentIndex, tracks,
    togglePlay, volume, setVolume, selectTrack,
  } = useAudio();

  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasInteractedRef = useRef(false);

  const [mixerLevels, setMixerLevels] = useState<MixerLevels>({
    whiteNoise: 0,
    engineThrust: 0,
    podcastVolume: volume,
  });

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    bestScore: 0,
    totalVisits: 0,
    todayVisits: 0,
  });

  const engine = useMixerEngine();

  // ── Sync podcast volume ──
  const handleMixerChange = useCallback((key: keyof MixerLevels, val: number) => {
    setMixerLevels((prev) => ({ ...prev, [key]: val }));
    if (key === 'podcastVolume') setVolume(val);
    if (key === 'whiteNoise') engine.setWhiteNoise(val);
    if (key === 'engineThrust') engine.setThrust(val);
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      engine.init();
    }
  }, [setVolume, engine]);

  // ── Fetch telemetry ──
  useEffect(() => {
    const saved = localStorage.getItem('dino-best');
    if (saved) setTelemetry((prev) => ({ ...prev, bestScore: parseInt(saved, 10) }));

    fetch('/api/visits')
      .then((r) => r.json())
      .then((data) => {
        setTelemetry((prev) => ({
          ...prev,
          totalVisits: data.total ?? 0,
          todayVisits: data.today ?? 0,
        }));
      })
      .catch(() => {});
  }, []);

  // ── Listen for score updates ──
  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem('dino-best');
      if (saved) setTelemetry((prev) => ({ ...prev, bestScore: parseInt(saved, 10) }));
    };
    window.addEventListener('storage', handler);
    // Also poll for updates from the same tab
    const iv = setInterval(handler, 5000);
    return () => { window.removeEventListener('storage', handler); clearInterval(iv); };
  }, []);

  // ── Close panel on outside click ──
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

  // ── Escape key ──
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expanded]);

  // ── Clean up mixer on unmount ──
  useEffect(() => {
    return () => engine.dispose();
  }, [engine]);

  // ── Podcast entry handler ──
  const handlePodcastEntry = useCallback((ep: PodcastEpisode) => {
    // For now, just log. Could open Xiaoyuzhou link in future.
    console.log('[Command Deck] Entry requested:', ep.podcastName, ep.episodeTitle);
    // Quick visual feedback: pulse the button via state
  }, []);

  // ── Signal monitor tap ──
  const handleSignalTap = useCallback(() => {
    if (!isPlaying && !hasInteractedRef.current) {
      hasInteractedRef.current = true;
      engine.init();
    }
  }, [isPlaying, engine]);

  // ── Collapsed trigger button ──
  const triggerButton = (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`
        relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs
        transition-all duration-300
        ${expanded || isPlaying
          ? 'bg-sky-500/10 border border-sky-400/20 text-sky-400'
          : 'text-foreground/50 hover:text-foreground/70 hover:bg-white/5 border border-transparent'
        }
      `}
      aria-label="Cosmic Command Deck"
      title="Cosmic Command Deck"
    >
      {isPlaying ? (
        <span className="flex items-end gap-[1.5px] h-3">
          {[0,1,2,3].map((i) => (
            <span
              key={i}
              className="w-[2px] bg-sky-400 rounded-full transition-all duration-75"
              style={{
                height: `${2 + Math.random() * 12}px`,
                opacity: 0.6 + Math.random() * 0.4,
                boxShadow: '0 0 4px rgba(56,189,248,0.3)',
              }}
            />
          ))}
        </span>
      ) : expanded ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="2" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      <span className="hidden sm:inline text-[10px] font-semibold tracking-wider">
        COMMAND DECK
      </span>
    </button>
  );

  return (
    <div className="relative" ref={panelRef}>
      {triggerButton}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 z-50 origin-top-right"
          >
            {/* ── Main Bento Panel ── */}
            <div
              className="w-[720px] max-w-[calc(100vw-32px)] p-3.5 rounded-2xl
                backdrop-blur-2xl bg-[#020617]/85
                border-2 border-slate-800/80
                shadow-[0_0_60px_rgba(56,189,248,0.12)]
                overflow-hidden"
              style={{ animationFillMode: 'both' }}
            >
              {/* ── Header bar ── */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold tracking-[0.25em] text-sky-400/90 uppercase">
                    ⚡ Cosmic Command Deck
                  </span>
                  <span className="text-[9px] font-mono text-slate-600 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800/50">
                    v.OS::STARLINK
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Mini spectrum status */}
                  <div className="flex items-end gap-[1.5px] h-3 px-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-[2px] rounded-full transition-all duration-150"
                        style={{
                          height: `${2 + Math.random() * 10}px`,
                          background: isPlaying
                            ? `rgba(56,189,248,${0.4 + Math.random() * 0.6})`
                            : 'rgba(71,85,105,0.4)',
                          boxShadow: isPlaying ? '0 0 4px rgba(56,189,248,0.2)' : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-slate-600 hover:text-slate-300 transition p-0.5 rounded hover:bg-slate-800/50"
                    aria-label="Close command deck"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── Bento Grid ── */}
              <div className="flex gap-3">
                {/* Left column (A + C + D) */}
                <div className="w-[240px] shrink-0 flex flex-col gap-3">
                  {/* ── Zone A: Signal Monitor ── */}
                  <div className="relative p-3 rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
                    <CornerBrackets />
                    <ZoneLabel label="Signal Monitor" />
                    <SignalMonitor
                      isPlaying={isPlaying}
                      mixerLevels={mixerLevels}
                      onInteraction={handleSignalTap}
                    />
                  </div>

                  {/* ── Zone C: Audio Mixer ── */}
                  <div className="relative p-3 rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
                    <CornerBrackets />
                    <ZoneLabel label="Audio Mixer" />

                    <div className="space-y-3">
                      <MixerSlider
                        label="WHITE NOISE"
                        icon="▦"
                        value={mixerLevels.whiteNoise}
                        onChange={(v) => handleMixerChange('whiteNoise', v)}
                        accentColor="sky"
                      />
                      <MixerSlider
                        label="ENGINE THRUST"
                        icon="⟐"
                        value={mixerLevels.engineThrust}
                        onChange={(v) => handleMixerChange('engineThrust', v)}
                        accentColor="cyan"
                      />
                      <MixerSlider
                        label="PODCAST VOL"
                        icon="♪"
                        value={mixerLevels.podcastVolume}
                        onChange={(v) => handleMixerChange('podcastVolume', v)}
                        accentColor="emerald"
                      />
                    </div>
                  </div>

                  {/* ── Zone D: Telemetry ── */}
                  <div className="relative p-3 rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
                    <CornerBrackets />
                    <ZoneLabel label="Telemetry" accent />

                    <div className="space-y-1.5">
                      <TelemetryRow
                        label="BEST_SCORE"
                        value={telemetry.bestScore.toLocaleString()}
                        unit="LY"
                        accent
                      />
                      <TelemetryRow
                        label="TOTAL_VISITS"
                        value={telemetry.totalVisits.toLocaleString()}
                      />
                      <TelemetryRow
                        label="TODAY_VISITS"
                        value={telemetry.todayVisits.toLocaleString()}
                      />

                      {/* System status indicator */}
                      <div className="flex items-center gap-2 pt-1 mt-1 border-t border-slate-800/40">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse" />
                        <span className="text-[9px] font-mono text-slate-600">SYS::NOMINAL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right column (Zone B: Podcast Deck) ── */}
                <div className="flex-1 relative p-3 rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
                  <CornerBrackets />
                  <ZoneLabel label="Podcast Deck" accent />

                  {/* Player controls */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {track.icon} {track.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectTrack(currentIndex - 1)}
                        disabled={currentIndex === 0}
                        className="text-slate-500 hover:text-sky-400 disabled:opacity-20 disabled:cursor-not-allowed transition p-1 rounded hover:bg-slate-800/50"
                        aria-label="Previous track"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                        </svg>
                      </button>

                      <button
                        onClick={togglePlay}
                        className="w-7 h-7 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/20 flex items-center justify-center transition"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <svg className="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-sky-400 ml-[1px]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => selectTrack(currentIndex + 1)}
                        disabled={currentIndex === tracks.length - 1}
                        className="text-slate-500 hover:text-sky-400 disabled:opacity-20 disabled:cursor-not-allowed transition p-1 rounded hover:bg-slate-800/50"
                        aria-label="Next track"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Podcast cards */}
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                    {PODCASTS.map((ep, i) => (
                      <PodcastCard
                        key={ep.id}
                        episode={ep}
                        index={i}
                        onEntry={handlePodcastEntry}
                      />
                    ))}
                  </div>

                  {/* Footer note */}
                  <div className="mt-2 text-[9px] text-slate-700 text-center font-mono tracking-wider">
                    {PODCASTS.length} EPISODES IN QUEUE · POWERED BY XIAOYUZHOU FM
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
