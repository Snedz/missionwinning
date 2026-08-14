/**
 * Daily dollar-cap enforcement for LLM routes.
 *
 * Fail-closed: if the store throws, the call is refused. Request-count quota
 * stays fail-open (quota.ts); this is the profit brake and must not open.
 * Without Upstash the in-memory store is the local stand-in — same as quota.
 */

import type { LlmCallerIdentity } from '@/lib/llm/meteringRow';
import type { LlmUsage } from '@/lib/llm/usage';
import { DAY_MS } from '@/lib/llm/quota';
import {
  LLM_ORG_SPEND_KEY,
  centsFromUsage,
  dailyUsdCentsCap,
  llmSpendKey,
  orgUsdCentsCap,
} from '@/lib/llm/spend';

export type SpendDecision = { ok: boolean; retryAfterSec?: number };

export type SpendBucket = { cents: number; resetAt: number };

export type SpendStore = {
  get: (key: string, windowMs: number) => Promise<SpendBucket>;
  add: (key: string, cents: number, windowMs: number) => Promise<void>;
};

const memory = new Map<string, SpendBucket>();

function memoryGet(key: string, windowMs: number): SpendBucket {
  const now = Date.now();
  const bucket = memory.get(key);
  if (!bucket || now > bucket.resetAt) {
    const fresh = { cents: 0, resetAt: now + windowMs };
    memory.set(key, fresh);
    return fresh;
  }
  return bucket;
}

export const memorySpendStore: SpendStore = {
  async get(key, windowMs) {
    return memoryGet(key, windowMs);
  },
  async add(key, cents, windowMs) {
    const bucket = memoryGet(key, windowMs);
    bucket.cents += cents;
  },
};

async function upstashSpendStore(): Promise<SpendStore | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({ url, token });
  return {
    async get(key, windowMs) {
      const raw = await redis.get<number | string | null>(key);
      const cents = typeof raw === 'number' ? raw : Number(raw ?? 0);
      return {
        cents: Number.isFinite(cents) ? cents : 0,
        resetAt: Date.now() + windowMs,
      };
    },
    async add(key, cents, windowMs) {
      const next = await redis.incrby(key, cents);
      if (next === cents) {
        await redis.expire(key, Math.max(1, Math.ceil(windowMs / 1000)));
      }
    },
  };
}

async function resolveStore(override?: SpendStore): Promise<SpendStore> {
  if (override) return override;
  const remote = await upstashSpendStore();
  return remote ?? memorySpendStore;
}

export async function checkLlmDailySpend(
  identity: LlmCallerIdentity,
  options?: {
    env?: Record<string, string | undefined>;
    store?: SpendStore;
  }
): Promise<SpendDecision> {
  const env = options?.env ?? process.env;
  const identityCap = dailyUsdCentsCap(env);
  const orgCap = orgUsdCentsCap(env);
  if (identityCap === 0 || orgCap === 0) return { ok: false };
  try {
    const store = await resolveStore(options?.store);
    const [person, org] = await Promise.all([
      store.get(llmSpendKey(identity), DAY_MS),
      store.get(LLM_ORG_SPEND_KEY, DAY_MS),
    ]);
    if (person.cents >= identityCap) {
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((person.resetAt - Date.now()) / 1000)),
      };
    }
    if (org.cents >= orgCap) {
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((org.resetAt - Date.now()) / 1000)),
      };
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function addLlmSpend(
  identity: LlmCallerIdentity,
  usage: LlmUsage | null | undefined,
  options?: {
    env?: Record<string, string | undefined>;
    store?: SpendStore;
  }
): Promise<void> {
  const cents = centsFromUsage(usage);
  try {
    const store = await resolveStore(options?.store);
    await Promise.all([
      store.add(llmSpendKey(identity), cents, DAY_MS),
      store.add(LLM_ORG_SPEND_KEY, cents, DAY_MS),
    ]);
  } catch {
    // Increment is best-effort; the next check fail-closes if the store is dead.
  }
}
