/**
 * Shared SpaceXAI/xAI-oriented coach LLM client (OpenAI-compatible chat completions).
 *
 * Prefer SpaceXAI (xAI API): base https://api.x.ai/v1/chat/completions, key from console.x.ai.
 * Production teams should enable Zero Data Retention (ZDR) in the xAI Console — team-wide.
 * Docs: https://docs.x.ai/developers/faq/security#what-is-zero-data-retention-zdr
 *
 * ZDR-safe only: one-shot chat completions. Do not use Files, Collections, Batch,
 * deferred completions, or stateful Responses store_messages / previous_response_id.
 */

export type CoachLlmRequest = {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
};

export type CoachLlmOk = {
  ok: true;
  content: string;
  zeroDataRetention: boolean | null;
};

export type CoachLlmFail = {
  ok: false;
  reason:
    | 'unconfigured'
    | 'http_error'
    | 'empty'
    | 'network'
    | 'zdr_inactive'
    | 'timeout';
  zeroDataRetention?: boolean | null;
  status?: number;
};

export type CoachLlmResult = CoachLlmOk | CoachLlmFail;

export type CoachLlmEnv = {
  apiUrl?: string;
  apiKey?: string;
  model?: string;
  requireZdr?: boolean;
};

/** Pure parse of the ZDR response header (xAI returns "true" | "false"). */
export function parseZeroDataRetentionHeader(
  value: string | null | undefined
): boolean | null {
  if (value == null || value === '') return null;
  const v = value.trim().toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return null;
}

export function isTruthyEnv(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

export function readCoachLlmEnv(
  env: Record<string, string | undefined> = process.env
): CoachLlmEnv {
  return {
    apiUrl: env.COACH_LLM_API_URL?.trim() || undefined,
    apiKey: env.COACH_LLM_API_KEY?.trim() || undefined,
    model: env.COACH_LLM_MODEL?.trim() || undefined,
    requireZdr: isTruthyEnv(env.COACH_LLM_REQUIRE_ZDR),
  };
}

type FetchLike = typeof fetch;

/**
 * Stateless chat completion. Never logs prompt/completion bodies.
 * When requireZdr is set, missing or false x-zero-data-retention fails closed.
 */
export async function fetchCoachLlmCompletion(
  req: CoachLlmRequest,
  options?: {
    env?: CoachLlmEnv;
    fetchImpl?: FetchLike;
    timeoutMs?: number;
  }
): Promise<CoachLlmResult> {
  const cfg = options?.env ?? readCoachLlmEnv();
  if (!cfg.apiUrl || !cfg.apiKey) {
    return { ok: false, reason: 'unconfigured' };
  }

  const model = cfg.model || 'grok-4.5';
  const fetchImpl = options?.fetchImpl ?? fetch;
  const timeoutMs = options?.timeoutMs ?? 12_000;
  const t0 = Date.now();

  try {
    const res = await fetchImpl(cfg.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: req.system },
          { role: 'user', content: req.user },
        ],
        max_tokens: req.maxTokens ?? 200,
        temperature: req.temperature ?? 0.6,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const zdr = parseZeroDataRetentionHeader(
      res.headers.get('x-zero-data-retention') ??
        res.headers.get('X-Zero-Data-Retention')
    );

    if (cfg.requireZdr && zdr !== true) {
      logCoachLlmMeta({
        ok: false,
        reason: 'zdr_inactive',
        status: res.status,
        zdr,
        ms: Date.now() - t0,
      });
      return { ok: false, reason: 'zdr_inactive', zeroDataRetention: zdr, status: res.status };
    }

    if (!res.ok) {
      logCoachLlmMeta({
        ok: false,
        reason: 'http_error',
        status: res.status,
        zdr,
        ms: Date.now() - t0,
      });
      return {
        ok: false,
        reason: 'http_error',
        zeroDataRetention: zdr,
        status: res.status,
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      logCoachLlmMeta({
        ok: false,
        reason: 'empty',
        status: res.status,
        zdr,
        ms: Date.now() - t0,
      });
      return { ok: false, reason: 'empty', zeroDataRetention: zdr, status: res.status };
    }

    logCoachLlmMeta({
      ok: true,
      reason: 'ok',
      status: res.status,
      zdr,
      ms: Date.now() - t0,
    });
    return { ok: true, content, zeroDataRetention: zdr };
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    const reason = name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network';
    logCoachLlmMeta({ ok: false, reason, ms: Date.now() - t0 });
    return { ok: false, reason };
  }
}

function logCoachLlmMeta(meta: {
  ok: boolean;
  reason: string;
  status?: number;
  zdr?: boolean | null;
  ms: number;
}): void {
  // Structured meta only — never prompt/completion content.
  console.info(
    JSON.stringify({
      type: 'coach_llm',
      ok: meta.ok,
      reason: meta.reason,
      status: meta.status,
      zeroDataRetention: meta.zdr ?? null,
      durationMs: meta.ms,
    })
  );
}
