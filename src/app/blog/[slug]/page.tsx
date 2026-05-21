import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import LikeFavoriteBar from "@/components/LikeFavoriteBar";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-100 to-indigo-100">

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/blog" className="text-sky-600 hover:text-sky-700 hover:underline mb-6 inline-block">
          ← Back to Blog
        </Link>

        <article className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-8 border border-sky-100">
          <h1 className="text-4xl font-bold text-sky-900 mb-4">
            {post.title}
          </h1>
          <div className="text-foreground/40 mb-6">
            Published on {new Date(post.date).toLocaleDateString()} by {post.author}
          </div>

          <div className="prose max-w-none">
            <p className="text-foreground/70 mb-4 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          <LikeFavoriteBar postSlug={params.slug} />
          <CommentSection postSlug={params.slug} />
        </article>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm mt-12 py-6 border-t border-sky-100">
        <div className="max-w-6xl mx-auto px-4 text-center text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
