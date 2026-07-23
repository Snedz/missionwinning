/**
 * Premium enrollment status for signed-in user.
 * Auth: session | See: app/api/INDEX.md, src/lib/premiumServer.ts
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isDemoPremiumEnabled, isPremiumBypassEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { isFreeBetaPremiumUnlocked } from '@/lib/freeBeta';

/** Server-verified premium status — do not trust localStorage alone in production. */
export const GET = withApiLogging('premium/status', async(request: NextRequest) => {
  if (isPremiumBypassEnabled()) {
    const source = isFreeBetaPremiumUnlocked()
      ? 'free_beta'
      : isDemoPremiumEnabled()
        ? 'demo'
        : 'free_beta';
    return NextResponse.json({ premium: true, source });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ premium: false, source: 'unconfigured' });
  }

  const accessToken = extractSupabaseAccessToken(request.cookies);
  if (!accessToken) {
    return NextResponse.json({ premium: false, source: 'anonymous' });
  }

  const supabase = createClient(url, anon);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.json({ premium: false, source: 'anonymous' });
  }

  const premium = await isPremiumForUser(user.id, user.email ?? null);
  return NextResponse.json({ premium, source: premium ? 'enrollment' : 'free' });
});
