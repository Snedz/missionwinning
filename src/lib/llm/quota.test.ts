import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DAILY_CAPS,
  allowLlmInference,
  checkLlmDailyQuota,
  dailyCapFor,
  llmQuotaKey,
} from '@/lib/llm/quota';
import type { LlmCallerIdentity } from '@/lib/llm/meteringRow';

const USER: LlmCallerIdentity = { userId: 'u-1', deviceId: 'd-1', ip: '1.2.3.4' };
const DEVICE: LlmCallerIdentity = { userId: null, deviceId: 'd-1', ip: '1.2.3.4' };
const ANON: LlmCallerIdentity = { userId: null, deviceId: null, ip: '1.2.3.4' };

describe('llmQuotaKey', () => {
  it('strongest identity wins: user over device over ip', () => {
    assert.equal(llmQuotaKey('coach_chat', USER), 'llm-day:coach_chat:u:u-1');
    assert.equal(llmQuotaKey('coach_chat', DEVICE), 'llm-day:coach_chat:d:d-1');
  });

  it('an anonymous caller still gets a key — the ip floor caps who metering cannot name', () => {
    assert.equal(llmQuotaKey('meal_vision', ANON), 'llm-day:meal_vision:ip:1.2.3.4');
    assert.equal(
      llmQuotaKey('meal_vision', { userId: null, deviceId: null, ip: '' }),
      'llm-day:meal_vision:ip:unknown'
    );
  });
});

describe('dailyCapFor', () => {
  it('env overrides the default; garbage and negatives fall back', () => {
    assert.equal(dailyCapFor('coach_chat', { LLM_DAILY_CAP_COACH_CHAT: '5' }), 5);
    assert.equal(dailyCapFor('coach_chat', {}), DEFAULT_DAILY_CAPS.coach_chat);
    assert.equal(dailyCapFor('coach_chat', { LLM_DAILY_CAP_COACH_CHAT: 'lots' }), DEFAULT_DAILY_CAPS.coach_chat);
    assert.equal(dailyCapFor('coach_chat', { LLM_DAILY_CAP_COACH_CHAT: '-1' }), DEFAULT_DAILY_CAPS.coach_chat);
  });

  it("'0' is the per-feature kill switch, not garbage", () => {
    assert.equal(dailyCapFor('plan_voice', { LLM_DAILY_CAP_PLAN_VOICE: '0' }), 0);
  });
});

describe('checkLlmDailyQuota', () => {
  it('allows under the cap, refuses over it, with the day window on the limiter', () => {
    const calls: { key: string; limit: number; windowMs: number }[] = [];
    let count = 0;
    const limiter = async (key: string, limit: number, windowMs: number) => {
      calls.push({ key, limit, windowMs });
      count += 1;
      return count <= limit ? { ok: true } : { ok: false, retryAfterSec: 60 };
    };
    return (async () => {
      const env = { LLM_DAILY_CAP_COACH_CHAT: '2' };
      const a = await checkLlmDailyQuota('coach_chat', USER, { env, limiter });
      const b = await checkLlmDailyQuota('coach_chat', USER, { env, limiter });
      const c = await checkLlmDailyQuota('coach_chat', USER, { env, limiter });
      assert.equal(a.ok, true);
      assert.equal(b.ok, true);
      assert.equal(c.ok, false);
      assert.equal(c.retryAfterSec, 60);
      // Literal on purpose: asserting against the imported DAY_MS would pass
      // even if someone quietly shrank the constant to a minute.
      assert.ok(calls.every((call) => call.windowMs === 86_400_000), 'daily window, not a minute');
      assert.ok(calls.every((call) => call.key === 'llm-day:coach_chat:u:u-1'));
    })();
  });

  it('a cap of 0 refuses without consulting the limiter — the kill switch is absolute', async () => {
    const limiter = async () => {
      throw new Error('must not be called');
    };
    const d = await checkLlmDailyQuota('plan_voice', USER, {
      env: { LLM_DAILY_CAP_PLAN_VOICE: '0' },
      limiter,
    });
    assert.equal(d.ok, false);
  });

  it('a limiter blow-up fails OPEN — quota plumbing must never take the coach down', async () => {
    const limiter = async () => {
      throw new Error('redis on fire');
    };
    const d = await checkLlmDailyQuota('coach_chat', USER, { env: {}, limiter });
    assert.equal(d.ok, true);
  });
});

describe('allowLlmInference', () => {
  it('refuses when the dollar cap is 0 even if the request cap would allow', async () => {
    const limiter = async () => ({ ok: true });
    const d = await allowLlmInference('coach_chat', USER, {
      env: { LLM_DAILY_USD_CENTS: '0', LLM_DAILY_CAP_COACH_CHAT: '60' },
      limiter,
    });
    assert.equal(d.ok, false);
  });
});
