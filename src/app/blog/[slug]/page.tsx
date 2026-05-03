import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sylive Chu&apos;s Blog</h1>
            <div className="space-x-6">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Home
              </Link>
              <Link href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Blog
              </Link>
              <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                About
              </Link>
              <Link href="/gallery" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">
          ← Back to Blog
        </Link>
        
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="text-gray-500 dark:text-gray-400 mb-6">
            Published on {new Date(post.date).toLocaleDateString()} by {post.author}
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Comments</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="font-semibold text-gray-800 dark:text-white mb-1">John Doe</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">March 16, 2024</div>
                <p className="text-gray-700 dark:text-gray-300">Great article! Very helpful.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="font-semibold text-gray-800 dark:text-white mb-1">Jane Smith</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">March 17, 2024</div>
                <p className="text-gray-700 dark:text-gray-300">Thanks for sharing this!</p>
              </div>
            </div>

            <form className="mt-6">
              <textarea
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Post Comment
              </button>
            </form>
          </div>
        </article>
      </main>

      <footer className="bg-white dark:bg-gray-800 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2024 Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
