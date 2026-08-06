/**
 * Private beta gate helpers — public paths, JWT via getUser(), query bypass policy.
 * Consumers: proxy.ts | See: docs/PROTECTION.md
 *
 * Security F1 (2026-08-05): verified Supabase access token may come from
 * Authorization Bearer **or** sb-* cookies — always supabase.auth.getUser().
 * PRIVATE_ALLOW_AUTH_BYPASS is no longer required for JWT gate access (deprecated).
 */
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import {
  verifyPrivateAccessToken,
  matchesPrivateAccessPassword,
  PRIVATE_ACCESS_COOKIE,
} from '@/lib/privateSession';
import { extractSupabaseAccessTokenFromRequest } from '@/lib/authAccessToken';
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

/**
 * APIs reachable without gate cookie / session while PRIVATE_MODE is on.
 * Each path MUST enforce its own auth (webhook sig, CRON_SECRET, rate limits).
 * Do not add premium catalog or user-data routes here.
 */
export const PUBLIC_API_PATHS_WHILE_GATED = [
  '/api/private-access',
  '/api/geo',
  '/api/stripe-webhook',
  '/api/paypal-webhook',
  '/api/crypto-checkout',
  '/api/leads',
  '/api/leads/unsubscribe',
  '/api/cron/nudges',
  '/api/cron/weekly-digest',
  '/api/cron/day-review',
  '/api/cron/wind-down',
  '/api/nudges/unsubscribe',
  // Safe anonymous premium probe (returns premium:false without auth)
  '/api/premium/status',
  // Liveness (shallow) + deep with CRON_SECRET
  '/api/health',
  // Opaque invite land mark (rate-limited, format-gated; no PII return)
  '/api/beta/invites/landed',
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

/**
 * Verified Supabase user for the private gate — cookie **or** Bearer JWT.
 * Always uses auth.getUser (server), never JWT payload decode alone.
 */
export async function hasVerifiedSupabaseUser(request: NextRequest): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const accessToken = extractSupabaseAccessTokenFromRequest(request);
  if (!accessToken) return false;

  const supabase = createClient(url, anon);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);
  return Boolean(user && !error);
}

/**
 * @deprecated Name kept for proxy call sites. Prefer hasVerifiedSupabaseUser.
 * Previously required PRIVATE_ALLOW_AUTH_BYPASS=true and cookies only (F1).
 */
export async function hasValidSupabaseSession(request: NextRequest): Promise<boolean> {
  return hasVerifiedSupabaseUser(request);
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
