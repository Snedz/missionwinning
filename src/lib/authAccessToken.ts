/**
 * Supabase access token from Authorization Bearer or sb-* cookies.
 * Shared by private gate (proxy) and mobileAccess — no import cycles.
 */
import type { NextRequest } from 'next/server';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';

/** Parse `Authorization: Bearer <jwt>` (case-insensitive scheme). */
export function bearerAccessToken(request: {
  headers: { get(name: string): string | null };
}): string | null {
  const h = request.headers.get('authorization');
  if (!h?.toLowerCase().startsWith('bearer ')) return null;
  const token = h.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * Prefer Bearer, then Supabase auth cookies.
 * Caller must verify with supabase.auth.getUser(token) — never trust decode-only.
 */
export function extractSupabaseAccessTokenFromRequest(request: {
  headers: { get(name: string): string | null };
  cookies: { getAll(): { name: string; value: string }[] };
}): string | null {
  return bearerAccessToken(request) ?? extractSupabaseAccessToken(request.cookies);
}

/** Type-friendly alias for NextRequest call sites. */
export function extractSupabaseAccessTokenFromNextRequest(
  request: NextRequest
): string | null {
  return extractSupabaseAccessTokenFromRequest(request);
}
