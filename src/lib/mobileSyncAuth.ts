/**
 * Shared Bearer auth for `/api/mobile/sync/*` routes.
 *
 * Framework review: the same `requireUser` body was copy-pasted into workouts,
 * routines, customs, and prefs — four homes for one auth fact (`.178`).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { bearerAccessToken, hasMobileAppAccess } from '@/lib/mobileAccess';

export type MobileSyncAuth =
  | { error: NextResponse }
  | { supabase: SupabaseClient; user: User; token: string };

export async function requireMobileSyncUser(request: NextRequest): Promise<MobileSyncAuth> {
  const token = bearerAccessToken(request);
  if (!token || !(await hasMobileAppAccess(request))) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { error: NextResponse.json({ error: 'Unconfigured' }, { status: 503 }) } as const;
  }
  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }
  return { supabase, user, token } as const;
}
