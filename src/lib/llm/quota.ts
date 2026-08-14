/**
 * Per-identity daily LLM quotas — the enforcement half of the spend meter.
 *
 * Every LLM route already has a per-IP minute limiter; what it never had is a
 * *day* window keyed to *who is asking*, which is what an $/user/month product
 * actually needs. Keys prefer the signed-in user, then the device id, then fall
 * to the IP — the floor exists so an anonymous gate-cookie holder is still
 * capped rather than invisible.
 *
 * Requests per day now; token budgets are recorded in `llm_usage`, so a future
 * cost cap can read `sum(total_tokens)` without another migration.
 *
 * Fail-open by design: a quota-system error must degrade to "allowed" — the
 * call still has the minute limiter and provider limits behind it, and the
 * alternative is the quota plumbing taking the coach down. The one fail-closed
 * check in this stack remains ZDR, in coachLlmClient.
 */

import { rateLimitAsync, type RateLimitResult } from '@/lib/rateLimit';
import type { LlmCallerIdentity, LlmFeature } from '@/lib/llm/meteringRow';
import { checkLlmDailySpend } from '@/lib/llm/spendLimit';

export const DAY_MS = 86_400_000;

/**
 * DEFAULTS, not decisions — the founder owns real numbers via
 * `LLM_DAILY_CAP_<FEATURE>` env (no redeploy to tune; '0' kills the feature's
 * LLM branch outright). Sized so an engaged athlete never notices them.
 */
export const DEFAULT_DAILY_CAPS: Record<LlmFeature, number> = {
  coach_chat: 60,
  daily_insight: 30,
  plan_voice: 20,
  debrief_voice: 10,
  meal_vision: 20,
};

const ENV_KEYS: Record<LlmFeature, string> = {
  coach_chat: 'LLM_DAILY_CAP_COACH_CHAT',
  daily_insight: 'LLM_DAILY_CAP_DAILY_INSIGHT',
  plan_voice: 'LLM_DAILY_CAP_PLAN_VOICE',
  debrief_voice: 'LLM_DAILY_CAP_DEBRIEF_VOICE',
  meal_vision: 'LLM_DAILY_CAP_MEAL_VISION',
};

/** Env override or default. '0' = kill switch; garbage/negative → default. */
export function dailyCapFor(
  feature: LlmFeature,
  env: Record<string, string | undefined> = process.env
): number {
  const raw = env[ENV_KEYS[feature]]?.trim();
  if (raw === undefined || raw === '') return DEFAULT_DAILY_CAPS[feature];
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) return DEFAULT_DAILY_CAPS[feature];
  return n;
}

/**
 * Quota key, strongest identity wins: user > device > ip. Always returns a key —
 * an identity this function cannot cap is an identity that meters nobody.
 */
export function llmQuotaKey(feature: LlmFeature, identity: LlmCallerIdentity): string {
  if (identity.userId) return `llm-day:${feature}:u:${identity.userId}`;
  if (identity.deviceId) return `llm-day:${feature}:d:${identity.deviceId}`;
  return `llm-day:${feature}:ip:${identity.ip || 'unknown'}`;
}

export type LlmQuotaDecision = { ok: boolean; retryAfterSec?: number };

/**
 * One daily-window check. `limiter` is injectable for tests; production uses
 * `rateLimitAsync` (Upstash when configured, else per-instance memory — soft
 * but non-zero defense until the founder sets Upstash env; see docs/ENV.md).
 */
export async function checkLlmDailyQuota(
  feature: LlmFeature,
  identity: LlmCallerIdentity,
  options?: {
    env?: Record<string, string | undefined>;
    limiter?: (key: string, limit: number, windowMs: number) => Promise<RateLimitResult>;
  }
): Promise<LlmQuotaDecision> {
  try {
    const cap = dailyCapFor(feature, options?.env);
    if (cap === 0) return { ok: false };
    const limiter = options?.limiter ?? rateLimitAsync;
    const result = await limiter(llmQuotaKey(feature, identity), cap, DAY_MS);
    return result.ok ? { ok: true } : { ok: false, retryAfterSec: result.retryAfterSec };
  } catch {
    return { ok: true };
  }
}

/**
 * Request cap (fail-open) then dollar cap (fail-closed).
 * Dark LLM env still skips this at the route — do not call when unconfigured.
 */
export async function allowLlmInference(
  feature: LlmFeature,
  identity: LlmCallerIdentity,
  options?: {
    env?: Record<string, string | undefined>;
    limiter?: (key: string, limit: number, windowMs: number) => Promise<RateLimitResult>;
  }
): Promise<LlmQuotaDecision> {
  const requests = await checkLlmDailyQuota(feature, identity, options);
  if (!requests.ok) return requests;
  return checkLlmDailySpend(identity, { env: options?.env });
}
