import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-100 to-indigo-100">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-dark">Sylive Chu&apos;s Blog</h1>
            <div className="space-x-6">
              <Link href="/" className="text-foreground/70 hover:text-primary transition">
                Home
              </Link>
              <Link href="/blog" className="text-foreground/70 hover:text-primary transition">
                Blog
              </Link>
              <Link href="/about" className="text-foreground/70 hover:text-primary transition">
                About
              </Link>
              <Link href="/gallery" className="text-foreground/70 hover:text-primary transition">
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-primary-dark mb-4">
            Welcome to My Personal Blog
          </h2>
          <p className="text-xl text-foreground/60">
            Sharing thoughts, experiences, and moments
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Link href="/blog" className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-6 hover:shadow-xl hover:shadow-sky-100 transition transform hover:-translate-y-1 border border-sky-100">
            <div className="text-primary mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-dark mb-2">Blog Posts</h3>
            <p className="text-foreground/60">Read my latest articles and thoughts</p>
          </Link>

          <Link href="/about" className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-6 hover:shadow-xl hover:shadow-sky-100 transition transform hover:-translate-y-1 border border-sky-100">
            <div className="text-accent mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-dark mb-2">About Me</h3>
            <p className="text-foreground/60">Learn more about my background and experience</p>
          </Link>

          <Link href="/gallery" className="bg-white/90 rounded-xl shadow-lg shadow-sky-100 p-6 hover:shadow-xl hover:shadow-sky-100 transition transform hover:-translate-y-1 border border-sky-100">
            <div className="text-primary-light mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-dark mb-2">Photo Gallery</h3>
            <p className="text-foreground/60">Browse through my photo collection</p>
          </Link>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm mt-12 py-6 border-t border-sky-100">
        <div className="max-w-6xl mx-auto px-4 text-center text-foreground/50">
          <p>&copy; 2024 Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
