'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BlogSearchBarProps {
  initialSearch?: string;
}

export default function BlogSearchBar({ initialSearch = '' }: BlogSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialSearch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('search', query.trim());
    }
    router.push(`/blog${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm w-48 sm:w-64"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition text-sm"
      >
        Search
      </button>
    </form>
  );
}
