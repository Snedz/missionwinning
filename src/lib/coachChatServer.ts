/**
 * Premium coach chat — ZDR one-shot LLM, no rules fallback.
 * Transcript is rolled into the user prompt (privacy: never logged here).
 */

import { EXERCISES } from '@/data/exercises';
import { EXERCISE_PUBLIC_ENRICHMENT } from '@/data/exercisePublicEnrichment';
import { withPublicDepth } from '@/lib/exerciseDepthDefaults';
import { VALID_PATHS } from '@/lib/coachDailyServer';
import { fetchCoachLlmCompletion } from '@/lib/coachLlmClient';

export type CoachChatTurn = { role: 'user' | 'coach'; content: string };

export type CoachChatContext = {
  readiness: number;
  strain: number;
  recovery: number;
  trainDays14: number;
  todaySession?: {
    name: string;
    kind: string;
    estMinutes: number;
    exercises: { id: string; name: string }[];
  };
  exerciseId?: string;
};

export type CoachChatOk = {
  ok: true;
  message: string;
  actionLabel?: string;
  actionPath?: string;
  source: 'llm';
  grounded: boolean;
};

export type CoachChatFail = {
  ok: false;
  reason: 'unconfigured' | 'unavailable' | 'parse';
};

const MAX_TURNS = 12;
const MAX_TURN_CHARS = 500;
const MAX_MESSAGE = 600;

export function detectExerciseFromMessage(
  message: string,
  explicitId?: string
): string | null {
  if (explicitId && EXERCISES.some((e) => e.id === explicitId)) return explicitId;
  const lower = message.toLowerCase();
  const ranked = [...EXERCISES].sort((a, b) => b.name.length - a.name.length);
  for (const ex of ranked) {
    if (ex.name.length < 4) continue;
    if (lower.includes(ex.name.toLowerCase())) return ex.id;
  }
  return null;
}

function groundingBlock(exerciseId: string): string {
  const ex = EXERCISES.find((e) => e.id === exerciseId);
  if (!ex) return '';
  const depth = withPublicDepth(ex, EXERCISE_PUBLIC_ENRICHMENT[exerciseId]);
  const steps = (depth.steps ?? []).slice(0, 4).join(' | ');
  const mistakes = (depth.mistakes ?? []).slice(0, 3).join(' | ');
  return [
    `Grounding exercise: ${ex.name} (${exerciseId}).`,
    steps ? `Steps: ${steps}` : '',
    mistakes ? `Common mistakes: ${mistakes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildChatSystemPrompt(ctx: CoachChatContext, groundedId: string | null): string {
  const sessionLine = ctx.todaySession
    ? `Today: ${ctx.todaySession.name} (${ctx.todaySession.kind}, ~${ctx.todaySession.estMinutes} min) — ${ctx.todaySession.exercises
        .slice(0, 8)
        .map((e) => e.name)
        .join(', ')}.`
    : 'Today: no planned coach session.';
  const ground = groundedId ? groundingBlock(groundedId) : '';
  return [
    'You are Mission Winning coach — evidence-based, concise, mission-briefing tone.',
    'Scope: training, nutrition habits, recovery, and form cues only.',
    'Never diagnose medical conditions. If user reports pain/injury, advise seeing a qualified professional and keep form general.',
    'Answer in ≤120 words. Reply JSON only: {"message":"...","actionLabel":"...","actionPath":"/..."}',
    'actionPath must be one of: /active /nutrition /move /mind /track /learn /log /builder /history (omit action if none).',
    `Readiness ${ctx.readiness}/100, strain ${ctx.strain}/100, recovery ${ctx.recovery}/100, train days last 14: ${ctx.trainDays14}.`,
    sessionLine,
    ground,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildChatUserPrompt(turns: CoachChatTurn[], message: string): string {
  const clipped = turns.slice(-MAX_TURNS).map((t) => ({
    role: t.role,
    content: t.content.slice(0, MAX_TURN_CHARS),
  }));
  const transcript = clipped
    .map((t) => `${t.role === 'user' ? 'User' : 'Coach'}: ${t.content}`)
    .join('\n');
  const parts = [
    transcript ? `Prior turns:\n${transcript}` : '',
    `User: ${message.slice(0, 1000)}`,
  ].filter(Boolean);
  return parts.join('\n\n');
}

export function parseCoachChatJson(raw: string): {
  message: string;
  actionLabel?: string;
  actionPath?: string;
} | null {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      message?: string;
      actionLabel?: string;
      actionPath?: string;
    };
    if (!parsed.message) return null;
    const message = parsed.message.trim().slice(0, MAX_MESSAGE);
    if (!message) return null;
    let actionLabel = parsed.actionLabel?.trim().slice(0, 60);
    let actionPath = parsed.actionPath?.trim();
    if (actionPath && !VALID_PATHS.has(actionPath)) {
      actionPath = undefined;
      actionLabel = undefined;
    }
    return { message, actionLabel, actionPath };
  } catch {
    return null;
  }
}

export async function fetchCoachChat(
  ctx: CoachChatContext,
  turns: CoachChatTurn[],
  message: string
): Promise<CoachChatOk | CoachChatFail> {
  const groundedId = detectExerciseFromMessage(message, ctx.exerciseId);
  const system = buildChatSystemPrompt(ctx, groundedId);
  const user = buildChatUserPrompt(turns, message);
  const result = await fetchCoachLlmCompletion({
    system,
    user,
    maxTokens: 350,
    temperature: 0.5,
  });
  if (!result.ok) {
    if (result.reason === 'unconfigured' || result.reason === 'zdr_inactive') {
      return { ok: false, reason: 'unconfigured' };
    }
    return { ok: false, reason: 'unavailable' };
  }
  const parsed = parseCoachChatJson(result.content);
  if (!parsed) return { ok: false, reason: 'parse' };
  return {
    ok: true,
    message: parsed.message,
    actionLabel: parsed.actionLabel,
    actionPath: parsed.actionPath,
    source: 'llm',
    grounded: Boolean(groundedId),
  };
}
