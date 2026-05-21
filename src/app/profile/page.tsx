'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Favorite {
  post_slug: string;
  title: string;
  excerpt: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, token, isAdmin, authLoaded, logout } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoaded) return;
    if (!token || isAdmin) {
      router.push('/login');
      return;
    }
    fetchFavorites();
  }, [token, isAdmin, authLoaded, router]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!authLoaded) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!token || isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-100 dark:from-sky-950 dark:to-indigo-950">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-900">My Profile</h1>
          <div className="space-x-4">
            <Link href="/" className="text-sky-600 hover:underline">Home</Link>
            <button onClick={handleLogout} className="text-red-500 hover:underline">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-sky-100">
          <h2 className="text-xl font-semibold text-sky-900 mb-2">{user?.nickname}</h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <h2 className="text-xl font-semibold text-sky-900 mb-4">My Favorites</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center border border-sky-100">
            <p className="text-gray-500">No favorites yet.</p>
            <Link href="/blog" className="text-sky-600 hover:underline mt-2 inline-block">
              Browse blog posts
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav) => (
              <Link key={fav.post_slug} href={`/blog/${fav.post_slug}`}>
                <div className="bg-white rounded-lg shadow-lg p-6 border border-sky-100 hover:shadow-xl transition">
                  <h3 className="text-lg font-semibold text-sky-900 mb-1">
                    {fav.title || '(untitled)'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{fav.excerpt}</p>
                  <p className="text-gray-400 text-xs">
                    Saved on {new Date(fav.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
