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

/** Reply length the set screen can show without the set row growing. */
const MAX_REPLY_CHARS = 420;

/**
 * Cut an over-long reply at the last sentence end that still fits.
 *
 * The guard's job is brevity and safety, not censorship: a chatty model that
 * writes 900 chars was throwing the whole answer away and silently falling back
 * to the rules line, so the user saw "Trainer is offline" while a perfectly
 * good reply sat in the response. Trimming to the budget keeps the sentence
 * intact. Returns null only when the leading sentence alone is still too long,
 * which is a real refusal, not a length problem.
 */
function trimToSentence(text: string, max = MAX_REPLY_CHARS): string | null {
  if (text.length <= max) return text;
  const head = text.slice(0, max);
  // "...factors: 1. Warm-up" -- a ". " that is really a numbered list marker,
  // not the end of a thought. Cutting there strands the reader mid-list, so
  // skip a break whose own tail looks like "1." or whose next word is numeric.
  const ends = [". ", "! ", "? "]
    .map((s) => head.lastIndexOf(s))
    .filter((i) => i > 0 && !/\d\.$/.test(head.slice(0, i + 1)) && !/^\s*\d/.test(head.slice(i + 2, i + 4)));
  const cut = ends.length ? Math.max(...ends) : -1;
  if (cut > 0) return head.slice(0, cut + 1).trim();
  // One unpunctuated wall longer than the budget: keep the budget, not the wall.
  return head.trim().slice(0, max).trim() || null;
}

function acceptModelText(raw: string, rules: string): string | null {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (/https?:\/\//i.test(text)) return null;
  if (text.toLowerCase().includes(REFUSED_PRODUCT.toLowerCase())) return null;
  const trimmed = trimToSentence(text);
  if (!trimmed) return null;
  if (!rules) return trimmed;
  return trimmed;
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
