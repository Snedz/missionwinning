/**
 * Premium coach chat — ZDR LLM one-shot.
 * Auth: app access + premium | Rate: 10/min/IP | Body: 32KB
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isDemoPremiumEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import { fetchCoachChat } from '@/lib/coachChatServer';
import { coachChatSchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';

export const POST = withApiLogging('coach/chat', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 32 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`coach-chat:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!(await hasAppAccess(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(coachChatSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  let premium = isDemoPremiumEnabled();
  if (!premium) {
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
          premium = await isPremiumForUser(user.id, user.email ?? null);
        }
      }
    }
  }

  if (!premium) {
    return NextResponse.json({ error: 'premium_required' }, { status: 402 });
  }

  const result = await fetchCoachChat(body.context, body.turns, body.message);
  if (!result.ok) {
    if (result.reason === 'unconfigured') {
      return NextResponse.json({ error: 'coach_offline' }, { status: 503 });
    }
    return NextResponse.json({ error: 'coach_unavailable' }, { status: 502 });
  }

  return NextResponse.json({
    message: result.message,
    actionLabel: result.actionLabel,
    actionPath: result.actionPath,
    source: result.source,
  });
});
