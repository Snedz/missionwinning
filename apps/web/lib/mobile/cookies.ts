import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function parseSupabaseAuthCookie(raw: string): string | null {
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
      return parseSupabaseAuthCookie(decodeBase64Url(trimmed.slice(7)));
    }
    if (trimmed.split('.').length === 3) return trimmed;
  } catch {
    // fall through
  }
  return null;
}

type CookieSource =
  | RequestCookies
  | ReadonlyRequestCookies
  | { getAll(): { name: string; value: string }[] };

/** Extract Supabase access token from auth cookies (server-side). */
export function extractSupabaseAccessToken(cookies: CookieSource): string | null {
  for (const cookie of cookies.getAll()) {
    if (!cookie.name.includes('sb-')) continue;
    if (!cookie.name.includes('auth-token') && !cookie.name.includes('access-token')) continue;
    const token = parseSupabaseAuthCookie(cookie.value);
    if (token) return token;
  }
  return null;
}
