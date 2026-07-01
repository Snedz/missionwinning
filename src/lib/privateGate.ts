import type { NextRequest } from 'next/server';
import {
  verifyPrivateAccessToken,
  PRIVATE_ACCESS_COOKIE,
} from '@/lib/privateSession';

/** True when private development gate should be active (default: on in production). */
export function isPrivateModeEnabled(): boolean {
  const flag = process.env.PRIVATE_MODE;
  if (flag === 'false' || flag === '0') return false;
  if (flag === 'true' || flag === '1') return true;
  // Default: gate on in production builds, off in local dev unless explicitly set.
  return process.env.NODE_ENV === 'production';
}

/** Page routes reachable without the access cookie while the gate is active. */
export const PUBLIC_PATHS_WHILE_GATED = [
  '/private',
  '/privacy',
  '/terms',
  '/about',
  '/auth/callback',
] as const;

/** API routes that must stay reachable for webhooks and the gate form (no access cookie). */
export const PUBLIC_API_PATHS_WHILE_GATED = [
  '/api/private-access',
  '/api/stripe-webhook',
  '/api/paypal-webhook',
] as const;

export function isPublicPathWhileGated(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/private')) return true;
  return PUBLIC_PATHS_WHILE_GATED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isPublicApiPathWhileGated(pathname: string): boolean {
  if (!pathname.startsWith('/api')) return false;
  return PUBLIC_API_PATHS_WHILE_GATED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

const NO_STORE = 'private, no-store, no-cache, must-revalidate';

export function privateGateHeaders(): Record<string, string> {
  return {
    'Cache-Control': NO_STORE,
    'X-Robots-Tag': 'noindex, nofollow',
  };
}

/** Apply anti-cache + noindex headers to a NextResponse. */
export function applyPrivateGateHeaders<T extends { headers: Headers }>(response: T): T {
  for (const [key, value] of Object.entries(privateGateHeaders())) {
    response.headers.set(key, value);
  }
  return response;
}

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  if (typeof atob === 'function') {
    return atob(padded);
  }
  return Buffer.from(padded, 'base64').toString('utf8');
}

function parseSupabaseAuthCookie(raw: string): string | null {
  try {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') return parsed[0];
      if (parsed && typeof parsed === 'object' && 'access_token' in parsed) {
        return String((parsed as { access_token: string }).access_token);
      }
    }
    if (trimmed.startsWith('base64-')) {
      const decoded = decodeBase64Url(trimmed.slice(7));
      return parseSupabaseAuthCookie(decoded);
    }
    if (trimmed.split('.').length === 3) return trimmed;
  } catch {
    // fall through
  }
  return null;
}

function isAccessTokenValid(accessToken: string): boolean {
  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(decodeBase64Url(parts[1])) as {
      exp?: number;
      sub?: string;
    };
    if (!payload.sub || !payload.exp) return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * Optional Supabase session bypass — OFF by default.
 * When enabled, only a non-expired JWT in the auth cookie counts (not cookie name alone).
 */
export function hasValidSupabaseSession(request: NextRequest): boolean {
  if (process.env.PRIVATE_ALLOW_AUTH_BYPASS !== 'true') return false;

  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.includes('sb-')) continue;
    if (!cookie.name.includes('auth-token') && !cookie.name.includes('access-token')) continue;
    const accessToken = parseSupabaseAuthCookie(cookie.value);
    if (accessToken && isAccessTokenValid(accessToken)) return true;
  }
  return false;
}

export function hasPrivateAccessCookie(request: NextRequest, secret: string | undefined): boolean {
  if (!secret) return false;
  const token = request.cookies.get(PRIVATE_ACCESS_COOKIE)?.value;
  if (verifyPrivateAccessToken(token, secret)) return true;
  // Legacy: migrate old cookies that stored raw secret (one release)
  if (token === secret) return true;
  return false;
}

export function queryGrantsAccess(searchParams: URLSearchParams, secret: string | undefined): boolean {
  if (!secret) return false;
  return searchParams.get('access') === secret;
}
