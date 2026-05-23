import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

const BASE_URL = 'https://sylivechu.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPosts = await getAllPosts();
  const publishedPosts = allPosts.filter(p => p.published);

  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/blog`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/about`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/gallery`, priority: 0.6, changeFrequency: 'monthly' },
    ...publishedPosts.map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      priority: 0.8 as const,
      changeFrequency: 'monthly' as const,
      lastModified: new Date(post.date),
    })),
  ];

  return entries;
}
