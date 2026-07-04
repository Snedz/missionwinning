import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCoachPlan } from '@/lib/coachPlan';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isDemoPremiumEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { rateLimit } from '@/lib/rateLimit';

/** Premium-gated weekly plan generator (rule-based v1). */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limited = rateLimit(`coach-plan:${ip}`, 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!isDemoPremiumEnabled()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return NextResponse.json({ error: 'Premium not configured' }, { status: 503 });
    }
    const accessToken = extractSupabaseAccessToken(request.cookies);
    if (!accessToken) {
      return NextResponse.json({ error: 'Premium required' }, { status: 403 });
    }
    const supabase = createClient(url, anon);
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    const premium = user
      ? await isPremiumForUser(user.id, user.email ?? null)
      : false;
    if (!premium) {
      return NextResponse.json({ error: 'Premium required' }, { status: 403 });
    }
  }

  const body = (await request.json().catch(() => null)) as {
    goal?: string;
    equipment?: string;
    readiness?: number;
    strain?: number;
    recovery?: number;
  } | null;

  if (
    !body ||
    typeof body.readiness !== 'number' ||
    typeof body.strain !== 'number' ||
    typeof body.recovery !== 'number'
  ) {
    return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
  }

  const plan = generateCoachPlan({
    goal: body.goal,
    equipment: body.equipment,
    readiness: body.readiness,
    strain: body.strain,
    recovery: body.recovery,
  });

  return NextResponse.json(plan);
}
