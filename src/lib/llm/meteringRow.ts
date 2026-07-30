/**
 * Pure half of the LLM spend ledger — types and the row builder, kept free of
 * server-only imports so `tsx --test` can falsify it directly. The insert
 * itself lives in `metering.ts` (server-only).
 */

import type { LlmUsage } from '@/lib/llm/usage';

export type LlmFeature =
  | 'coach_chat'
  | 'daily_insight'
  | 'plan_voice'
  | 'debrief_voice'
  | 'meal_vision';

export type LlmCallerIdentity = {
  userId: string | null;
  deviceId: string | null;
  /** For quota keys only — never written to the ledger. */
  ip: string;
};

export interface LlmUsageRecordInput {
  feature: LlmFeature;
  identity: LlmCallerIdentity;
  model?: string | null;
  usage?: LlmUsage | null;
  ok: boolean;
  reason?: string;
  durationMs?: number;
}

/**
 * Pure row builder. Null when neither userId nor deviceId exists — such a row
 * would violate the DB owner check, and an IP is deliberately not an owner
 * (rotating IPs would fragment the ledger and store network metadata we do not
 * want). Unowned calls still hit the quota's IP floor and the stdout log.
 */
export function buildLlmUsageRow(input: LlmUsageRecordInput): Record<string, unknown> | null {
  const { identity } = input;
  if (!identity.userId && !identity.deviceId) return null;
  return {
    user_id: identity.userId ?? null,
    device_id: identity.userId ? null : identity.deviceId,
    feature: input.feature,
    model: input.model ?? null,
    prompt_tokens: input.usage?.promptTokens ?? 0,
    completion_tokens: input.usage?.completionTokens ?? 0,
    total_tokens: input.usage?.totalTokens ?? 0,
    estimated: input.usage?.estimated ?? false,
    ok: input.ok,
    reason: input.ok ? null : (input.reason ?? null),
    duration_ms: input.durationMs ?? null,
  };
}
