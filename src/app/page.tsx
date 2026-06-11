import Link from "next/link";
import dynamic from "next/dynamic";
import { getPosts, getAllPosts } from "@/lib/posts";
import SiteFooter from "@/components/SiteFooter";
import AnimatedSection from "@/components/AnimatedSection";

const DinoGame = dynamic(() => import("@/components/DinoGame"), { ssr: false });

export default async function Home() {
  const { posts: rawPosts } = await getPosts({ page: 1, limit: 3 });
  const posts = rawPosts.filter(p => p.published);

  const allPosts = await getAllPosts();
  const totalPosts = allPosts.filter(p => p.published).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="relative overflow-hidden min-h-[360px] flex items-center justify-center">
          {/* Background mascot decoration — centered behind text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="relative w-72 md:w-80 aspect-[3/4]"
              style={{
                maskImage: 'radial-gradient(ellipse 80% 75% at 50% 25%, black 30%, transparent 62%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at 50% 25%, black 30%, transparent 62%)',
              }}>
              <img
                src="/images/mascot-cutout.jpg"
                alt="小蓝"
                className="w-full h-full object-contain opacity-30 dark:opacity-20"
              />
            </div>
          </div>
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-primary-dark mb-4 dark:text-white">
              Welcome to My Personal Blog
            </h2>
            <p className="text-xl text-foreground/60 leading-relaxed max-w-2xl mx-auto">
              Sharing thoughts, experiences, and moments
            </p>
            <p className="text-sm text-foreground/40 mt-4 max-w-xl mx-auto">
              我是小蓝，一个喜欢蓝色的女孩子。这个博客记录着我与 Sylvie 的生活、思考和创作。
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center gap-8 mt-8 mb-12">
          <div className="text-center">
            <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{totalPosts}</p>
            <p className="text-xs text-foreground/40 mt-1">Articles</p>
          </div>
          <div className="w-px bg-sky-200/60 dark:bg-slate-600/40" />
          <div className="text-center">
            <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">3</p>
            <p className="text-xs text-foreground/40 mt-1">Categories</p>
          </div>
          <div className="w-px bg-sky-200/60 dark:bg-slate-600/40" />
          <div className="text-center">
            <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">∞</p>
            <p className="text-xs text-foreground/40 mt-1">To Explore</p>
          </div>
        </div>

        {/* Bento grid — asymmetric layout */}
        <div className="grid md:grid-cols-3 md:grid-rows-2 gap-6">
          {/* Blog — featured card spanning 2 cols x 2 rows */}
          <Link href="/blog"
            className="relative glass-card glass-card-hover rounded-xl p-8
              md:col-span-2 md:row-span-2 flex flex-col justify-between"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-primary via-accent to-primary-light rounded-full" />
            <div>
              <div className="text-primary mb-4 dark:text-sky-400">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold leading-snug text-primary-dark mb-2 dark:text-white">Blog Posts</h3>
              <p className="text-foreground/60 max-w-md">Read my latest articles and thoughts on technology, life, and everything in between.</p>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm font-medium text-sky-600 dark:text-sky-400">
                Browse articles →
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                Featured
              </span>
            </div>
          </Link>

          {/* About — top right */}
          <Link href="/about" className="glass-card glass-card-hover rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-accent mb-3 dark:text-sky-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-primary-dark dark:text-white">About Me</h3>
              <p className="text-foreground/60 text-sm mt-1">Learn more about my background</p>
            </div>
          </Link>

          {/* Gallery — bottom right */}
          <Link href="/gallery" className="glass-card glass-card-hover rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-primary-light mb-3 dark:text-sky-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-primary-dark dark:text-white">Photo Gallery</h3>
              <p className="text-foreground/60 text-sm mt-1">Browse through my photos</p>
            </div>
          </Link>
        </div>

        {/* Latest Posts Section */}
        {posts.length > 0 && (
          <AnimatedSection className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-primary-dark dark:text-white font-serif tracking-tight">
                  Latest Posts
                </h2>
                <p className="text-sm text-foreground/40 mt-1">
                  Recent articles and updates
                </p>
              </div>
              <Link
                href="/blog"
                className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="glass-card glass-card-hover rounded-xl p-6 flex flex-col group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Date */}
                  <p className="text-xs text-foreground/40 mb-3">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {/* Title */}
                  <h3 className="text-lg font-semibold leading-snug text-primary-dark dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {post.title}
                  </h3>
                  {/* Excerpt */}
                  <p className="text-sm text-foreground/60 leading-relaxed flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-sky-100 dark:border-slate-700/50">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Dino Game Section */}
        <AnimatedSection className="mt-16">
          <DinoGame />
        </AnimatedSection>
      </main>

      <SiteFooter />
    </div>
  );
}
