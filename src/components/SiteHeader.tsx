'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import CosmicCommandDeck from '@/components/CosmicCommandDeck';

export default function SiteHeader() {
  const { user, token, isAdmin, authLoaded } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-md border-b border-sky-100/70 dark:bg-slate-900/60 dark:border-slate-700/50'
        : 'bg-white/60 backdrop-blur-lg shadow-sm border-b border-sky-100/40 dark:bg-slate-900/40 dark:border-slate-700/30'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-sky-900 dark:text-white">
            <img
              src="/images/mascot.jpg"
              alt="小蓝"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-200 dark:ring-sky-700"
            />
            <span>Sylive Chu&apos;s Blog</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="nav-link text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition-colors">Home</Link>
            <Link href="/blog" className="nav-link text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition-colors">Blog</Link>
            <Link href="/about" className="nav-link text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition-colors">About</Link>
            <Link href="/gallery" className="nav-link text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition-colors">Gallery</Link>
            <Link href="/visitors" className="nav-link text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition-colors">Visitors</Link>
            {authLoaded && (token || user) ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition font-medium">
                    Admin
                  </Link>
                ) : (
                  <Link href="/profile" className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition font-medium">
                    Profile
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className="text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition">
                Login
              </Link>
            )}
            <CosmicCommandDeck />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
