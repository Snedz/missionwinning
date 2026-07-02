import type { MetadataRoute } from 'next';
import { getMarketingSiteUrl } from '@/lib/marketingMetadata';

/** Public marketing + legal routes for crawlers. */
const PUBLIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/bundle', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/welcome', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/vision', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getMarketingSiteUrl();
  const lastModified = new Date();
  return PUBLIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
