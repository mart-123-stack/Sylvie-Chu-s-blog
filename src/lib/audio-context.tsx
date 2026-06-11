'use client';

import { createContext, useContext, useRef, useState, useEffect, useCallback, ReactNode } from 'react';

export interface AudioTrack {
  name: string;
  src: string;
  icon: string;
}

const TRACKS: AudioTrack[] = [
  { name: 'Deep Space', src: '/audio/deep-space.mp3', icon: '✦' },
  { name: 'Nebula Drift', src: '/audio/nebula-drift.mp3', icon: '◎' },
  { name: 'Warp Sleep', src: '/audio/warp-sleep.mp3', icon: '◈' },
];

interface AudioCtxValue {
  isPlaying: boolean;
  currentIndex: number;
  track: AudioTrack;
  volume: number;
  isMuted: boolean;
  tracks: AudioTrack[];
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  selectTrack: (i: number) => void;
}

const AudioCtx = createContext<AudioCtxValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolumeState] = useState(0.15);
  const [isMuted, setIsMuted] = useState(false);

  // Create a single persistent audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Switch track when index changes, preserving play state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = !audio.paused;
    audio.src = TRACKS[currentIndex].src;
    audio.load();
    if (wasPlaying) audio.play().catch(() => {});
  }, [currentIndex]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.volume > 0) {
      audio.dataset.prevVolume = String(audio.volume);
      audio.volume = 0;
      setIsMuted(true);
    } else {
      audio.volume = parseFloat(audio.dataset.prevVolume || '0.15');
      setIsMuted(false);
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
    if (v > 0) setIsMuted(false);
  }, []);

  const selectTrack = useCallback((i: number) => {
    if (i >= 0 && i < TRACKS.length) setCurrentIndex(i);
  }, []);

  return (
    <AudioCtx.Provider
      value={{
        isPlaying,
        currentIndex,
        track: TRACKS[currentIndex],
        volume,
        isMuted,
        tracks: TRACKS,
        togglePlay,
        toggleMute,
        setVolume,
        selectTrack,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
