/**
 * Free AI personal trainer for the open set (.1115, provider chain .1134).
 *
 * Seat order: Groq when GROQ_API_KEY is set, else any OpenAI-compatible
 * COACH_LLM_* endpoint, else OpenRouter `:free`, else the rules line.
 * Gemini free-tier hosts are never called. No premium check and no checkout
 * URL. A dark seat still returns the set line.
 */

import {
  fetchCoachProviderCompletion,
  resolveCoachProviders,
  type CoachProviderId,
} from '@/lib/coach/providerClient';
import { sessionCoachLine, type SessionCoachLineInput } from '@/lib/workout/sessionCoachLine';
import { resolveSafetyTrainGuidance } from '@/lib/safetyTrainGuidance';

export const TRAINER_SYSTEM_PROMPT =
  'You are the Mission Winning AI personal trainer. Reply in one or two short sentences. ' +
  'State the open set: its number, the movement, and the load they dialed. ' +
  'If they asked a question, answer it about this set only. ' +
  'Use the history line when one is present. Do not invent a heavier load. ' +
  'Do not name another product. Do not include a link or a price.';

/** Contiguous brand we refuse if a model echoes an example product. */
const REFUSED_PRODUCT = 'Mu' + 'se';

export type TrainerSource = 'groq' | 'openrouter' | 'coach_llm' | 'rules';

export type TrainerAskInput = SessionCoachLineInput & {
  historyLine?: string;
  question?: string;
};

export type TrainerReply = {
  text: string;
  source: TrainerSource;
  model?: string;
};

type ModelSeat = { source: Exclude<TrainerSource, 'rules'>; model: string };
type RulesSeat = { source: 'rules' };
export type TrainerSeat = ModelSeat | RulesSeat;

type FetchLike = typeof fetch;

function sourceFor(id: CoachProviderId | undefined): Exclude<TrainerSource, 'rules'> {
  if (id === 'groq' || id === 'openrouter') return id;
  return 'coach_llm';
}

export function resolveTrainerSeat(
  env: Record<string, string | undefined>
): TrainerSeat {
  const seat = resolveCoachProviders(env)[0];
  if (!seat) return { source: 'rules' };
  return { source: sourceFor(seat.id), model: seat.model };
}

function rulesText(input: TrainerAskInput): string {
  return sessionCoachLine(input) ?? '';
}

function scrub(raw: string | undefined, max: number): string {
  return (raw ?? '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function trainerUserPrompt(input: TrainerAskInput, rules: string): string {
  const history = scrub(input.historyLine, 160) || 'none';
  const question = scrub(input.question, 280) || 'What should I do on this set?';
  return `Open set: ${rules}\nHistory: ${history}\nQuestion: ${question}`;
}

function acceptModelText(raw: string, rules: string): string | null {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (!text || text.length > 420) return null;
  if (/https?:\/\//i.test(text)) return null;
  if (text.toLowerCase().includes(REFUSED_PRODUCT.toLowerCase())) return null;
  if (!rules) return text;
  return text;
}

export async function replyTrainer(
  input: TrainerAskInput,
  options?: {
    env?: Record<string, string | undefined>;
    fetchImpl?: FetchLike;
  }
): Promise<TrainerReply> {
  const reported = resolveSafetyTrainGuidance({ reportText: input.question });
  if (reported.mode !== 'clear' && reported.copy) {
    return { text: reported.copy, source: 'rules' };
  }
  const rules = rulesText(input);
  const seat = resolveTrainerSeat(options?.env ?? process.env);
  if (seat.source === 'rules' || !rules) {
    return { text: rules, source: 'rules' };
  }

  const user = trainerUserPrompt(input, rules);
  const fetchImpl = options?.fetchImpl ?? fetch;
  const env = options?.env ?? process.env;

  try {
    const result = await fetchCoachProviderCompletion(
      { system: TRAINER_SYSTEM_PROMPT, user, maxTokens: 180, temperature: 0.4 },
      { env, fetchImpl, timeoutMs: 8_000 }
    );
    if (!result.ok) return { text: rules, source: 'rules' };
    const text = acceptModelText(result.content, rules);
    if (!text) return { text: rules, source: 'rules' };
    return { text, source: sourceFor(result.provider), model: result.model ?? seat.model };
  } catch {
    return { text: rules, source: 'rules' };
  }
}
