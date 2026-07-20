/**
 * Private beta gate helpers — public paths, JWT via getUser(), query bypass policy.
 * Consumers: proxy.ts | See: PROTECTION.md
 */
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import {
  verifyPrivateAccessToken,
  matchesPrivateAccessPassword,
  PRIVATE_ACCESS_COOKIE,
} from '@/lib/privateSession';
import { parseSupabaseAuthCookie } from '@/lib/supabaseAuthCookies';
import {
  isPrivateGatePublicPath,
  PRIVATE_GATE_PUBLIC_PATHS,
} from '@/lib/publicRoutes';

/** True when private development gate should be active (default: on in production). */
export function isPrivateModeEnabled(): boolean {
  const flag = process.env.PRIVATE_MODE;
  if (flag === 'false' || flag === '0') return false;
  if (flag === 'true' || flag === '1') return true;
  return process.env.NODE_ENV === 'production';
}

export const PUBLIC_PATHS_WHILE_GATED = PRIVATE_GATE_PUBLIC_PATHS;

export const PUBLIC_API_PATHS_WHILE_GATED = [
  '/api/private-access',
  '/api/stripe-webhook',
  '/api/paypal-webhook',
  '/api/crypto-checkout',
  '/api/leads',
  '/api/leads/unsubscribe',
  '/api/cron/nudges',
  '/api/cron/weekly-digest',
  '/api/nudges/unsubscribe',
  // Safe anonymous premium probe (returns premium:false without auth)
  '/api/premium/status',
] as const;

export function isPublicPathWhileGated(pathname: string): boolean {
  return isPrivateGatePublicPath(pathname);
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

export function applyPrivateGateHeaders<T extends { headers: Headers }>(response: T): T {
  for (const [key, value] of Object.entries(privateGateHeaders())) {
    response.headers.set(key, value);
  }
  return response;
}

function extractAccessToken(request: NextRequest): string | null {
  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.includes('sb-')) continue;
    if (!cookie.name.includes('auth-token') && !cookie.name.includes('access-token')) continue;
    const accessToken = parseSupabaseAuthCookie(cookie.value);
    if (accessToken) return accessToken;
  }
  return null;
}

/**
 * Optional Supabase session bypass — OFF by default.
 * Verifies JWT via Supabase auth API (not payload decode only).
 */
export async function hasValidSupabaseSession(request: NextRequest): Promise<boolean> {
  if (process.env.PRIVATE_ALLOW_AUTH_BYPASS !== 'true') return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const accessToken = extractAccessToken(request);
  if (!accessToken) return false;

  const supabase = createClient(url, anon);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);
  return Boolean(user && !error);
}

export function hasPrivateAccessCookie(request: NextRequest, secret: string | undefined): boolean {
  if (!secret) return false;
  const token = request.cookies.get(PRIVATE_ACCESS_COOKIE)?.value;
  return verifyPrivateAccessToken(token, secret);
}

/** Query-string gate bypass — disabled in production unless PRIVATE_ALLOW_QUERY_ACCESS=true. */
export function queryGrantsAccess(searchParams: URLSearchParams, secret: string | undefined): boolean {
  if (!secret) return false;
  if (process.env.NODE_ENV === 'production' && process.env.PRIVATE_ALLOW_QUERY_ACCESS !== 'true') {
    return false;
  }
  const access = searchParams.get('access');
  if (!access) return false;
  return matchesPrivateAccessPassword(access, secret, process.env.PRIVATE_ACCESS_CODES);
}
