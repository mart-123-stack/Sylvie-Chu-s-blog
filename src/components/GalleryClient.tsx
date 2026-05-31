'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Photo } from '@/lib/config';
import AnimatedSection from '@/components/AnimatedSection';

export default function GalleryClient({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<Photo | null>(null);

  const close = useCallback(() => setSelected(null), []);

  // Keyboard: Escape to close, arrows to navigate
  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const idx = photos.findIndex(p => p.id === selected.id);
        if (idx === -1) return;
        const next = e.key === 'ArrowLeft'
          ? (idx - 1 + photos.length) % photos.length
          : (idx + 1) % photos.length;
        if (photos[next].url) setSelected(photos[next]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, photos, close]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo, i) => (
          <AnimatedSection key={photo.id} animation="fade-in-up" delay={i * 80}>
            <div className="glass-card glass-card-hover rounded-lg overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-sky-100 to-sky-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center p-2 cursor-pointer"
                onClick={() => photo.url && setSelected(photo)}
              >
                {photo.url ? (
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-contain rounded" />
                ) : (
                  <svg className="w-16 h-16 text-sky-300 dark:text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sky-900 dark:text-white mb-1">{photo.title}</h3>
                <p className="text-sm text-foreground/60 dark:text-sky-300">{photo.category}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* Lightbox overlay */}
      {selected?.url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full
              bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            src={selected.url}
            alt={selected.title}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
            onClick={e => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white/90 font-medium text-lg drop-shadow-lg">{selected.title}</p>
            <p className="text-white/50 text-sm">{selected.category}</p>
          </div>
        </div>
      )}
    </>
  );
}
