import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

interface UserProfile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  comment_count: number;
}

interface Comment {
  id: string;
  post_slug: string;
  content: string;
  created_at: string;
  post_title: string;
}

export default async function UserPage({ params }: { params: { id: string } }) {
  let user: UserProfile | null = null;
  let recentComments: Comment[] = [];

  try {
    const result = await query(
      `SELECT u.id, u.nickname, u.avatar_url, u.bio, u.location, u.created_at,
              COUNT(c.id)::int AS comment_count
       FROM users u
       LEFT JOIN comments c ON c.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id
       LIMIT 1`,
      [params.id]
    );
    if (result.rows.length > 0) {
      user = result.rows[0];
    }
  } catch {
    // fall through to 404
  }

  if (!user) notFound();

  // Fetch recent comments
  try {
    const commentsResult = await query(
      `SELECT c.id, c.post_slug, c.content, c.created_at,
              COALESCE(p.title, '(deleted)') AS post_title
       FROM comments c
       LEFT JOIN posts p ON p.slug = c.post_slug
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC
       LIMIT 10`,
      [params.id]
    );
    recentComments = commentsResult.rows;
  } catch {}

  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-foreground/50 hover:text-sky-600 dark:hover:text-sky-400 transition-colors mb-6 inline-block">
          ← Back to Home
        </Link>

        {/* Profile card */}
        <div className="glass-card rounded-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent ring-4 ring-white dark:ring-slate-800 shadow-lg shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.nickname} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {user.nickname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="text-center sm:text-left min-w-0">
              <h1 className="text-3xl font-bold text-sky-900 dark:text-white">
                {user.nickname}
              </h1>
              {user.location && (
                <p className="text-foreground/50 text-sm mt-1">{user.location}</p>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-sm text-foreground/40">
                <span>Joined {joinDate}</span>
                <span className="w-1 h-1 rounded-full bg-foreground/20" />
                <span>{user.comment_count} comment{user.comment_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {user.bio && (
            <div className="mt-6 pt-6 border-t border-border">
              <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-2">Bio</h2>
              <p className="text-foreground/70 whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Recent comments */}
        {recentComments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold leading-snug text-sky-900 dark:text-white mb-4">
              Recent Comments
            </h2>
            <div className="space-y-3">
              {recentComments.map((comment) => (
                <Link
                  key={comment.id}
                  href={`/blog/${comment.post_slug}`}
                  className="glass-card glass-card-hover rounded-xl p-5 block"
                >
                  <p className="text-foreground/70 text-sm line-clamp-2 mb-2">
                    {comment.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-foreground/40">
                    <span>on <span className="text-sky-600 dark:text-sky-400">{comment.post_title}</span></span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
