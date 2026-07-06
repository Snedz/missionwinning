/**
 * Gate cookie or Supabase session check for semi-public APIs.
 * Consumers: coach LLM routes, fuel
 */
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { hasPrivateAccessCookie } from '@/lib/privateGate';

/** Signed-in user or private beta gate cookie — for LLM/cost endpoints. */
export async function hasAppAccess(request: NextRequest): Promise<boolean> {
  const secret = process.env.PRIVATE_ACCESS_SECRET;
  if (hasPrivateAccessCookie(request, secret)) return true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const accessToken = extractSupabaseAccessToken(request.cookies);
  if (!accessToken) return false;

  const supabase = createClient(url, anon);
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);
  return Boolean(user);
}
