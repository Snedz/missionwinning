/**
 * Mobile native access: gate cookie, Supabase cookie, or Authorization Bearer.
 */
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { hasPrivateAccessCookie } from '@/lib/privateGate';

export function bearerAccessToken(request: NextRequest): string | null {
  const h = request.headers.get('authorization');
  if (!h?.toLowerCase().startsWith('bearer ')) return null;
  const token = h.slice(7).trim();
  return token.length > 0 ? token : null;
}

export async function hasMobileAppAccess(request: NextRequest): Promise<boolean> {
  const secret = process.env.PRIVATE_ACCESS_SECRET;
  if (hasPrivateAccessCookie(request, secret)) return true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const accessToken =
    bearerAccessToken(request) ?? extractSupabaseAccessToken(request.cookies);
  if (!accessToken) return false;

  const supabase = createClient(url, anon);
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);
  return Boolean(user);
}

/** Seed/generate endpoints: allow when not private, or when mobile access passes. */
export async function allowMobileCoachBootstrap(request: NextRequest): Promise<boolean> {
  if (process.env.PRIVATE_MODE !== 'true') return true;
  return hasMobileAppAccess(request);
}
