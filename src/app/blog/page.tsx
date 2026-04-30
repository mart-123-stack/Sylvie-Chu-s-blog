import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Blog</h1>
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

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">Blog Posts</h2>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Getting Started with Next.js</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">A comprehensive guide to building modern web applications with Next.js</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">March 15, 2024</span>
              <Link href="/blog/getting-started-with-nextjs" className="text-blue-600 dark:text-blue-400 hover:underline">
                Read more →
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Tailwind CSS Best Practices</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Learn how to write clean and maintainable Tailwind CSS code</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">March 10, 2024</span>
              <Link href="/blog/tailwind-best-practices" className="text-blue-600 dark:text-blue-400 hover:underline">
                Read more →
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Building Responsive Layouts</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Master the art of creating responsive web designs</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">March 5, 2024</span>
              <Link href="/blog/responsive-layouts" className="text-blue-600 dark:text-blue-400 hover:underline">
                Read more →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2024 Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
