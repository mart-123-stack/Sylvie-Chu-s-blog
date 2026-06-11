import { getPhotos } from "@/lib/config";
import GalleryClient from "@/components/GalleryClient";
import SiteFooter from "@/components/SiteFooter";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GalleryPage() {
  const photos = await getPhotos();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:to-blue-950">

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-5xl font-bold leading-tight tracking-tight text-sky-900 dark:text-white mb-8">Photo Gallery</h2>

        <GalleryClient photos={photos} />
      </main>

      <SiteFooter />
    </div>
  );
}
