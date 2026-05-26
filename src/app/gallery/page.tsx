import { getPhotos } from "@/lib/config";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GalleryPage() {
  const photos = await getPhotos();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-100 dark:from-slate-900 dark:to-indigo-950">

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-sky-900 dark:text-white mb-8">Photo Gallery</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-lg shadow-sky-100 dark:shadow-slate-900/30 overflow-hidden hover:shadow-xl hover:shadow-sky-200 dark:hover:shadow-slate-800/30 transition transform hover:-translate-y-1"
            >
              <div className="aspect-video bg-gradient-to-br from-sky-100 to-sky-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center p-2">
                {photo.url ? (
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-contain rounded" />
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
          <p>&copy; {new Date().getFullYear()} Personal Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
