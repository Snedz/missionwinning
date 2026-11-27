/**
 * Coach model client for any OpenAI-compatible chat-completions API.
 *
 * Default seat is Groq (`GROQ_API_KEY`). If that seat is missing or the call
 * fails, the next seat is OpenRouter with a `:free` model (`OPENROUTER_API_KEY`).
 * `COACH_LLM_API_URL` + `COACH_LLM_API_KEY` is an explicit compatible endpoint
 * (any host except the Gemini free tier). Keys are read from the environment
 * only — this module has no embedded credential.
 *
 * Workout and readiness text is health data. The Gemini free tier trains on
 * that content, so a Gemini host or a `gemini` model id is never called.
 */

import {
  DEFAULT_COACH_LLM_MODEL,
  fetchCoachLlmCompletion,
  readCoachLlmEnv,
  type CoachLlmRequest,
  type CoachLlmResult,
} from '@/lib/coachLlmClient';
import { estimateLlmUsage, parseLlmUsage, type LlmUsage } from '@/lib/llm/usage';

export const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';

/** Small Groq free-tier model. Override with GROQ_MODEL. */
export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';

/** OpenRouter free-tier variant. The id must end in `:free`. */
export const DEFAULT_OPENROUTER_FREE_MODEL = 'openai/gpt-oss-20b:free';

export type CoachProviderId = 'groq' | 'openrouter' | 'openai-compatible';

export type CoachProviderSeat = {
  id: CoachProviderId;
  url: string;
  apiKey: string;
  model: string;
};

type FetchLike = typeof fetch;

/** OpenAI chat-completions envelope. Named so the vendor cast is not an inline invention. */
type OpenAiChatCompletion = {
  choices?: { message?: { content?: string } }[];
  usage?: unknown;
};

const GEMINI_HOSTS = new Set([
  'generativelanguage.googleapis.com',
  'gemini.google.com',
]);

/** True when this URL is the Gemini free-tier API (or a lookalike host). */
export function isGeminiFreeTierUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  let host = '';
  try {
    host = new URL(trimmed).hostname.toLowerCase();
  } catch {
    return /gemini|generativelanguage/i.test(trimmed);
  }
  if (GEMINI_HOSTS.has(host)) return true;
  if (host.endsWith('.generativelanguage.googleapis.com')) return true;
  if (host.includes('gemini')) return true;
  return false;
}

/** True when the model id would route the prompt to Gemini. */
export function isGeminiModel(model: string): boolean {
  return /gemini/i.test(model);
}

function clean(value: string | undefined): string {
  return value?.trim() ?? '';
}

/** OpenRouter free tier only. A paid slug gets `:free` appended once. */
export function openRouterFreeModel(raw: string | undefined): string {
  const model = clean(raw) || DEFAULT_OPENROUTER_FREE_MODEL;
  if (isGeminiModel(model)) return DEFAULT_OPENROUTER_FREE_MODEL;
  if (model.endsWith(':free')) return model;
  return `${model}:free`;
}

function pushSeat(
  seats: CoachProviderSeat[],
  seat: CoachProviderSeat
): void {
  if (!seat.apiKey || !seat.url || !seat.model) return;
  if (isGeminiFreeTierUrl(seat.url) || isGeminiModel(seat.model)) return;
  if (seats.some((existing) => existing.url === seat.url && existing.apiKey === seat.apiKey)) {
    return;
  }
  seats.push(seat);
}

/**
 * Groq, then an explicit OpenAI-compatible endpoint, then OpenRouter `:free`.
 * Gemini keys are ignored. Nothing here reads a key from disk or source.
 */
export function resolveCoachProviders(
  env: Record<string, string | undefined> = process.env
): CoachProviderSeat[] {
  const seats: CoachProviderSeat[] = [];

  const groqKey = clean(env.GROQ_API_KEY);
  if (groqKey) {
    const model = clean(env.GROQ_MODEL) || DEFAULT_GROQ_MODEL;
    pushSeat(seats, {
      id: 'groq',
      url: clean(env.GROQ_API_URL) || GROQ_CHAT_COMPLETIONS_URL,
      apiKey: groqKey,
      model,
    });
  }

  const customUrl = clean(env.COACH_LLM_API_URL);
  const customKey = clean(env.COACH_LLM_API_KEY);
  if (customUrl && customKey) {
    pushSeat(seats, {
      id: 'openai-compatible',
      url: customUrl,
      apiKey: customKey,
      model: clean(env.COACH_LLM_MODEL) || DEFAULT_COACH_LLM_MODEL,
    });
  }

  const openRouterKey = clean(env.OPENROUTER_API_KEY);
  if (openRouterKey) {
    pushSeat(seats, {
      id: 'openrouter',
      url: clean(env.OPENROUTER_API_URL) || OPENROUTER_CHAT_COMPLETIONS_URL,
      apiKey: openRouterKey,
      model: openRouterFreeModel(env.OPENROUTER_MODEL),
    });
  }

  return seats;
}

export function buildOpenAiChatBody(
  req: CoachLlmRequest,
  model: string
): Record<string, unknown> {
  const maxOut = req.maxTokens ?? 200;
  return {
    model,
    messages: [
      { role: 'system', content: req.system },
      { role: 'user', content: req.user },
    ],
    max_tokens: maxOut,
    temperature: req.temperature ?? 0.6,
  };
}

async function fetchPlainCompletion(
  seat: CoachProviderSeat,
  req: CoachLlmRequest,
  fetchImpl: FetchLike,
  timeoutMs: number
): Promise<CoachLlmResult> {
  try {
    const res = await fetchImpl(seat.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seat.apiKey}`,
      },
      body: JSON.stringify(buildOpenAiChatBody(req, seat.model)),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      return { ok: false, reason: 'http_error', status: res.status, zeroDataRetention: null };
    }
    const data = (await res.json()) as OpenAiChatCompletion;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return { ok: false, reason: 'empty', status: res.status, zeroDataRetention: null };
    const usage: LlmUsage =
      parseLlmUsage(data.usage) ??
      estimateLlmUsage(req.system.length + req.user.length, content.length);
    return { ok: true, content, zeroDataRetention: null, usage };
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    const reason = name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network';
    return { ok: false, reason };
  }
}

export type CoachProviderOk = CoachLlmResult & {
  provider?: CoachProviderId;
  model?: string;
};

/**
 * Try each resolved seat until one returns text. A failed Groq call falls
 * through to the explicit endpoint, then OpenRouter. Prompts are not logged.
 */
export async function fetchCoachProviderCompletion(
  req: CoachLlmRequest,
  options?: {
    env?: Record<string, string | undefined>;
    fetchImpl?: FetchLike;
    timeoutMs?: number;
  }
): Promise<CoachProviderOk> {
  const env = options?.env ?? process.env;
  const seats = resolveCoachProviders(env);
  if (seats.length === 0) return { ok: false, reason: 'unconfigured' };

  const fetchImpl = options?.fetchImpl ?? fetch;
  const timeoutMs = options?.timeoutMs ?? 12_000;
  let last: CoachLlmResult = { ok: false, reason: 'unconfigured' };

  for (const seat of seats) {
    if (seat.id === 'openai-compatible') {
      const coach = readCoachLlmEnv(env);
      last = await fetchCoachLlmCompletion(req, {
        env: { ...coach, apiUrl: seat.url, apiKey: seat.apiKey, model: seat.model },
        fetchImpl,
        timeoutMs,
      });
    } else {
      last = await fetchPlainCompletion(seat, req, fetchImpl, timeoutMs);
    }
    if (last.ok) {
      return { ...last, provider: seat.id, model: seat.model };
    }
  }
  return last;
}
