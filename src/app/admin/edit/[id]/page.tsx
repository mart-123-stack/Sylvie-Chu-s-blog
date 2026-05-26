'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MarkdownEditor from '@/components/MarkdownEditor';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
  published: boolean;
  tags: string[];
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: 'Admin',
    published: false,
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts?t=${Date.now()}`);
      const data = await response.json();
      const posts: Post[] = Array.isArray(data) ? data : data.posts || [];
      const post = posts.find((p: Post) => p.id === params.id);

      if (post) {
        setFormData({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          author: post.author,
          published: post.published,
          tags: (post.tags || []).join(', '),
        });
      }
    } catch (err) {
      setError('Failed to fetch post');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('adminToken');
    let slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!slug) slug = `post-${Date.now()}`;

    const tags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          author: formData.author,
          published: formData.published,
          tags,
          slug,
        }),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        setError('Failed to update post');
      }
    } catch (err) {
      setError('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-100 dark:from-sky-950 dark:to-indigo-950 flex items-center justify-center">
        <p className="text-sky-900 dark:text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-100 dark:from-sky-950 dark:to-indigo-950">
      <nav className="bg-white dark:bg-sky-950 shadow-sm border-b border-sky-100 dark:border-sky-900">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-sky-900 dark:text-white">Edit Post</h1>
            <Link
              href="/admin"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
            >
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-sky-950 rounded-lg shadow-lg shadow-sky-100 dark:shadow-sky-900/20 p-8 border border-sky-100 dark:border-sky-900">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Next.js, TypeScript, React"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-sky-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              rows={3}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">
              Content (Markdown)
            </label>
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              minHeight="500px"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Published</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Post'}
          </button>
        </form>
      </main>
    </div>
  );
}
