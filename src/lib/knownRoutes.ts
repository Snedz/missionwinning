/**
 * Top-level route segments that exist under `app/` and `app/(app)/`, plus
 * top-level `public/` folders. The proxy uses this to send unknown paths to
 * the 404 page instead of the private door. `knownRoutes.test.ts` fails if a
 * folder is added to `app/` without being listed here.
 */
export const KNOWN_TOP_SEGMENTS: ReadonlySet<string> = new Set([
  // app/
  'about', 'api', 'auth', 'bundle', 'calculators', 'changelog', 'exercises', 'forge-preview',
  'guide', 'notify', 'offline', 'paths', 'press', 'private', 'vision',
  'welcome', 'youth',
  // app/(app)/
  'accessibility', 'account', 'active', 'america', 'assessments', 'benchmarks',
  'beta', 'builder', 'coach', 'coaching', 'contact', 'cookies', 'credits',
  'data-safety', 'dmca', 'explore', 'feedback', 'fitness-test', 'help',
  'history', 'join', 'leaderboard', 'learn', 'library', 'log', 'mind', 'move',
  'nutrition', 'privacy', 'profile', 'programs', 'refunds', 'regions',
  'school', 'server', 'service-terms', 'terms', 'track', 'usage',
  // public/
  'art', 'brand', 'form', 'form-guides', 'locales', 'magazine', 'photo',
  'rewards', 'social',
  // framework / generated
  '_next', '_not-found', 'monitoring', 'ingest',
]);

/** True when the path could be a real page, API or static file. */
export function isKnownPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '') return true;
  const first = pathname.split('/')[1] ?? '';
  if (first.includes('.')) return true; // root files: sw.js, robots.txt, icons
  if (first.startsWith('opengraph-image') || first.startsWith('twitter-image')) return true;
  return KNOWN_TOP_SEGMENTS.has(first);
}
