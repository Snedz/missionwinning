import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isDemoPremiumEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { getProgramsByCategory, type ProgramCategory } from '@/data/programTemplates';

/** Pro program templates — gated server-side (not only client UI). */
export async function GET(request: NextRequest) {
  const category = (request.nextUrl.searchParams.get('category') ?? 'pro') as ProgramCategory;

  if (category !== 'pro') {
    return NextResponse.json({ error: 'Use client templates for non-pro categories' }, { status: 400 });
  }

  if (isDemoPremiumEnabled()) {
    return NextResponse.json({ programs: getProgramsByCategory('pro') });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ error: 'Premium programs unavailable' }, { status: 503 });
  }

  const accessToken = extractSupabaseAccessToken(request.cookies);
  if (!accessToken) {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 });
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

  return NextResponse.json({ programs: getProgramsByCategory('pro') });
}
