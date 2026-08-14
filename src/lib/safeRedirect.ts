/** Safe post-auth redirect paths (open redirect prevention). */

/** Retired route spellings → canonical app paths (`.673`). */
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

const CLASS_PATH = /^\/(school|join)\/class\/[A-Za-z0-9-]{2,32}$/;

function decodePath(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function hasAsciiControl(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) < 32) return true;
  }
  return false;
}

export function sanitizeNextPath(next: string | null | undefined, fallback = '/log'): string {
  if (!next || typeof next !== 'string') return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }
  if (trimmed.includes('://') || trimmed.includes('@')) return fallback;
  const decoded = decodePath(trimmed);
  if (
    decoded.includes('..') ||
    decoded.startsWith('//') ||
    decoded.includes('\\') ||
    decoded.includes('@') ||
    hasAsciiControl(decoded)
  ) {
    return fallback;
  }
  const pathOnly = decoded.split('?')[0].split('#')[0];
  const canonical = DEAD_ALIAS_PATHS[pathOnly] ?? pathOnly;
  if (ALLOWED_NEXT_PATHS.has(canonical)) return canonical;
  if (CLASS_PATH.test(pathOnly)) return pathOnly;
  return fallback;
}
