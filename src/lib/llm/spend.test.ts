import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DAILY_USD_CENTS,
  DEFAULT_ORG_DAILY_USD_CENTS,
  TICKS_PER_CENT,
  centsFromUsage,
  dailyUsdCentsCap,
  llmSpendKey,
  orgUsdCentsCap,
} from '@/lib/llm/spend';
import {
  addLlmSpend,
  checkLlmDailySpend,
  type SpendStore,
  type SpendBucket,
} from '@/lib/llm/spendLimit';
import type { LlmCallerIdentity } from '@/lib/llm/meteringRow';

const USER: LlmCallerIdentity = { userId: 'u-1', deviceId: 'd-1', ip: '1.2.3.4' };

function memoryStore(): SpendStore & { buckets: Map<string, SpendBucket> } {
  const buckets = new Map<string, SpendBucket>();
  const windowEnd = Date.now() + 86_400_000;
  return {
    buckets,
    async get(key) {
      return buckets.get(key) ?? { cents: 0, resetAt: windowEnd };
    },
    async add(key, cents) {
      const cur = buckets.get(key) ?? { cents: 0, resetAt: windowEnd };
      buckets.set(key, { ...cur, cents: cur.cents + cents });
    },
  };
}

describe('centsFromUsage', () => {
  it('prefers provider ticks over the list-price estimate', () => {
    assert.equal(centsFromUsage({ costUsdTicks: TICKS_PER_CENT * 3, promptTokens: 0, completionTokens: 0, totalTokens: 0, estimated: false }), 3);
  });

  it('counts reasoning tokens as output at the grok-4.6 list price', () => {
    // 500k input * $2/M = $1; 100k output+reason * $6/M = $0.60 → 160¢
    const cents = centsFromUsage({
      promptTokens: 500_000,
      completionTokens: 50_000,
      reasoningTokens: 50_000,
      totalTokens: 600_000,
      estimated: false,
    });
    assert.equal(cents, 160);
  });

  it('unknown or empty usage still costs 1¢ — mute meters cannot look free', () => {
    assert.equal(centsFromUsage(null), 1);
    assert.equal(
      centsFromUsage({ promptTokens: 10, completionTokens: 2, totalTokens: 12, estimated: true }),
      1
    );
  });
});

describe('dailyUsdCentsCap', () => {
  it('defaults, accepts 0 as a kill switch, and ignores garbage', () => {
    assert.equal(dailyUsdCentsCap({}), DEFAULT_DAILY_USD_CENTS);
    assert.equal(dailyUsdCentsCap({ LLM_DAILY_USD_CENTS: '0' }), 0);
    assert.equal(dailyUsdCentsCap({ LLM_DAILY_USD_CENTS: '40' }), 40);
    assert.equal(dailyUsdCentsCap({ LLM_DAILY_USD_CENTS: 'nope' }), DEFAULT_DAILY_USD_CENTS);
    assert.equal(orgUsdCentsCap({}), DEFAULT_ORG_DAILY_USD_CENTS);
  });
});

describe('llmSpendKey', () => {
  it('keys user over device over ip', () => {
    assert.equal(llmSpendKey(USER), 'llm-day:usd:u:u-1');
    assert.equal(llmSpendKey({ userId: null, deviceId: 'd-1', ip: '1.2.3.4' }), 'llm-day:usd:d:d-1');
    assert.equal(llmSpendKey({ userId: null, deviceId: null, ip: '' }), 'llm-day:usd:ip:unknown');
  });
});

describe('checkLlmDailySpend / addLlmSpend', () => {
  it('allows under the cap and refuses after recorded spend', async () => {
    const store = memoryStore();
    const env = { LLM_DAILY_USD_CENTS: '2', LLM_ORG_DAILY_USD_CENTS: '100' };
    const first = await checkLlmDailySpend(USER, { env, store });
    assert.equal(first.ok, true);
    await addLlmSpend(
      USER,
      { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimated: false, costUsdTicks: TICKS_PER_CENT * 2 },
      { env, store }
    );
    const second = await checkLlmDailySpend(USER, { env, store });
    assert.equal(second.ok, false);
  });

  it('org breaker fires even when the identity is still under its own cap', async () => {
    const store = memoryStore();
    const env = { LLM_DAILY_USD_CENTS: '100', LLM_ORG_DAILY_USD_CENTS: '2' };
    await addLlmSpend(
      USER,
      { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimated: false, costUsdTicks: TICKS_PER_CENT * 2 },
      { env, store }
    );
    const other: LlmCallerIdentity = { userId: 'u-2', deviceId: null, ip: '9.9.9.9' };
    const blocked = await checkLlmDailySpend(other, { env, store });
    assert.equal(blocked.ok, false);
  });

  it('a 0 cap refuses without touching the store', async () => {
    const store: SpendStore = {
      async get() {
        throw new Error('must not get');
      },
      async add() {
        throw new Error('must not add');
      },
    };
    const d = await checkLlmDailySpend(USER, {
      env: { LLM_DAILY_USD_CENTS: '0' },
      store,
    });
    assert.equal(d.ok, false);
  });

  it('a store blow-up fails CLOSED — unlike request quota', async () => {
    const store: SpendStore = {
      async get() {
        throw new Error('redis on fire');
      },
      async add() {
        throw new Error('redis on fire');
      },
    };
    const d = await checkLlmDailySpend(USER, { env: {}, store });
    assert.equal(d.ok, false);
  });
});
