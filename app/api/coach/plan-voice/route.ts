/**
 * Weekly coach voice briefing — LLM or rules fallback.
 * Auth: gate + app access + premium | Rate: 6/min/IP
 * See: app/api/INDEX.md, src/lib/coach/planVoiceServer.ts
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isPremiumBypassEnabled, isPremiumForUser } from '@/lib/premiumServer';
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

  /*
   * App access decides whether the *LLM* is on the table — not whether a
   * briefing exists at all.
   *
   * This used to 401 here, which meant a signed-out visitor with the gate off
   * (the product's own default: no account required) could never load
   * Commander's intent and got a permanent "Could not load briefing" card on
   * /coach. The cost gate sat in front of the branch that decides whether any
   * cost is incurred: `fetchPlanVoice(ctx, false)` is pure local rules — no
   * network, no LLM, nothing to protect. The rate limit above still applies,
   * and the LLM path below still requires premium or the bypass.
   */
  const appAccess = await hasAppAccess(request);

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(coachPlanVoiceSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  let useLlm = false;
  if (!appAccess) {
    // Rules briefing only — free, local, and the reason the fallback exists.
    useLlm = false;
  } else if (isPremiumBypassEnabled()) {
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
