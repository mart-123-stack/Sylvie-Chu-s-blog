'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteFooter from '@/components/SiteFooter';

interface Favorite {
  post_slug: string;
  title: string;
  excerpt: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, token, isAdmin, authLoaded, logout, refreshUser, setAuthToken } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoaded) return;
    if (!token || isAdmin) {
      router.push('/login');
      return;
    }
    fetchFavorites();
  }, [token, isAdmin, authLoaded, router]);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image too large (max 5MB)');
      return;
    }

    setAvatarUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setAvatarUrl(data.url);
      } else {
        setMessage('Upload failed');
      }
    } catch {
      setMessage('Upload error');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    // Read token directly from localStorage to avoid stale React state
    const t = localStorage.getItem('token');
    if (!t) { setMessage('Not logged in'); setSaving(false); return; }
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ nickname, bio, location, avatar_url: avatarUrl || null }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error === 'Unauthorized' ? 'Session expired, please login again' : data.error);
      } else {
        if (data.token) {
          setAuthToken(data.token);
        }
        await refreshUser();
        setMessage('Profile updated!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-foreground/40">Loading...</div>
      </div>
    );
  }
  if (!token || isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 dark:from-sky-950 dark:to-blue-950">

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-sky-900 dark:text-white">
            My Profile
          </h2>
          <div className="flex items-center gap-3">
            <Link href="/" className="nav-link text-sm text-foreground/50 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile editor card */}
        <div className="glass-card rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar section */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent ring-4 ring-white dark:ring-slate-800 shadow-lg">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {nickname.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="text-sm px-4 py-1.5 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 transition disabled:opacity-50 dark:bg-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-800/50"
              >
                {avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
            </div>

            {/* Form fields */}
            <div className="flex-1 space-y-5 min-w-0">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-sky-50/50 text-foreground/50 cursor-not-allowed dark:bg-slate-800/50 dark:border-slate-700"
                />
                <p className="text-xs text-foreground/40 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  maxLength={60}
                  placeholder="City, Country"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                <p className="text-xs text-foreground/40 mt-1 text-right">{bio.length}/500</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {message && (
                  <span className={`text-sm ${message === 'Profile updated!' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Favorites section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold leading-snug text-sky-900 dark:text-white mb-4">
            My Favorites
          </h2>
          {loading ? (
            <div className="animate-pulse text-foreground/40 text-center py-8">Loading favorites...</div>
          ) : favorites.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-foreground/50 mb-3">No favorites yet.</p>
              <Link href="/blog" className="text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline text-sm">
                Browse blog posts →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav) => (
                <Link key={fav.post_slug} href={`/blog/${fav.post_slug}`}>
                  <div className="glass-card glass-card-hover rounded-xl p-5">
                    <h3 className="font-semibold text-sky-900 dark:text-white mb-1">
                      {fav.title || '(untitled)'}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-2 line-clamp-2">{fav.excerpt}</p>
                    <p className="text-xs text-foreground/40">
                      Saved on {new Date(fav.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
