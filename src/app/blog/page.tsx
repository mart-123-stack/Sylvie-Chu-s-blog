import Link from "next/link";
import { getPosts } from "@/lib/posts";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage() {
  const posts = (await getPosts()).filter(post => post.published);

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

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-sky-900 mb-8">Blog Posts</h2>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-8 text-center border border-sky-100">
              <p className="text-foreground/60">No posts published yet.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-6 hover:shadow-xl hover:shadow-sky-200 transition border border-sky-100">
                <h3 className="text-2xl font-semibold text-sky-900 mb-2">{post.title}</h3>
                <p className="text-foreground/60 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/40">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <Link href={`/blog/${post.slug}`} className="text-sky-600 hover:text-sky-700 hover:underline">
                    Read more →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm mt-12 py-6 border-t border-sky-100">
        <div className="max-w-6xl mx-auto px-4 text-center text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
