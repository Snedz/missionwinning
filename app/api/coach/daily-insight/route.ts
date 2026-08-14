/**
 * Daily coach one-liner — LLM or rules fallback.
 * Auth: gate + app access; LLM branch additionally premium + daily quota | Rate: 12/min/IP
 * See: app/api/INDEX.md, src/lib/coachDailyServer.ts
 */
import { NextRequest, NextResponse, after } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import {
  coachFromFallback,
  fetchDailyCoachInsight,
} from '@/lib/coachDailyServer';
import { coachDailyContextSchema, parseJsonBody } from '@/lib/apiSchemas';
import { readCoachLlmEnv } from '@/lib/coachLlmClient';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { resolveLlmCaller } from '@/lib/llm/identity';
import { allowLlmInference } from '@/lib/llm/quota';
import { recordLlmUsage } from '@/lib/llm/metering';

/** Daily AI coach insight — uses LLM when COACH_LLM_* env set; else rule keys from client. */
export const POST = withApiLogging('coach/daily-insight', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`coach-daily:${ip}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  if (!(await hasAppAccess(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(coachDailyContextSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  /*
   * The LLM branch is gated; the rules answer never is. Before `.188` this
   * route had NO premium check — any holder of the gate cookie could drive
   * paid inference. Premium (or the free-beta bypass) plus the per-identity
   * daily quota now decide whether inference is on the table; either refusal
   * degrades to `coachFromFallback`, the same rules answer a free athlete
   * gets — never an error.
   */
  const llmEnv = readCoachLlmEnv();
  const caller = await resolveLlmCaller(request, body.deviceId);
  let quotaExceeded = false;
  // Dark env → straight to rules without touching the quota (the PR-stays-dark contract).
  let useLlm = caller.premium && Boolean(llmEnv.apiUrl && llmEnv.apiKey);
  if (useLlm) {
    const quota = await allowLlmInference('daily_insight', caller);
    if (!quota.ok) {
      useLlm = false;
      quotaExceeded = true;
    }
  }

  if (useLlm) {
    const t0 = Date.now();
    const result = await fetchDailyCoachInsight(body);
    if (result.source === 'llm') {
      after(() =>
        recordLlmUsage({
          feature: 'daily_insight',
          identity: caller,
          usage: result.usage,
          ok: true,
          durationMs: Date.now() - t0,
        })
      );
      return NextResponse.json({
        message: result.message,
        actionLabel: result.actionLabel,
        actionPath: result.actionPath,
        source: 'llm' as const,
      });
    }
  }

  const fb = coachFromFallback(body);
  return NextResponse.json({
    messageKey: fb.message,
    actionLabelKey: fb.actionLabel,
    actionPath: fb.actionPath,
    source: 'rules' as const,
    ...(quotaExceeded ? { reason: 'quota' as const } : {}),
  });
});
