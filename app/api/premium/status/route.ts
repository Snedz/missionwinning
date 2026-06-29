import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isDemoPremiumEnabled, isPremiumForUser } from '@/lib/premiumServer';

/** Server-verified premium status — do not trust localStorage alone in production. */
export async function GET(request: NextRequest) {
  if (isDemoPremiumEnabled()) {
    return NextResponse.json({ premium: true, source: 'demo' });
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
}
