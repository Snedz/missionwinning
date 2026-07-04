import type { MetadataRoute } from 'next';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { EXERCISES } from '@/data/exercises';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://missionwinning.com';
  const routes = ['', '/about', '/vision', '/bundle', '/compare', '/terms', '/privacy', '/welcome', '/guide', '/exercises'];
  const now = new Date();
  const staticEntries = routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
    priority: path === '' ? 1 : 0.7,
  }));

  const guideEntries = BEYOND_THE_BASICS_CHAPTERS.map((ch) => ({
    url: `${base}/guide/${ch.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const exerciseEntries = EXERCISES.map((ex) => ({
    url: `${base}/exercises/${ex.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...guideEntries, ...exerciseEntries];
}
