/**
 * Personal trainer line for the set in front of the athlete.
 * Auth: app access gates the LLM only. Signed-out callers get the library
 * answer (no model call). LLM: Gemini Flash when a free key is set, else
 * COACH_LLM. Quota shares daily_insight so the ledger feature list stays closed.
 * Rate: 12/min/IP + daily quota on the LLM branch.
 * See: app/api/INDEX.md, src/lib/coach/sessionTrainerServer.ts
 */
import { NextRequest, NextResponse, after } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import { parseJsonBody, sessionTrainerSchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { readCoachLlmEnv } from '@/lib/coachLlmClient';
import { readGeminiApiKey, voiceSessionTrainer } from '@/lib/coach/sessionTrainerServer';
import type { SessionTrainerFacts } from '@/lib/coach/sessionTrainer';
import { resolveLlmCaller } from '@/lib/llm/identity';
import { allowLlmInference } from '@/lib/llm/quota';
import { recordLlmUsage } from '@/lib/llm/metering';

function factsFromBody(body: {
  exerciseId?: string | null;
  exerciseName?: string | null;
  weight?: number | null;
  reps?: number | null;
  unit?: 'kg' | 'lb';
  setsLeft?: number | null;
  formCue?: string | null;
  planLabel?: string | null;
}): SessionTrainerFacts {
  return {
    exerciseId: body.exerciseId?.trim() || null,
    exerciseName: body.exerciseName?.trim() || null,
    weight: body.weight ?? null,
    reps: body.reps ?? null,
    unit: body.unit ?? 'kg',
    setsLeft: body.setsLeft ?? null,
    formCue: body.formCue?.trim() || null,
    planLabel: body.planLabel?.trim() || null,
  };
}

export const POST = withApiLogging('coach/session-trainer', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 8 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`coach-session-trainer:${ip}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(sessionTrainerSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;
  const facts = factsFromBody(body);

  /*
   * The library answer is the product: next set, cue, and plan are already
   * on the client. A missing gate cookie must not 401 that path. The model
   * call is the only thing behind access, premium, and the daily cap.
   * The cap is `daily_insight` — one short coach line, same ledger feature —
   * so this route does not add a migration.
   */
  const appAccess = await hasAppAccess(request);
  const geminiKey = Boolean(readGeminiApiKey());
  const coachEnv = readCoachLlmEnv();
  const llmConfigured = geminiKey || Boolean(coachEnv.apiUrl && coachEnv.apiKey);
  let quotaExceeded = false;
  let useLlm = false;
  let caller: Awaited<ReturnType<typeof resolveLlmCaller>> | null = null;
  if (appAccess && llmConfigured) {
    caller = await resolveLlmCaller(request, body.deviceId);
    if (caller.premium) {
      const quota = await allowLlmInference('daily_insight', caller);
      if (quota.ok) useLlm = true;
      else quotaExceeded = true;
    }
  }

  const t0 = Date.now();
  const voice = await voiceSessionTrainer(facts, { useLlm });
  if (voice.source === 'llm' && caller) {
    const identity = caller;
    const usage = voice.usage;
    const model = voice.model;
    const task = () =>
      recordLlmUsage({
        feature: 'daily_insight',
        identity,
        model,
        usage,
        ok: true,
        durationMs: Date.now() - t0,
      });
    // `after` throws outside a Next request (route tests). The ledger is
    // fire-and-forget either way — a missing scope must not 500 the line.
    try {
      after(task);
    } catch {
      void task();
    }
  }

  return NextResponse.json({
    source: voice.source,
    model: voice.model,
    line: voice.line,
    ...(quotaExceeded ? { reason: 'quota' as const } : {}),
  });
});
