'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface Comment {
  id: string;
  post_slug: string;
  author_name: string;
  content: string;
  created_at: string;
  user_id?: string | null;
  parent_id?: string | null;
  nickname?: string;
}

export default function CommentSection({ postSlug }: { postSlug: string }) {
  const { user, token, authLoaded } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?post_slug=${postSlug}`);
      const data = await res.json();
      setComments(data);
    } catch {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError('');

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const body: any = { post_slug: postSlug, content: content.trim() };
      if (!user) body.author_name = authorName.trim();
      if (replyTo) body.parent_id = replyTo;

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([newComment, ...comments]);
        setContent('');
        setReplyTo(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to post comment');
      }
    } catch {
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id && c.parent_id !== id));
      }
    } catch {
      setError('Failed to delete comment');
    }
  };

  // Group top-level comments and replies
  const topComments = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);
  const getReplies = (parentId: string) => replies.filter(r => r.parent_id === parentId);

  const displayName = (comment: Comment) => comment.nickname || comment.author_name;

  return (
    <div className="mt-12 pt-8 border-t border-sky-100">
      <h3 className="text-2xl font-semibold text-sky-900 dark:text-white mb-4">Comments ({comments.length})</h3>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-8 bg-sky-50/50 dark:bg-sky-900/30 rounded-lg p-4 border border-sky-100 dark:border-sky-800">
        {replyTo && (
          <div className="mb-3 flex items-center justify-between text-sm text-sky-600 dark:text-sky-400">
            <span>Replying to a comment</span>
            <button type="button" onClick={() => setReplyTo(null)} className="hover:underline">Cancel</button>
          </div>
        )}
        {!user && (
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name (or login)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-sky-500 mb-3"
            required={!user}
          />
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-4 border border-sky-200 rounded-lg bg-white text-gray-800 dark:bg-sky-900 dark:text-white dark:border-sky-700 focus:ring-2 focus:ring-sky-500"
          rows={3}
          placeholder={user ? `Comment as ${user.nickname}...` : 'Write a comment...'}
          required
        />
        <div className="flex items-center justify-between mt-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
          >
            {submitting ? 'Posting...' : replyTo ? 'Reply' : 'Post Comment'}
          </button>
          {!user && (
            <Link href="/login" className="text-sm text-sky-600 hover:underline">
              Login to comment as user
            </Link>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {topComments.map((comment) => (
            <div key={comment.id}>
              <div className="bg-sky-50/50 dark:bg-sky-900/20 rounded-lg p-4 border border-sky-100 dark:border-sky-800">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-sky-900 dark:text-white">
                      {displayName(comment)}
                    </span>
                    {comment.user_id && (
                      <span className="ml-2 text-xs bg-sky-200 dark:bg-sky-700 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded">
                        user
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                    {comment.user_id && token && (comment.user_id === user?.id) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{comment.content || ''}</p>
                {token && (
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="text-xs text-sky-500 hover:text-sky-700 mt-2"
                  >
                    Reply
                  </button>
                )}
              </div>

              {/* Replies */}
              {getReplies(comment.id).length > 0 && (
                <div className="ml-8 mt-2 space-y-2">
                  {getReplies(comment.id).map((reply) => (
                    <div key={reply.id} className="bg-sky-50/30 dark:bg-sky-900/10 rounded-lg p-3 border border-sky-100 dark:border-sky-800">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sky-900 dark:text-white text-sm">
                          {displayName(reply)}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
