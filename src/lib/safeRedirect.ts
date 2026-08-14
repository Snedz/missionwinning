/** Safe post-auth redirect paths (open redirect prevention). */

/** Dead route aliases → canonical paths (keep in sync with next.config.js redirects). */
export const DEAD_ALIAS_PATHS: Readonly<Record<string, string>> = {
  '/today': '/log',
  '/train': '/active',
  '/dashboard': '/log',
  '/app': '/log',
  '/login': '/welcome',
  '/pricing': '/welcome',
};

const ALLOWED_NEXT_PATHS = new Set([
  '/log',
  '/profile',
  '/welcome',
  '/coach',
  '/nutrition',
  '/active',
  '/library',
  '/builder',
  '/history',
  '/bundle',
  '/mind',
  '/move',
  '/track',
  '/learn',
  '/leaderboard',
  '/fitness-test',
  '/beta',
]);

export function sanitizeNextPath(next: string | null | undefined, fallback = '/log'): string {
  if (!next || typeof next !== 'string') return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }
  const pathOnly = trimmed.split('?')[0].split('#')[0];
  const canonical = DEAD_ALIAS_PATHS[pathOnly] ?? pathOnly;
  if (ALLOWED_NEXT_PATHS.has(canonical)) return canonical;
  if (pathOnly.startsWith('/school/class/')) return pathOnly;
  if (pathOnly.startsWith('/join/class/')) return pathOnly;
  return fallback;
}
