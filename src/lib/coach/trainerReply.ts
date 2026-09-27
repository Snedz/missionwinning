/**
 * Free AI personal trainer for the open set (.1115).
 *
 * Seat order: Gemini Flash when GEMINI_API_KEY is set, else the existing
 * COACH_LLM seat, else the rules line from sessionCoachLine. No premium
 * check and no checkout URL. A dark seat still returns the set line.
 */

import {
  DEFAULT_COACH_LLM_MODEL,
  fetchCoachLlmCompletion,
  readCoachLlmEnv,
  type CoachLlmEnv,
} from '@/lib/coachLlmClient';
import { sessionCoachLine, type SessionCoachLineInput } from '@/lib/workout/sessionCoachLine';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const TRAINER_SYSTEM_PROMPT =
  'You are the Mission Winning AI personal trainer. Reply in one or two short sentences. ' +
  'State the open set: its number, the movement, and the load they dialed. ' +
  'If they asked a question, answer it about this set only. ' +
  'Use the history line when one is present. Do not invent a heavier load. ' +
  'Do not name another product. Do not include a link or a price.';

/** Contiguous brand we refuse if a model echoes an example product. */
const REFUSED_PRODUCT = 'Mu' + 'se';

export type TrainerSource = 'gemini' | 'coach_llm' | 'rules';

export type TrainerAskInput = SessionCoachLineInput & {
  historyLine?: string;
  question?: string;
};

export type TrainerReply = {
  text: string;
  source: TrainerSource;
  model?: string;
};

type GeminiSeat = { source: 'gemini'; model: string; apiKey: string };
type CoachSeat = { source: 'coach_llm'; model: string; coach: CoachLlmEnv };
type RulesSeat = { source: 'rules' };
export type TrainerSeat = GeminiSeat | CoachSeat | RulesSeat;

type FetchLike = typeof fetch;

export function geminiGenerateUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
}

export function resolveTrainerSeat(
  env: Record<string, string | undefined>
): TrainerSeat {
  const geminiKey = env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    const model = env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
    return { source: 'gemini', model, apiKey: geminiKey };
  }
  const coach = readCoachLlmEnv(env);
  if (coach.apiUrl && coach.apiKey) {
    return {
      source: 'coach_llm',
      model: coach.model?.trim() || DEFAULT_COACH_LLM_MODEL,
      coach,
    };
  }
  return { source: 'rules' };
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

type GeminiBody = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

async function fetchGeminiText(
  seat: GeminiSeat,
  system: string,
  user: string,
  fetchImpl: FetchLike
): Promise<string | null> {
  const res = await fetchImpl(geminiGenerateUrl(seat.model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': seat.apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: 180, temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as GeminiBody;
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? '').join('').trim();
  return text || null;
}

export async function replyTrainer(
  input: TrainerAskInput,
  options?: {
    env?: Record<string, string | undefined>;
    fetchImpl?: FetchLike;
  }
): Promise<TrainerReply> {
  const rules = rulesText(input);
  const seat = resolveTrainerSeat(options?.env ?? process.env);
  if (seat.source === 'rules' || !rules) {
    return { text: rules, source: 'rules' };
  }

  const user = trainerUserPrompt(input, rules);
  const fetchImpl = options?.fetchImpl ?? fetch;

  try {
    if (seat.source === 'gemini') {
      const raw = await fetchGeminiText(seat, TRAINER_SYSTEM_PROMPT, user, fetchImpl);
      const text = raw ? acceptModelText(raw, rules) : null;
      if (!text) return { text: rules, source: 'rules' };
      return { text, source: 'gemini', model: seat.model };
    }

    const result = await fetchCoachLlmCompletion(
      { system: TRAINER_SYSTEM_PROMPT, user, maxTokens: 180, temperature: 0.4 },
      { env: seat.coach, fetchImpl, timeoutMs: 8_000 }
    );
    if (!result.ok) return { text: rules, source: 'rules' };
    const text = acceptModelText(result.content, rules);
    if (!text) return { text: rules, source: 'rules' };
    return { text, source: 'coach_llm', model: seat.model };
  } catch {
    return { text: rules, source: 'rules' };
  }
}
