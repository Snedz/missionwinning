/**
 * Optional live line for the session trainer.
 * Groq when GROQ_API_KEY is set, else COACH_LLM_*, else OpenRouter `:free`.
 * Gemini free-tier hosts are never called — the prompt is health data.
 * Else the caller keeps the library line. The key never leaves the server.
 */

import { fetchCoachProviderCompletion, resolveCoachProviders } from '@/lib/coach/providerClient';
import type { LlmUsage } from '@/lib/llm/usage';
import {
  TRAINER_SYSTEM_PROMPT,
  readTrainerLine,
  trainerUserPrompt,
  type SessionTrainerFacts,
} from '@/lib/coach/sessionTrainer';

export type TrainerVoice = {
  source: 'library' | 'llm';
  model: string | null;
  line: string | null;
  usage?: LlmUsage;
};

type FetchLike = typeof fetch;

/** True when a non-Gemini coach seat is configured. Gemini keys do not count. */
export function coachProviderConfigured(
  env: Record<string, string | undefined> = process.env
): boolean {
  return resolveCoachProviders(env).length > 0;
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
  if (!coachProviderConfigured(env)) return library;

  const result = await fetchCoachProviderCompletion(
    {
      system: TRAINER_SYSTEM_PROMPT,
      user: trainerUserPrompt(facts),
      maxTokens: 120,
      temperature: 0.4,
    },
    { env, fetchImpl, timeoutMs: 8_000 }
  );
  if (!result.ok) return library;
  const line = readTrainerLine(result.content, facts);
  if (!line) return library;
  return {
    source: 'llm',
    model: result.model ?? null,
    line,
    usage: result.usage,
  };
}
