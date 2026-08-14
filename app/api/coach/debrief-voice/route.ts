/**
 * Weekly Mission Debrief voice — premium LLM or rules fallback.
 * Auth: gate + app access + premium (LLM branch) + daily quota | Rate: 6/min
 */
import { NextRequest, NextResponse, after } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import { fetchDebriefVoice } from '@/lib/coachDebriefServer';
import { readCoachLlmEnv } from '@/lib/coachLlmClient';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { z } from 'zod';
import { parseJsonBody } from '@/lib/apiSchemas';
import { resolveLlmCaller } from '@/lib/llm/identity';
import { allowLlmInference } from '@/lib/llm/quota';
import { recordLlmUsage } from '@/lib/llm/metering';

const debriefVoiceSchema = z.object({
  focusKey: z.string().min(1).max(80),
  trainSessions: z.number().int().min(0).max(20).optional(),
  proteinDays: z.number().int().min(0).max(7).optional(),
  weightDelta: z.number().min(-50).max(50).nullable().optional(),
  /** Metering identity only — counts, never content; see 20260731_llm_usage.sql. */
  deviceId: z.string().min(1).max(64).optional(),
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

  // Premium (or bypass) and the daily quota gate the LLM branch only — either
  // refusal degrades to the rules focus key, the same answer the free path gets.
  // Dark env → rules without consuming quota (the PR-stays-dark contract).
  const llmEnv = readCoachLlmEnv();
  const llmConfigured = Boolean(llmEnv.apiUrl && llmEnv.apiKey);
  const caller = await resolveLlmCaller(request, parsed.data.deviceId);
  const useLlm =
    llmConfigured && caller.premium && (await allowLlmInference('debrief_voice', caller)).ok;

  const t0 = Date.now();
  const voice = await fetchDebriefVoice(
    {
      focusKey: parsed.data.focusKey,
      trainSessions: parsed.data.trainSessions ?? 0,
      proteinDays: parsed.data.proteinDays ?? 0,
      weightDelta: parsed.data.weightDelta,
    },
    useLlm
  );

  if (voice.source === 'llm') {
    after(() =>
      recordLlmUsage({
        feature: 'debrief_voice',
        identity: caller,
        usage: voice.usage,
        ok: true,
        durationMs: Date.now() - t0,
      })
    );
  }

  return NextResponse.json({ message: voice.message, source: voice.source });
});
