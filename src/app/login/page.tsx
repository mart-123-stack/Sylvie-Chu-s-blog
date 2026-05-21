'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, adminLogin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const err = isAdminMode
      ? await adminLogin(password)
      : await login(email, password);

    if (err) {
      setError(err);
      setLoading(false);
    } else {
      router.push(isAdminMode ? '/admin' : '/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-100 dark:from-sky-950 dark:to-indigo-950 flex items-center justify-center">
      <div className="bg-white dark:bg-sky-950 rounded-lg shadow-lg shadow-sky-100 dark:shadow-sky-900/20 p-8 w-full max-w-md border border-sky-100 dark:border-sky-900">
        <h1 className="text-2xl font-bold text-sky-900 dark:text-white mb-6">
          {isAdminMode ? 'Admin Login' : 'Login'}
        </h1>
        <form onSubmit={handleSubmit}>
          {!isAdminMode && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : isAdminMode ? 'Login as Admin' : 'Login'}
          </button>
        </form>
        {!isAdminMode && (
          <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-sky-600 dark:text-sky-400 hover:underline">
              Register
            </Link>
          </p>
        )}
        <button
          onClick={() => setIsAdminMode(!isAdminMode)}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isAdminMode ? 'Switch to User Login' : 'Admin Login'}
        </button>
        <Link href="/" className="block mt-4 text-center text-sky-600 dark:text-sky-400 hover:underline text-sm">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
