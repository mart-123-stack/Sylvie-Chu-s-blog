import Link from "next/link";
import { getPhotos } from "@/lib/config";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GalleryPage() {
  const photos = await getPhotos();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 dark:from-sky-950 dark:to-indigo-950">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-sky-100 dark:bg-sky-950/80 dark:border-sky-900">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-sky-900 dark:text-white">Sylive Chu&apos;s Blog</h1>
            <div className="space-x-6">
              <Link href="/" className="text-foreground/70 hover:text-sky-600 dark:hover:text-sky-400 transition">
                Home
              </Link>
              <Link href="/blog" className="text-foreground/70 hover:text-sky-600 dark:hover:text-sky-400 transition">
                Blog
              </Link>
              <Link href="/about" className="text-foreground/70 hover:text-sky-600 dark:hover:text-sky-400 transition">
                About
              </Link>
              <Link href="/gallery" className="text-foreground/70 hover:text-sky-600 dark:hover:text-sky-400 transition">
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-sky-900 dark:text-white mb-8">Photo Gallery</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white dark:bg-sky-950 rounded-lg shadow-lg shadow-sky-100 dark:shadow-sky-900/20 overflow-hidden hover:shadow-xl hover:shadow-sky-200 dark:hover:shadow-sky-800/30 transition transform hover:-translate-y-1"
            >
              <div className="aspect-video bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-800 dark:to-sky-700 flex items-center justify-center">
                {photo.url ? (
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-sky-300 dark:text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sky-900 dark:text-white mb-1">{photo.title}</h3>
                <p className="text-sm text-foreground/60 dark:text-sky-300">{photo.category}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm dark:bg-sky-950/80 mt-12 py-6 border-t border-sky-100 dark:border-sky-900">
        <div className="max-w-6xl mx-auto px-4 text-center text-foreground/50 dark:text-sky-300">
          <p>&copy; 2024 Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
