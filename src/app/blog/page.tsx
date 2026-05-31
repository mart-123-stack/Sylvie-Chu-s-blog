import Link from "next/link";
import { getPosts, getAllTags } from "@/lib/posts";
import BlogSearchBar from "@/components/BlogSearchBar";
import BlogPagination from "@/components/BlogPagination";
import AnimatedSection from "@/components/AnimatedSection";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BlogPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const tag = typeof searchParams?.tag === 'string' ? searchParams.tag : undefined;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : undefined;
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;

  const { posts: allPosts, total } = await getPosts({
    tag,
    search,
    page,
    limit: 5,
  });

  const posts = allPosts.filter(post => post.published);
  const tags = await getAllTags();
  const totalPages = Math.ceil(total / 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-100 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h2 className="text-5xl font-bold leading-tight tracking-tight text-sky-900 dark:text-white">Blog Posts</h2>
          <BlogSearchBar initialSearch={search} />
        </div>

        {/* Tags filter */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/blog"
              className={`px-3 py-1 rounded-full text-sm transition ${
                !tag
                  ? 'bg-sky-600 text-white'
                  : 'bg-white/80 text-sky-700 hover:bg-sky-100 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700'
              }`}
            >
              All
            </Link>
            {tags.map(t => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  tag === t
                    ? 'bg-sky-600 text-white'
                    : 'bg-white/80 text-sky-700 hover:bg-sky-100 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700'
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        {search && (
          <p className="text-foreground/60 mb-6">
            Search results for: <span className="font-semibold text-sky-700 dark:text-sky-400">&ldquo;{search}&rdquo;</span>
            {posts.length === 0 ? ' — no posts found' : ` — ${total} post${total !== 1 ? 's' : ''}`}
          </p>
        )}

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-8 text-center border border-sky-100 dark:bg-slate-800/90 dark:border-slate-700 dark:shadow-slate-900/30">
              <p className="text-foreground/60">
                {search || tag ? 'No posts match your criteria.' : 'No posts published yet.'}
              </p>
            </div>
          ) : (
            posts.map((post, i) => (
              <AnimatedSection key={post.id} animation="fade-in-up" delay={i * 80}>
                <div className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-6 hover:shadow-xl hover:shadow-sky-200 transition border border-sky-100 dark:bg-slate-800/90 dark:border-slate-700 dark:shadow-slate-900/30 dark:hover:shadow-slate-800/30">
                  <h3 className="text-2xl font-semibold text-sky-900 mb-2 dark:text-white">{post.title}</h3>
                  <p className="text-foreground/60 mb-4">{post.excerpt}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-foreground/40">
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map(t => (
                            <span
                              key={t}
                              className="text-xs px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full dark:bg-sky-900 dark:text-sky-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link href={`/blog/${post.slug}`} className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 hover:underline">
                      Read more →
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <BlogPagination currentPage={page} totalPages={totalPages} tag={tag} search={search} />
        )}
      </main>

      <footer className="bg-white/80 backdrop-blur-sm mt-12 py-6 border-t border-sky-100 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 text-center text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
