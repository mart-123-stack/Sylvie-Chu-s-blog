'use client';

import { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/lib/audio-context';

export default function SpaceRadio() {
  const {
    isPlaying, track, currentIndex, tracks,
    togglePlay, volume, setVolume, selectTrack,
  } = useAudio();

  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Spectrum data — requestAnimationFrame-driven pseudo-random bars
  const [spectrum, setSpectrum] = useState([2, 2, 2, 2]);

  useEffect(() => {
    if (!isPlaying) {
      setSpectrum([2, 2, 2, 2]);
      return;
    }
    let raf: number;
    const update = () => {
      setSpectrum([
        2 + Math.random() * 14,
        3 + Math.random() * 16,
        2 + Math.random() * 12,
        3 + Math.random() * 18,
      ]);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  // Close panel on outside click
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

  // Close panel on Escape
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expanded]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Collapsed capsule button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs
          transition-all duration-300
          ${isPlaying
            ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-400'
            : 'text-foreground/50 hover:text-foreground/70 hover:bg-white/5 border border-transparent'
          }
        `}
        aria-label="Space Radio"
        title="Starship Radio"
      >
        {isPlaying ? (
          /* Animated spectrum bars */
          <span className="flex items-end gap-[1.5px] h-3">
            {spectrum.map((h, i) => (
              <span
                key={i}
                className="w-[2px] bg-cyan-400 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(2, h)}px`,
                  opacity: 0.7 + h / 20,
                  boxShadow: '0 0 4px rgba(56,189,248,0.3)',
                }}
              />
            ))}
          </span>
        ) : (
          /* Radio tower icon */
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>

      {/* Expanded glass panel */}
      {expanded && (
        <div
          className="absolute right-0 top-full mt-2 w-56 p-3 rounded-xl
            backdrop-blur-2xl bg-slate-900/60 border border-white/[0.06]
            shadow-2xl shadow-cyan-500/5
            animate-panel-enter"
          style={{ animationFillMode: 'both' }}
        >
          {/* Header row: track name + close */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-cyan-300/80 tracking-wide">
              {track.icon} {track.name}
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="text-white/30 hover:text-white/60 transition"
              aria-label="Close"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Spectrum visualization */}
          <div className="flex items-end gap-[3px] h-8 mb-3 px-1">
            {spectrum.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(2, h * 1.5)}px`,
                  background: `linear-gradient(to top, rgba(56,189,248,0.2), rgba(56,189,248,${0.5 + h / 30}))`,
                  boxShadow: isPlaying ? '0 0 6px rgba(56,189,248,0.2)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Previous track */}
              <button
                onClick={() => selectTrack(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="text-white/40 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition p-0.5"
                aria-label="Previous track"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/20 flex items-center justify-center transition"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-cyan-400 ml-[1px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Next track */}
              <button
                onClick={() => selectTrack(currentIndex + 1)}
                disabled={currentIndex === tracks.length - 1}
                className="text-white/40 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition p-0.5"
                aria-label="Next track"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setVolume(volume === 0 ? 0.15 : 0)}
                className="text-white/30 hover:text-white/60 transition"
                aria-label={volume === 0 ? 'Unmute' : 'Mute'}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  {volume === 0 ? (
                    <path d="M11 5L6 9H2v6h4l5 4V5z M23 9l-6 6 M17 9l6 6" />
                  ) : (
                    <>
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </>
                  )}
                </svg>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-14 h-1 appearance-none bg-white/10 rounded-full cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
                  [&::-webkit-slider-thumb]:shadow-[0_0_4px_rgba(56,189,248,0.5)]"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
