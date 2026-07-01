import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';

/** Resolve signed-in Supabase user from request cookies (API routes). */
export async function getUserFromRequest(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = extractSupabaseAccessToken(request.cookies);
  if (!url || !anon || !token) return null;

  const supabase = createClient(url, anon);
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  return user;
}
