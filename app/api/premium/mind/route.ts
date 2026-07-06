/**
 * Premium guided mind sessions payload.
 * Auth: premium | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { PREMIUM_MIND_SESSIONS } from '@/data/premiumMindSessions';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isDemoPremiumEnabled, isPremiumForUser } from '@/lib/premiumServer';

export const GET = withApiLogging('premium/mind', async(request: NextRequest) => {
  if (isDemoPremiumEnabled()) {
    return NextResponse.json({ sessions: PREMIUM_MIND_SESSIONS });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ error: 'Premium content unavailable' }, { status: 503 });
  }

  const accessToken = extractSupabaseAccessToken(request.cookies);
  if (!accessToken) {
    return NextResponse.json({ error: 'Sign in and unlock premium' }, { status: 403 });
  }

  const supabase = createClient(url, anon);
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const premium = await isPremiumForUser(user.id, user.email ?? null);
  if (!premium) {
    return NextResponse.json({ error: 'Premium enrollment required' }, { status: 403 });
  }

  return NextResponse.json({ sessions: PREMIUM_MIND_SESSIONS });
});
