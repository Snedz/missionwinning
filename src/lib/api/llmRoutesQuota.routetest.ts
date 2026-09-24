/**
 * Route-level contracts for the `.188` LLM spend gates.
 *
 * `.188` shipped with an honest gap: these routes transitively import
 * `server-only`, which throws under plain `tsx`, so the *wiring* — as opposed to
 * the pure quota/metering decisions — went untested. Node's own exports map has
 * the answer (`server-only` resolves to an empty module under the `react-server`
 * condition), so this file runs in its own lane: `npm run test:routes`.
 *
 * What is pinned here is the thing unit tests structurally cannot see: that a
 * refusal lands on the *rules* answer instead of an error. Every route except
 * chat must degrade — an athlete who runs out of paid inference still gets the
 * free product, exactly as if they had never been premium. Wiring the quota as
 * a route-wide 429 (the `quota-blocks-rules-path` mutant) passes every pure test
 * in the repo and fails here.
 *
 * Determinism: caps are driven to `0` — the kill switch refuses *without*
 * consulting the limiter, so no shared in-memory bucket and no network fetch is
 * involved. Each test uses a unique IP so the per-minute limiters cannot bleed
 * across cases.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST as dailyInsightPost } from '../../../app/api/coach/daily-insight/route.ts';
import { POST as planVoicePost } from '../../../app/api/coach/plan-voice/route.ts';
import { POST as chatPost } from '../../../app/api/coach/chat/route.ts';
import { POST as sessionTrainerPost } from '../../../app/api/coach/session-trainer/route.ts';
import { makeNextRequest } from '@/lib/api/testRequest';
import { createPrivateAccessToken, PRIVATE_ACCESS_COOKIE } from '@/lib/privateSession';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';

const SECRET = 'test-gate-secret-32chars-min!!';

function gateCookies(): Record<string, string> {
  return { [PRIVATE_ACCESS_COOKIE]: createPrivateAccessToken(SECRET) };
}

/** Pretend the LLM is configured — no call is ever made in these tests. */
function configureLlm(): void {
  setTestEnv('COACH_LLM_API_URL', 'https://api.invalid/v1/chat/completions');
  setTestEnv('COACH_LLM_API_KEY', 'xai-test-key');
}

const DAILY_BODY = {
  readiness: 60,
  strain: 40,
  recovery: 70,
  fallback: {
    messageKey: 'coachInsightSteady',
    actionLabelKey: 'coachActionTrain',
    actionPath: '/active',
  },
};

const PLAN_BODY = {
  plan: {
    weekStart: '2026-07-27',
    sessions: [{ name: 'Push', kind: 'strength', whyKeys: [] }],
  },
  readiness: 55,
  strain: 40,
  recovery: 60,
};

const CHAT_BODY = {
  message: 'How should I approach squats this week?',
  turns: [],
  context: { readiness: 60, strain: 40, recovery: 70, trainDays14: 5 },
};

function post(
  handler: (req: ReturnType<typeof makeNextRequest>) => Promise<Response>,
  url: string,
  body: unknown,
  ip: string,
  opts?: { cookies?: Record<string, string> }
): Promise<Response> {
  return handler(
    makeNextRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
      cookies: opts?.cookies,
    })
  );
}

describe('LLM route spend gates (.188 wiring)', () => {
  let envSnapshot: NodeJS.ProcessEnv;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
    setTestEnv('PRIVATE_ACCESS_SECRET', SECRET);
    // Free beta ON is the production posture today — premium bypass true.
    setTestEnv('NEXT_PUBLIC_FREE_BETA', 'true');
    // Dark by default; individual tests opt in with configureLlm().
    setTestEnv('COACH_LLM_API_URL', undefined);
    setTestEnv('COACH_LLM_API_KEY', undefined);
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it('daily-insight: an exhausted quota still answers, with the rules insight', async () => {
    configureLlm();
    setTestEnv('LLM_DAILY_CAP_DAILY_INSIGHT', '0');
    const res = await post(
      dailyInsightPost,
      'http://localhost/api/coach/daily-insight',
      DAILY_BODY,
      '10.1.0.1',
      { cookies: gateCookies() }
    );
    // 200 with the free answer — NOT 429. An athlete out of paid inference gets
    // the product, not an error. The route-wide-429 mutant dies here.
    assert.equal(res.status, 200);
    const data = (await res.json()) as { source: string; reason?: string; messageKey?: string };
    assert.equal(data.source, 'rules');
    assert.equal(data.reason, 'quota');
    assert.equal(data.messageKey, 'coachInsightSteady');
  });

  it('daily-insight: a dark LLM env never consults the quota (stays-dark contract)', async () => {
    setTestEnv('LLM_DAILY_CAP_DAILY_INSIGHT', '0');
    const res = await post(
      dailyInsightPost,
      'http://localhost/api/coach/daily-insight',
      DAILY_BODY,
      '10.1.0.2',
      { cookies: gateCookies() }
    );
    assert.equal(res.status, 200);
    const data = (await res.json()) as { source: string; reason?: string };
    assert.equal(data.source, 'rules');
    // No `reason: 'quota'`: unconfigured is not "out of budget", and saying so
    // would make an un-armed deployment look rate-limited.
    assert.equal(data.reason, undefined);
  });

  it('plan-voice: a signed-out visitor always gets the rules briefing', async () => {
    // The deliberate contract in the route comment: the cost gate must not sit
    // in front of the free local briefing. No cookies = no app access.
    configureLlm();
    const res = await post(
      planVoicePost,
      'http://localhost/api/coach/plan-voice',
      PLAN_BODY,
      '10.1.0.3'
    );
    assert.equal(res.status, 200);
    const data = (await res.json()) as { source: string; message: string };
    assert.equal(data.source, 'rules');
    assert.ok(data.message.length > 0);
  });

  it('plan-voice: an exhausted quota degrades to rules, never 429', async () => {
    configureLlm();
    setTestEnv('LLM_DAILY_CAP_PLAN_VOICE', '0');
    const res = await post(
      planVoicePost,
      'http://localhost/api/coach/plan-voice',
      PLAN_BODY,
      '10.1.0.4',
      { cookies: gateCookies() }
    );
    assert.equal(res.status, 200);
    const data = (await res.json()) as { source: string };
    assert.equal(data.source, 'rules');
  });

  it('chat: an exhausted quota is an honest 429 — it has no rules engine to answer with', async () => {
    configureLlm();
    setTestEnv('LLM_DAILY_CAP_COACH_CHAT', '0');
    const res = await post(
      chatPost,
      'http://localhost/api/coach/chat',
      CHAT_BODY,
      '10.1.0.5',
      { cookies: gateCookies() }
    );
    assert.equal(res.status, 429);
    const data = (await res.json()) as { error: string };
    assert.equal(data.error, 'coach_quota');
  });

  it('chat: a dark LLM env is coach_offline, never coach_quota', async () => {
    setTestEnv('LLM_DAILY_CAP_COACH_CHAT', '0');
    const res = await post(
      chatPost,
      'http://localhost/api/coach/chat',
      CHAT_BODY,
      '10.1.0.6',
      { cookies: gateCookies() }
    );
    // Unconfigured must keep reading as offline: a founder who has not set keys
    // should never be told they hit a spending limit they never had.
    assert.equal(res.status, 503);
    const data = (await res.json()) as { error: string };
    assert.equal(data.error, 'coach_offline');
  });

  const TRAINER_BODY = {
    exerciseId: 'squats',
    exerciseName: 'Back Squat',
    weight: 60,
    reps: 8,
    unit: 'kg' as const,
    setsLeft: 3,
    formCue: 'Brace, then drive the floor away.',
    planLabel: 'Legs',
  };

  it('session-trainer: no key stays on the library line and does not call a model', async () => {
    setTestEnv('GEMINI_API_KEY', undefined);
    setTestEnv('GOOGLE_GENERATIVE_AI_API_KEY', undefined);
    setTestEnv('COACH_LLM_API_URL', undefined);
    setTestEnv('COACH_LLM_API_KEY', undefined);
    let calls = 0;
    const original = globalThis.fetch;
    globalThis.fetch = async () => {
      calls += 1;
      throw new Error('model should not be called');
    };
    try {
      const res = await post(
        sessionTrainerPost,
        'http://localhost/api/coach/session-trainer',
        TRAINER_BODY,
        '10.2.0.1'
      );
      assert.equal(res.status, 200);
      const data = (await res.json()) as { source: string; line: string | null; reason?: string };
      assert.equal(data.source, 'library');
      assert.equal(data.line, null);
      assert.equal(data.reason, undefined);
      assert.equal(calls, 0);
    } finally {
      globalThis.fetch = original;
    }
  });

  it('session-trainer: free beta off, signed-out, does not spend', async () => {
    setTestEnv('GEMINI_API_KEY', 'test-gemini-key');
    setTestEnv('NEXT_PUBLIC_FREE_BETA', 'false');
    let calls = 0;
    const original = globalThis.fetch;
    globalThis.fetch = async () => {
      calls += 1;
      throw new Error('model should not be called');
    };
    try {
      const res = await post(
        sessionTrainerPost,
        'http://localhost/api/coach/session-trainer',
        TRAINER_BODY,
        '10.2.0.4'
      );
      assert.equal(res.status, 200);
      const data = (await res.json()) as { source: string };
      assert.equal(data.source, 'library');
      assert.equal(calls, 0);
    } finally {
      globalThis.fetch = original;
    }
  });

  it('session-trainer: an exhausted daily cap degrades to library, never 429', async () => {
    setTestEnv('GEMINI_API_KEY', 'test-gemini-key');
    setTestEnv('LLM_DAILY_CAP_DAILY_INSIGHT', '0');
      const res = await post(
        sessionTrainerPost,
        'http://localhost/api/coach/session-trainer',
        TRAINER_BODY,
        '10.2.0.2'
      );
    assert.equal(res.status, 200);
    const data = (await res.json()) as { source: string; reason?: string; model: string | null };
    assert.equal(data.source, 'library');
    assert.equal(data.reason, 'quota');
    assert.equal(data.model, null);
  });

  it('session-trainer: Gemini Flash is the free model that gets called', async () => {
    setTestEnv('GEMINI_API_KEY', 'test-gemini-key');
    const urls: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      urls.push(String(input));
      const headers = new Headers(init?.headers);
      assert.equal(headers.get('x-goog-api-key'), 'test-gemini-key');
      assert.equal(String(init?.body ?? '').includes('test-gemini-key'), false);
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '{"line":"Back Squat, 60 kg for 8. Brace, then drive the floor away."}',
                  },
                ],
              },
            },
          ],
          usageMetadata: { promptTokenCount: 11, candidatesTokenCount: 14, totalTokenCount: 25 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    };
    try {
      const res = await post(
        sessionTrainerPost,
        'http://localhost/api/coach/session-trainer',
        TRAINER_BODY,
        '10.2.0.3'
      );
      assert.equal(res.status, 200);
      const data = (await res.json()) as { source: string; model: string; line: string };
      assert.equal(data.source, 'llm');
      assert.equal(data.model, 'gemini-2.5-flash');
      assert.match(data.line, /Back Squat/);
      assert.equal(urls.length, 1);
      assert.match(urls[0], /\/models\/gemini-2\.5-flash:generateContent$/);
    } finally {
      globalThis.fetch = original;
    }
  });

  it('every LLM route refuses an unauthorized caller before spending anything', async () => {
    configureLlm();
    const res = await post(
      dailyInsightPost,
      'http://localhost/api/coach/daily-insight',
      DAILY_BODY,
      '10.1.0.7'
    );
    assert.equal(res.status, 401);
  });
});
