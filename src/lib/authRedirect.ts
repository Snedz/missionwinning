/**
 * Canonical OAuth / magic-link return origin.
 * Never send auth callbacks to ephemeral *.vercel.app hosts — Supabase Site URL
 * misconfig is a common cause of www → preview /private after Google.
 */

import { sanitizeNextPath } from '@/lib/safeRedirect';

const DEFAULT_PROD_ORIGIN = 'https://www.missionwinning.com';

export function configuredSiteOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/** True for Vercel preview / deployment aliases (not a stable product host). */
export function isEphemeralVercelHost(hostname: string): boolean {
  return hostname.toLowerCase().endsWith('.vercel.app');
}

/**
 * Origin used in redirectTo / emailRedirectTo.
 * Prefer NEXT_PUBLIC_SITE_URL; never return a *.vercel.app origin.
 */
export function getAuthRedirectOrigin(
  locationOrigin?: string,
  hostname?: string
): string {
  const configured = configuredSiteOrigin();
  const origin =
    locationOrigin ??
    (typeof window !== 'undefined' ? window.location.origin : configured ?? DEFAULT_PROD_ORIGIN);
  const host =
    hostname ??
    (typeof window !== 'undefined'
      ? window.location.hostname
      : (() => {
          try {
            return new URL(origin).hostname;
          } catch {
            return '';
          }
        })());

  if (isEphemeralVercelHost(host)) {
    return configured ?? DEFAULT_PROD_ORIGIN;
  }

  if (host === 'localhost' || host === '127.0.0.1') {
    return origin;
  }

  return configured ?? origin;
}

export function getAuthRedirectUrl(nextPath = '/log'): string {
  const safeNext = sanitizeNextPath(nextPath);
  const origin = getAuthRedirectOrigin();
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

/**
 * If OAuth landed on *.vercel.app (wrong Supabase Site URL), bounce to canonical
 * www with the same query so PKCE exchange runs where sign-in started.
 */
export function shouldBounceAuthCallbackToCanonical(
  hostname: string,
  configuredOrigin = configuredSiteOrigin()
): string | null {
  if (!isEphemeralVercelHost(hostname)) return null;
  const dest = configuredOrigin ?? DEFAULT_PROD_ORIGIN;
  try {
    if (new URL(dest).hostname === hostname) return null;
  } catch {
    return null;
  }
  return dest;
}
