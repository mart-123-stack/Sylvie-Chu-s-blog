import Link from "next/link";
import dynamic from "next/dynamic";
import SiteFooter from "@/components/SiteFooter";

const DinoGame = dynamic(() => import("@/components/DinoGame"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">

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

          <div className="relative z-10 text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-primary-dark mb-4 dark:text-white">
              Welcome to My Personal Blog
            </h2>
            <p className="text-xl text-foreground/60 leading-relaxed">
              Sharing thoughts, experiences, and moments
            </p>
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

          {/* Canvas FOMO — bottom right */}
          <Link href="/canvas-fomo" className="glass-card glass-card-hover rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-primary-light mb-3 dark:text-sky-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h2v2H7zM11 7h2v2h-2zM15 7h2v2h-2zM7 11h2v2H7zM11 11h2v2h-2zM15 11h2v2h-2zM7 15h2v2H7zM11 15h2v2h-2zM15 15h2v2h-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-primary-dark dark:text-white">Canvas FOMO</h3>
              <p className="text-foreground/60 text-sm mt-1">Paint & conquer the on-chain canvas</p>
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

        {/* Dino Game Section */}
        <div className="mt-12 max-w-6xl mx-auto">
          <DinoGame />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
