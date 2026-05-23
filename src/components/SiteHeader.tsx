'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

export default function SiteHeader() {
  const { user, token, isAdmin, authLoaded } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-sky-100 dark:bg-sky-950/80 dark:border-sky-900">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-sky-900 dark:text-white">
            Sylive Chu&apos;s Blog
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition">Home</Link>
            <Link href="/blog" className="text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition">Blog</Link>
            <Link href="/about" className="text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition">About</Link>
            <Link href="/gallery" className="text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 transition">Gallery</Link>
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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground/70 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900 transition"
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
