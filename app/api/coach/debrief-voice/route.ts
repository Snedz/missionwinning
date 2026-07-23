/**
 * Weekly Mission Debrief voice — premium LLM or rules fallback.
 * Auth: gate + app access + premium | Rate: 6/min
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { isPremiumBypassEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import { fetchDebriefVoice } from '@/lib/coachDebriefServer';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { z } from 'zod';
import { parseJsonBody } from '@/lib/apiSchemas';

const debriefVoiceSchema = z.object({
  focusKey: z.string().min(1).max(80),
  trainSessions: z.number().int().min(0).max(20).optional(),
  proteinDays: z.number().int().min(0).max(7).optional(),
  weightDelta: z.number().min(-50).max(50).nullable().optional(),
});

export const POST = withApiLogging('coach/debrief-voice', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 16 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`coach-debrief-voice:${ip}`, 6, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!(await hasAppAccess(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(debriefVoiceSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  let useLlm = false;
  if (isPremiumBypassEnabled()) {
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

  const voice = await fetchDebriefVoice(
    {
      focusKey: parsed.data.focusKey,
      trainSessions: parsed.data.trainSessions ?? 0,
      proteinDays: parsed.data.proteinDays ?? 0,
      weightDelta: parsed.data.weightDelta,
    },
    useLlm
  );

  return NextResponse.json(voice);
});
