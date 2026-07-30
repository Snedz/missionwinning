/**
 * Premium coach chat — ZDR LLM one-shot or token stream.
 * Auth: app access + premium | Rate: 10/min/IP + daily per-identity quota | Body: 32KB
 */
import { NextRequest, NextResponse, after } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import { fetchCoachChat, streamCoachChat } from '@/lib/coachChatServer';
import { readCoachLlmEnv } from '@/lib/coachLlmClient';
import { coachChatSchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { resolveLlmCaller } from '@/lib/llm/identity';
import { checkLlmDailyQuota } from '@/lib/llm/quota';
import { recordLlmUsage } from '@/lib/llm/metering';

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

  // Identity is resolved BEFORE the premium answer — under the free-beta bypass
  // this route previously never knew who it was spending money on (.188).
  const caller = await resolveLlmCaller(request, body.deviceId);
  if (!caller.premium) {
    return NextResponse.json({ error: 'premium_required' }, { status: 402 });
  }

  // Chat has no rules engine to degrade to, so exhaustion is an honest 429 —
  // "daily limit, resets tomorrow" — not a silent worse answer. While the LLM
  // env is dark the quota is not consulted at all: unconfigured must keep
  // returning coach_offline, never coach_quota (the PR-stays-dark contract).
  const llmEnv = readCoachLlmEnv();
  const llmConfigured = Boolean(llmEnv.apiUrl && llmEnv.apiKey);
  const quota = llmConfigured
    ? await checkLlmDailyQuota('coach_chat', caller)
    : { ok: true as const, retryAfterSec: undefined };

  const wantStream =
    body.stream === true ||
    request.headers.get('accept')?.includes('text/event-stream') === true;

  if (wantStream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          if (!quota.ok) {
            controller.enqueue(encoder.encode('\n\n[[error:coach_quota]]'));
            return;
          }
          const t0 = Date.now();
          const gen = streamCoachChat(
            body.context,
            body.turns,
            body.message,
            request.signal
          );
          let result = await gen.next();
          while (!result.done) {
            controller.enqueue(encoder.encode(result.value));
            result = await gen.next();
          }
          const final = result.value;
          // `unconfigured` spends nothing and records nothing — the PR stays dark.
          if (final.ok || final.reason !== 'unconfigured') {
            await recordLlmUsage({
              feature: 'coach_chat',
              identity: caller,
              usage: final.ok ? final.usage : null,
              ok: final.ok,
              reason: final.ok ? undefined : final.reason,
              durationMs: Date.now() - t0,
            });
          }
          if (!final.ok) {
            const code = final.reason === 'unconfigured' ? 'coach_offline' : 'coach_unavailable';
            controller.enqueue(encoder.encode(`\n\n[[error:${code}]]`));
          }
        } catch {
          controller.enqueue(encoder.encode('\n\n[[error:coach_unavailable]]'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  if (!quota.ok) {
    return NextResponse.json(
      { error: 'coach_quota', retryAfterSec: quota.retryAfterSec },
      { status: 429 }
    );
  }

  const t0 = Date.now();
  const result = await fetchCoachChat(body.context, body.turns, body.message);
  const durationMs = Date.now() - t0;
  if (!result.ok) {
    // `unconfigured` spends nothing and records nothing — the PR stays dark.
    if (result.reason !== 'unconfigured') {
      after(() =>
        recordLlmUsage({
          feature: 'coach_chat',
          identity: caller,
          ok: false,
          reason: result.reason,
          durationMs,
        })
      );
    }
    if (result.reason === 'unconfigured') {
      return NextResponse.json({ error: 'coach_offline' }, { status: 503 });
    }
    return NextResponse.json({ error: 'coach_unavailable' }, { status: 502 });
  }

  after(() =>
    recordLlmUsage({
      feature: 'coach_chat',
      identity: caller,
      usage: result.usage,
      ok: true,
      durationMs,
    })
  );

  return NextResponse.json({
    message: result.message,
    actionLabel: result.actionLabel,
    actionPath: result.actionPath,
    source: result.source,
  });
});
