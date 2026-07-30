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

import { estimateLlmUsage, parseLlmUsage, type LlmUsage } from '@/lib/llm/usage';

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
  /** Provider-reported when available, char-estimate otherwise (`estimated`). */
  usage: LlmUsage;
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
      usage?: unknown;
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

    const usage =
      parseLlmUsage(data.usage) ??
      estimateLlmUsage(req.system.length + req.user.length, content.length);
    logCoachLlmMeta({
      ok: true,
      reason: 'ok',
      status: res.status,
      zdr,
      ms: Date.now() - t0,
      usage,
    });
    return { ok: true, content, zeroDataRetention: zdr, usage };
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
  usage?: LlmUsage;
}): void {
  // Structured meta only — never prompt/completion content. Token counts ride
  // along so stdout gives spend visibility even before llm_usage is applied.
  console.info(
    JSON.stringify({
      type: 'coach_llm',
      ok: meta.ok,
      reason: meta.reason,
      status: meta.status,
      zeroDataRetention: meta.zdr ?? null,
      durationMs: meta.ms,
      ...(meta.usage
        ? {
            promptTokens: meta.usage.promptTokens,
            completionTokens: meta.usage.completionTokens,
            estimated: meta.usage.estimated,
          }
        : {}),
    })
  );
}

export type CoachLlmStreamFail = {
  ok: false;
  reason: CoachLlmFail['reason'];
  status?: number;
  zeroDataRetention?: boolean | null;
};

/**
 * Streaming chat completion (OpenAI-compatible SSE). Yields text deltas.
 * ZDR-safe one-shot only — no Files/Batch/stateful Responses.
 */
export async function* streamCoachLlmCompletion(
  req: CoachLlmRequest,
  options?: {
    env?: CoachLlmEnv;
    fetchImpl?: FetchLike;
    timeoutMs?: number;
    signal?: AbortSignal;
  }
): AsyncGenerator<
  string,
  CoachLlmStreamFail | { ok: true; zeroDataRetention: boolean | null; usage: LlmUsage },
  void
> {
  const cfg = options?.env ?? readCoachLlmEnv();
  if (!cfg.apiUrl || !cfg.apiKey) {
    return { ok: false, reason: 'unconfigured' };
  }

  const model = cfg.model || 'grok-4.5';
  const fetchImpl = options?.fetchImpl ?? fetch;
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const t0 = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  if (options?.signal) {
    if (options.signal.aborted) controller.abort();
    else {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }
  const signal = controller.signal;

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
        stream: true,
        // OpenAI-compatible: ask for a final usage chunk. xAI honors this; a
        // provider that 400s on it lands in the existing http_error degrade
        // path, and one that ignores it falls back to the char estimate below.
        stream_options: { include_usage: true },
      }),
      signal,
    });
    clearTimeout(timeoutId);

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

    if (!res.ok || !res.body) {
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

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let yielded = false;
    let completionChars = 0;
    let providerUsage: LlmUsage | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
            usage?: unknown;
          };
          // Usage may arrive on any chunk (xAI: interim and final); last wins.
          const parsedUsage = parseLlmUsage(parsed.usage);
          if (parsedUsage) providerUsage = parsedUsage;
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            yielded = true;
            completionChars += delta.length;
            yield delta;
          }
        } catch {
          /* ignore partial JSON lines */
        }
      }
    }

    if (!yielded) {
      logCoachLlmMeta({
        ok: false,
        reason: 'empty',
        status: res.status,
        zdr,
        ms: Date.now() - t0,
      });
      return { ok: false, reason: 'empty', zeroDataRetention: zdr, status: res.status };
    }

    const usage =
      providerUsage ??
      estimateLlmUsage(req.system.length + req.user.length, completionChars);
    logCoachLlmMeta({
      ok: true,
      reason: 'ok',
      status: res.status,
      zdr,
      ms: Date.now() - t0,
      usage,
    });
    return { ok: true, zeroDataRetention: zdr, usage };
  } catch (err) {
    clearTimeout(timeoutId);
    const name = err instanceof Error ? err.name : '';
    const reason = name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network';
    logCoachLlmMeta({ ok: false, reason, ms: Date.now() - t0 });
    return { ok: false, reason };
  }
}
