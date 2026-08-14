/**
 * Mobile native access: gate cookie, Supabase cookie, or Authorization Bearer.
 */
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessTokenFromRequest, bearerAccessToken } from '@/lib/authAccessToken';
import { hasPrivateAccessCookie, isPrivateModeEnabled } from '@/lib/privateGate';

export { bearerAccessToken };

export async function hasMobileAppAccess(request: NextRequest): Promise<boolean> {
  const secret = process.env.PRIVATE_ACCESS_SECRET;
  if (hasPrivateAccessCookie(request, secret)) return true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const accessToken = extractSupabaseAccessTokenFromRequest(request);
  if (!accessToken) return false;

  const supabase = createClient(url, anon);
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);
  return Boolean(user);
}

/** Same gate as web `proxy.ts` — unset PRIVATE_MODE in production is on. */
export function mobileCoachBootstrapRequiresAccess(): boolean {
  return isPrivateModeEnabled();
}

/** Seed/generate endpoints: allow when the web gate is off, or when mobile access passes. */
export async function allowMobileCoachBootstrap(request: NextRequest): Promise<boolean> {
  if (!mobileCoachBootstrapRequiresAccess()) return true;
  return hasMobileAppAccess(request);
}
