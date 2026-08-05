import type { MetadataRoute } from 'next';
import { siteBaseUrl } from '@/lib/seoMetadata';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { EXERCISES, ensureFullExerciseCatalog } from '@/data/exercises';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { COMPARE_STORIES } from '@/data/compareStories';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import { EQUIPMENT_HUBS, muscleHubSlug } from '@/lib/exerciseSeo';
import { isPathEnabled } from '@/lib/surface';
import { isFreeBeta } from '@/lib/freeBeta';
import { isPrivateGatePublicPath } from '@/lib/publicRoutes';

/**
 * Whether the private beta gate is active for this build. Mirrors
 * `isPrivateModeEnabled()` in `src/lib/privateGate.ts`, which is not imported here
 * because it pulls in `@supabase/supabase-js`.
 */
function privateGateOn(): boolean {
  const flag = process.env.PRIVATE_MODE;
  if (flag === 'false' || flag === '0') return false;
  if (flag === 'true' || flag === '1') return true;
  return process.env.NODE_ENV === 'production';
}

/**
 * Awaited on purpose: `EXERCISES` is the base catalog until
 * `ensureFullExerciseCatalog()` splices the rest in. This function used to get the full
 * count by luck — a build worker that had already rendered `/exercises` happened to have
 * loaded it — which is how the sitemap came to advertise 219 exercise URLs while only
 * 126 were prerendered. Never read the catalog without awaiting it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureFullExerciseCatalog();
  const gateOn = privateGateOn();
  // One definition of the canonical host — see app/robots.ts for what a second one cost.
  const base = siteBaseUrl();
  const routes = [
    '',
    '/about',
    '/vision',
    // `/bundle` is deliberately absent during the free beta: it 307s to `/`, and a
    // sitemap should only carry URLs that answer 200. Re-add it with the paid surfaces.
    ...(isFreeBeta() ? [] : ['/bundle']),
    '/compare',
    '/press',

    '/terms',
    '/privacy',
    '/cookies',
    '/accessibility',
    '/dmca',
    '/refunds',
    '/welcome',
    '/guide',
    '/exercises',
    '/learn',
    '/paths',
    // Public no-auth calculators (rebrand Phase 2) — the in-app tabbed
    // /calculators page stays gated; only the sub-routes are SEO surfaces.
    '/calculators/1rm',
    '/calculators/tdee',
    '/calculators/strength-standards',
  ];
  const now = new Date();
  // A parked surface must not be advertised to crawlers — see src/lib/surface.ts.
  // Nor must a path the private gate will bounce: `/experience` sat in this list while
  // absent from PRIVATE_GATE_PUBLIC_PATHS, so every crawler hitting the advertised URL
  // got redirected to /private. Checking the gate here keeps the two in step
  // automatically instead of relying on someone updating both lists.
  const staticEntries = routes
    .filter((path) => isPathEnabled(path || '/'))
    .filter((path) => !gateOn || isPrivateGatePublicPath(path || '/'))
    .map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
    priority: path === '' ? 1 : 0.7,
  }));

  const compareEntries = COMPARE_STORIES.map((s) => ({
    url: `${base}/compare/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
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
    ...compareEntries,
    ...(isPathEnabled('/guide') ? guideEntries : []),
    ...exerciseEntries,
    ...muscleHubs,
    ...equipmentHubs,
    ...(isPathEnabled('/paths') ? learnEntries : []),
  ];
}
