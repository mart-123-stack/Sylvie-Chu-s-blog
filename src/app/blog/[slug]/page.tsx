import type { Metadata } from "next";
import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import LikeFavoriteBar from "@/components/LikeFavoriteBar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import AnimatedSection from "@/components/AnimatedSection";
import SiteFooter from "@/components/SiteFooter";

interface BlogPostParams {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogPostParams): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">

      <main className="max-w-4xl mx-auto px-4 py-12">
        <AnimatedSection animation="fade-in-up">
          <Link href="/blog" className="text-sky-600 hover:text-sky-700 hover:underline mb-6 inline-block dark:text-sky-400 dark:hover:text-sky-300">
            ← Back to Blog
          </Link>
        </AnimatedSection>

        <AnimatedSection animation="fade-in-up" delay={100}>
          <article className="glass-card rounded-xl p-8">
            <h1 className="text-5xl font-bold text-sky-900 mb-6 leading-tight tracking-tight dark:text-white">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-foreground/40 mb-6">
              <span>Published on {new Date(post.date).toLocaleDateString()} by {post.author}</span>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-2">
                  {post.tags.map(t => (
                    <Link
                      key={t}
                      href={`/blog?tag=${encodeURIComponent(t)}`}
                      className="text-xs px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full hover:bg-sky-200 transition dark:bg-sky-900 dark:text-sky-300 dark:hover:bg-sky-800"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="prose-readable mx-auto">
              <MarkdownRenderer content={post.content} />
            </div>

            <LikeFavoriteBar postSlug={params.slug} />
            <CommentSection postSlug={params.slug} />
          </article>
        </AnimatedSection>
      </main>

      <SiteFooter />
    </div>
  );
}
