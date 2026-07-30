/**
 * LLM token usage — parse what the provider reports, estimate when it doesn't.
 *
 * Every paid feature this app might ship (voice, Bundle rewrites) was gated on
 * one sentence in the Grok Voice research: "per-user spend metering does not
 * exist." It could not exist, because both LLM clients discarded the provider's
 * `usage` block on the floor. This module is the missing first inch: a number
 * for every call, provider-reported when available, estimated (and *marked*
 * estimated) when not — an estimate presented as a measurement would poison
 * every cost decision built on top of it.
 */

export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** True when derived from character counts rather than the provider's meter. */
  estimated: boolean;
}

function toCount(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(0, Math.round(value));
}

/**
 * Parse an OpenAI-compatible `usage` block ({prompt_tokens, completion_tokens,
 * total_tokens}). Null when the shape is absent or unusable — the caller falls
 * back to an estimate rather than recording zeros that read as "free".
 */
export function parseLlmUsage(raw: unknown): LlmUsage | null {
  if (!raw || typeof raw !== 'object') return null;
  const u = raw as { prompt_tokens?: unknown; completion_tokens?: unknown; total_tokens?: unknown };
  const prompt = toCount(u.prompt_tokens);
  const completion = toCount(u.completion_tokens);
  if (prompt === null && completion === null) return null;
  const p = prompt ?? 0;
  const c = completion ?? 0;
  return {
    promptTokens: p,
    completionTokens: c,
    totalTokens: toCount(u.total_tokens) ?? p + c,
    estimated: false,
  };
}

/**
 * Character-count fallback, ~4 chars/token (the standard English heuristic).
 * Deliberately coarse: its job is order-of-magnitude spend visibility when a
 * provider omits usage, not billing-grade precision — hence `estimated: true`.
 */
export function estimateLlmUsage(promptChars: number, completionChars: number): LlmUsage {
  const prompt = Math.ceil(Math.max(0, promptChars) / 4);
  const completion = Math.ceil(Math.max(0, completionChars) / 4);
  return {
    promptTokens: prompt,
    completionTokens: completion,
    totalTokens: prompt + completion,
    estimated: true,
  };
}
