'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function LikeFavoriteBar({ postSlug }: { postSlug: string }) {
  const { user, token } = useAuth();
  const [likes, setLikes] = useState({ count: 0, liked: false });
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/likes?post_slug=${postSlug}`, { headers })
      .then(r => r.json())
      .then(d => setLikes(d))
      .catch(() => {});

    if (token) {
      fetch(`/api/favorites?check=${postSlug}`, { headers })
        .then(r => r.json())
        .then(d => setFavorited(d.some((f: any) => f.post_slug === postSlug)))
        .catch(() => {});
    }
  }, [postSlug, token]);

  const handleLike = async () => {
    if (!token) return;
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ post_slug: postSlug }),
    });
    if (res.ok) {
      const data = await res.json();
      setLikes(data);
    }
  };

  const handleFavorite = async () => {
    if (!token) return;
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ post_slug: postSlug }),
    });
    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-y border-sky-100 my-6 dark:border-slate-700">
      <button
        onClick={handleLike}
        disabled={!token}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition text-sm ${
          likes.liked
            ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:text-sky-300 dark:border-slate-600 dark:hover:bg-slate-600'
        } ${!token ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span>{likes.liked ? '❤️' : '🤍'}</span>
        <span>{likes.count}</span>
      </button>

      <button
        onClick={handleFavorite}
        disabled={!token}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition text-sm ${
          favorited
            ? 'bg-yellow-50 text-yellow-600 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:text-sky-300 dark:border-slate-600 dark:hover:bg-slate-600'
        } ${!token ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span>{favorited ? '★' : '☆'}</span>
        <span>{favorited ? 'Saved' : 'Save'}</span>
      </button>

      {!token && (
        <Link href="/login" className="text-xs text-sky-600 hover:underline ml-auto dark:text-sky-400">
          Login to like & save
        </Link>
      )}
    </div>
  );
}
