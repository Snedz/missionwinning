import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isDemoPremiumEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { rateLimit } from '@/lib/rateLimit';
import { fetchPlanVoice } from '@/lib/coach/planVoiceServer';
import type { PlanVoiceContext } from '@/lib/coach/planVoiceServer';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limited = rateLimit(`coach-plan-voice:${ip}`, 6, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as
    | (PlanVoiceContext & { premium?: boolean })
    | null;

  if (!body?.plan?.sessions) {
    return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
  }

  let useLlm = false;
  if (isDemoPremiumEnabled()) {
    useLlm = true;
  } else {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && anon) {
      const accessToken = extractSupabaseAccessToken(request.cookies);
      if (accessToken) {
        const supabase = createClient(url, anon);
        const {
          data: { user },
        } = await supabase.auth.getUser(accessToken);
        if (user) {
          useLlm = await isPremiumForUser(user.id, user.email ?? null);
        }
      }
    }
  }

  const voice = await fetchPlanVoice(
    {
      plan: body.plan,
      readiness: body.readiness ?? 50,
      strain: body.strain ?? 50,
      recovery: body.recovery ?? 50,
    },
    useLlm
  );

  return NextResponse.json(voice);
}
