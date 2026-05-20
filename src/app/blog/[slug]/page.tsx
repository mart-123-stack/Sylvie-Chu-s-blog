import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-sky-900">Sylive Chu&apos;s Blog</h1>
            <div className="space-x-6">
              <Link href="/" className="text-foreground/70 hover:text-sky-700 transition">Home</Link>
              <Link href="/blog" className="text-foreground/70 hover:text-sky-700 transition">Blog</Link>
              <Link href="/about" className="text-foreground/70 hover:text-sky-700 transition">About</Link>
              <Link href="/gallery" className="text-foreground/70 hover:text-sky-700 transition">Gallery</Link>
            </div>
          </div>
        </div>
      </nav>

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

            <div className="mt-12 pt-8 border-t border-sky-100">
            <h3 className="text-2xl font-semibold text-sky-900 mb-4">Comments</h3>
            <div className="space-y-4">
              <div className="bg-sky-50/50 rounded-lg p-4 border border-sky-100">
                <div className="font-semibold text-sky-900 mb-1">John Doe</div>
                <div className="text-foreground/40 text-sm mb-2">March 16, 2024</div>
                <p className="text-foreground/70">Great article! Very helpful.</p>
              </div>
              <div className="bg-sky-50/50 rounded-lg p-4 border border-sky-100">
                <div className="font-semibold text-sky-900 mb-1">Jane Smith</div>
                <div className="text-foreground/40 text-sm mb-2">March 17, 2024</div>
                <p className="text-foreground/70">Thanks for sharing this!</p>
              </div>
            </div>

            <form className="mt-6">
              <textarea
                className="w-full p-4 border border-sky-200 rounded-lg bg-white/80 text-foreground focus:ring-2 focus:ring-sky-200 focus:border-sky-200"
                rows={4}
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
              >
                Post Comment
              </button>
            </form>
          </div>
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
