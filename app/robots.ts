import type { MetadataRoute } from 'next';
import { getMarketingSiteUrl } from '@/lib/marketingMetadata';

export default function robots(): MetadataRoute.Robots {
  const base = getMarketingSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
