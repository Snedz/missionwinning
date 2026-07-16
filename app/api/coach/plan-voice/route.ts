/**
 * Weekly coach voice briefing — LLM or rules fallback.
 * Auth: gate + app access + premium | Rate: 6/min/IP
 * See: app/api/INDEX.md, src/lib/coach/planVoiceServer.ts
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isDemoPremiumEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import { fetchPlanVoice } from '@/lib/coach/planVoiceServer';
import { coachPlanVoiceSchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';

export const POST = withApiLogging('coach/plan-voice', async(request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 64 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`coach-plan-voice:${ip}`, 6, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!(await hasAppAccess(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(coachPlanVoiceSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

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
});
