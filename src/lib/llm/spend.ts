/**
 * Dollar math for LLM spend caps — pure, so tests can falsify it without Redis.
 *
 * Request counts (quota.ts) do not implement “never cost more than Super Bundle.”
 * Lifetime is $149 once; Grok is pay-per-token forever. This module converts a
 * usage row into whole cents using the provider tick when present, else the
 * grok-4.6 list price. Hidden reasoning tokens count as output.
 */

import type { LlmUsage } from '@/lib/llm/usage';

/** xAI: 100_000_000 ticks = 1 USD cent; 10_000_000_000 ticks = $1. */
export const TICKS_PER_CENT = 100_000_000;

export const GROK_46_INPUT_USD_PER_MILLION = 2;
export const GROK_46_OUTPUT_USD_PER_MILLION = 6;

/** Per-identity daily cap. 15¢ ≈ $4.50/mo — under founders year and monthly. */
export const DEFAULT_DAILY_USD_CENTS = 15;

/** Org-wide daily breaker so one script cannot empty the team key. */
export const DEFAULT_ORG_DAILY_USD_CENTS = 2500;

export function dailyUsdCentsCap(
  env: Record<string, string | undefined> = process.env
): number {
  return parseCentsEnv(env.LLM_DAILY_USD_CENTS, DEFAULT_DAILY_USD_CENTS);
}

export function orgUsdCentsCap(
  env: Record<string, string | undefined> = process.env
): number {
  return parseCentsEnv(env.LLM_ORG_DAILY_USD_CENTS, DEFAULT_ORG_DAILY_USD_CENTS);
}

/** Integer ≥ 0; '0' is a kill switch; garbage → default. */
export function parseCentsEnv(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw.trim());
  if (!Number.isInteger(n) || n < 0) return fallback;
  return n;
}

/**
 * Whole cents to charge against the daily budget.
 * Unknown usage still costs 1¢ so a mute provider cannot look free.
 */
export function centsFromUsage(usage?: LlmUsage | null): number {
  if (usage?.costUsdTicks != null) {
    return Math.max(1, Math.ceil(usage.costUsdTicks / TICKS_PER_CENT));
  }
  if (!usage) return 1;
  const inputUsd = (usage.promptTokens / 1_000_000) * GROK_46_INPUT_USD_PER_MILLION;
  const outTokens = usage.completionTokens + (usage.reasoningTokens ?? 0);
  const outputUsd = (outTokens / 1_000_000) * GROK_46_OUTPUT_USD_PER_MILLION;
  return Math.max(1, Math.ceil((inputUsd + outputUsd) * 100));
}

export function llmSpendKey(identity: {
  userId: string | null;
  deviceId: string | null;
  ip: string;
}): string {
  if (identity.userId) return `llm-day:usd:u:${identity.userId}`;
  if (identity.deviceId) return `llm-day:usd:d:${identity.deviceId}`;
  return `llm-day:usd:ip:${identity.ip || 'unknown'}`;
}

export const LLM_ORG_SPEND_KEY = 'llm-day:usd:org';
