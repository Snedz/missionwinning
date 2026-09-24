/**
 * Optional live line for the session trainer.
 * Free model: Gemini Flash (`gemini-2.5-flash`) when GEMINI_API_KEY
 * or GOOGLE_GENERATIVE_AI_API_KEY is set. Else the configured COACH_LLM.
 * Else the caller keeps the library line. The key never leaves the server.
 */

import {
  DEFAULT_COACH_LLM_MODEL,
  fetchCoachLlmCompletion,
  readCoachLlmEnv,
} from '@/lib/coachLlmClient';
import { estimateLlmUsage, type LlmUsage } from '@/lib/llm/usage';
import {
  TRAINER_SYSTEM_PROMPT,
  readTrainerLine,
  trainerUserPrompt,
  type SessionTrainerFacts,
} from '@/lib/coach/sessionTrainer';

/** Google AI Studio free-tier Flash. Override with GEMINI_MODEL (gemini-* only). */
export const FREE_SESSION_TRAINER_MODEL = 'gemini-2.5-flash';

const GEMINI_HOST = 'https://generativelanguage.googleapis.com';

export type TrainerVoice = {
  source: 'library' | 'llm';
  model: string | null;
  line: string | null;
  usage?: LlmUsage;
};

export function readGeminiApiKey(
  env: Record<string, string | undefined> = process.env
): string | undefined {
  const key = env.GEMINI_API_KEY?.trim() || env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  return key || undefined;
}

export function readGeminiModel(
  env: Record<string, string | undefined> = process.env
): string {
  const raw = env.GEMINI_MODEL?.trim() ?? '';
  if (/^gemini-[\w.-]+$/.test(raw)) return raw;
  return FREE_SESSION_TRAINER_MODEL;
}

export function geminiGenerateUrl(model: string): string {
  return `${GEMINI_HOST}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
}

type FetchLike = typeof fetch;

function geminiUsage(meta: unknown, prompt: string, completion: string): LlmUsage {
  const m = meta as {
    promptTokenCount?: unknown;
    candidatesTokenCount?: unknown;
    totalTokenCount?: unknown;
  } | null;
  const promptTokens = typeof m?.promptTokenCount === 'number' ? m.promptTokenCount : null;
  const completionTokens = typeof m?.candidatesTokenCount === 'number' ? m.candidatesTokenCount : null;
  const totalTokens = typeof m?.totalTokenCount === 'number' ? m.totalTokenCount : null;
  if (promptTokens == null || completionTokens == null || totalTokens == null) {
    return estimateLlmUsage(prompt.length, completion.length);
  }
  return {
    promptTokens,
    completionTokens,
    totalTokens,
    estimated: false,
  };
}

async function fetchGeminiTrainerLine(
  facts: SessionTrainerFacts,
  env: Record<string, string | undefined>,
  fetchImpl: FetchLike
): Promise<TrainerVoice | null> {
  const apiKey = readGeminiApiKey(env);
  if (!apiKey) return null;
  const model = readGeminiModel(env);
  const user = trainerUserPrompt(facts);
  let res: Response;
  try {
    res = await fetchImpl(geminiGenerateUrl(model), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: TRAINER_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 120, temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: unknown;
  } | null;
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
  if (!text) return null;
  const line = readTrainerLine(text, facts);
  if (!line) return null;
  return {
    source: 'llm',
    model,
    line,
    usage: geminiUsage(data?.usageMetadata, `${TRAINER_SYSTEM_PROMPT}\n${user}`, line),
  };
}

export async function voiceSessionTrainer(
  facts: SessionTrainerFacts,
  options?: {
    useLlm?: boolean;
    env?: Record<string, string | undefined>;
    fetchImpl?: FetchLike;
  }
): Promise<TrainerVoice> {
  const library: TrainerVoice = { source: 'library', model: null, line: null };
  if (!options?.useLlm) return library;
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;

  const gemini = await fetchGeminiTrainerLine(facts, env, fetchImpl);
  if (gemini) return gemini;

  const coach = readCoachLlmEnv(env);
  if (!coach.apiUrl || !coach.apiKey) return library;
  const result = await fetchCoachLlmCompletion(
    {
      system: TRAINER_SYSTEM_PROMPT,
      user: trainerUserPrompt(facts),
      maxTokens: 120,
      temperature: 0.4,
    },
    { env: coach, fetchImpl, timeoutMs: 8_000 }
  );
  if (!result.ok) return library;
  const line = readTrainerLine(result.content, facts);
  if (!line) return library;
  return {
    source: 'llm',
    model: coach.model?.trim() || DEFAULT_COACH_LLM_MODEL,
    line,
    usage: result.usage,
  };
}
