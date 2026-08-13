/** Safe post-auth redirect paths (open redirect prevention). */

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
    /[\u0000-\u001f]/.test(decoded)
  ) {
    return fallback;
  }
  const pathOnly = decoded.split('?')[0].split('#')[0];
  if (ALLOWED_NEXT_PATHS.has(pathOnly)) return pathOnly;
  if (CLASS_PATH.test(pathOnly)) return pathOnly;
  return fallback;
}
