/**
 * Weekly coach voice briefing — LLM or rules fallback.
 * Auth: gate + app access + premium (LLM branch only) + daily quota | Rate: 6/min/IP
 * See: app/api/INDEX.md, src/lib/coach/planVoiceServer.ts
 */
import { NextRequest, NextResponse, after } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import { fetchPlanVoice } from '@/lib/coach/planVoiceServer';
import { readCoachLlmEnv } from '@/lib/coachLlmClient';
import { coachPlanVoiceSchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { resolveLlmCaller } from '@/lib/llm/identity';
import { allowLlmInference } from '@/lib/llm/quota';
import { recordLlmUsage } from '@/lib/llm/metering';

export const POST = withApiLogging('coach/plan-voice', async (request: NextRequest) => {
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
   * and the LLM path below still requires premium or the bypass — and, since
   * `.188`, the per-identity daily quota. Both refusals land on the same
   * rules briefing; neither can ever 401 or 429 the free path.
   */
  const appAccess = await hasAppAccess(request);

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(coachPlanVoiceSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  const llmEnv = readCoachLlmEnv();
  const llmConfigured = Boolean(llmEnv.apiUrl && llmEnv.apiKey);
  let useLlm = false;
  let caller = null;
  if (appAccess && llmConfigured) {
    caller = await resolveLlmCaller(request, body.deviceId);
    useLlm = caller.premium && (await allowLlmInference('plan_voice', caller)).ok;
  }

  const t0 = Date.now();
  const voice = await fetchPlanVoice(
    {
      plan: body.plan,
      readiness: body.readiness ?? 50,
      strain: body.strain ?? 50,
      recovery: body.recovery ?? 50,
    },
    useLlm
  );

  if (voice.source === 'llm' && caller) {
    const identity = caller;
    after(() =>
      recordLlmUsage({
        feature: 'plan_voice',
        identity,
        usage: voice.usage,
        ok: true,
        durationMs: Date.now() - t0,
      })
    );
  }

  return NextResponse.json({ message: voice.message, source: voice.source });
});
