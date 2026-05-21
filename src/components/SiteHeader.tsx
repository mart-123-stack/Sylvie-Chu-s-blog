'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function SiteHeader() {
  const { user, token, isAdmin, authLoaded } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-sky-100">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-sky-900">
            Sylive Chu&apos;s Blog
          </Link>
          <div className="space-x-6">
            <Link href="/" className="text-foreground/70 hover:text-sky-700 transition">Home</Link>
            <Link href="/blog" className="text-foreground/70 hover:text-sky-700 transition">Blog</Link>
            <Link href="/about" className="text-foreground/70 hover:text-sky-700 transition">About</Link>
            <Link href="/gallery" className="text-foreground/70 hover:text-sky-700 transition">Gallery</Link>
            {authLoaded && (token || user) ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="text-sky-600 hover:text-sky-700 transition font-medium">
                    Admin
                  </Link>
                ) : (
                  <Link href="/profile" className="text-sky-600 hover:text-sky-700 transition font-medium">
                    Profile
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className="text-foreground/70 hover:text-sky-700 transition">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
