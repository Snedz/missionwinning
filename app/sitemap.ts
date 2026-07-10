import type { MetadataRoute } from 'next';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { EXERCISES } from '@/data/exercises';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import { EQUIPMENT_HUBS, muscleHubSlug } from '@/lib/exerciseSeo';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://missionwinning.com';
  const routes = [
    '',
    '/about',
    '/vision',
    '/bundle',
    '/compare',
    '/compare/forge',
    '/compare/freeletics',
    '/compare/spreadsheet',
    '/terms',
    '/privacy',
    '/welcome',
    '/guide',
    '/exercises',
    '/learn',
    '/paths',
  ];
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

  const muscleHubs = MAJOR_GROUPS.map((g) => ({
    url: `${base}/exercises/muscle/${muscleHubSlug(g)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.55,
  }));

  const equipmentHubs = EQUIPMENT_HUBS.map((h) => ({
    url: `${base}/exercises/equipment/${h.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.55,
  }));

  const learnEntries = FREE_LEARN_PATHS.map((p) => ({
    url: `${base}/paths/${p.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.55,
  }));

  return [
    ...staticEntries,
    ...guideEntries,
    ...exerciseEntries,
    ...muscleHubs,
    ...equipmentHubs,
    ...learnEntries,
  ];
}
