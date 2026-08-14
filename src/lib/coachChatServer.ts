/**
 * Premium coach chat — ZDR one-shot LLM, no rules fallback.
 * Transcript is rolled into the user prompt (privacy: never logged here).
 */

import { EXERCISES } from '@/data/exercises';
import { EXERCISE_PUBLIC_ENRICHMENT } from '@/data/exercisePublicEnrichment';
import { withPublicDepth } from '@/lib/exerciseDepthDefaults';
import { VALID_PATHS } from '@/lib/coachDailyServer';
import { fetchCoachLlmCompletion } from '@/lib/coachLlmClient';
import { buildCoachKnowledgeCorpus } from '@/lib/coach/agent/corpus';
import { retrieveCoachKnowledge } from '@/lib/coach/agent/retrieve';
import { runCoachReactLoop, type CoachReactMode } from '@/lib/coach/agent/react';
import type {
  CoachAgentWorld,
  CoachCompleteFn,
  CoachLoadZoneFact,
  CoachLogFact,
  CoachWeekSessionFact,
} from '@/lib/coach/agent/types';

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
  /** Compact citations — never raw workout logs. */
  logFacts?: CoachLogFact[];
  weekSessions?: CoachWeekSessionFact[];
  loadZone?: CoachLoadZoneFact;
};

export type CoachChatOk = {
  ok: true;
  message: string;
  actionLabel?: string;
  actionPath?: string;
  source: 'llm';
  grounded: boolean;
  /** Token spend for this call — threaded up so the route can meter it. */
  usage?: import('@/lib/llm/usage').LlmUsage;
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

export function buildChatSystemPrompt(
  ctx: CoachChatContext,
  groundedId: string | null,
  mode: 'json' | 'plain' = 'json'
): string {
  const sessionLine = ctx.todaySession
    ? `Today: ${ctx.todaySession.name} (${ctx.todaySession.kind}, ~${ctx.todaySession.estMinutes} min) — ${ctx.todaySession.exercises
        .slice(0, 8)
        .map((e) => e.name)
        .join(', ')}.`
    : 'Today: no planned coach session.';
  const ground = groundedId ? groundingBlock(groundedId) : '';
  const format =
    mode === 'plain'
      ? 'Answer in ≤120 words. Plain text only — no JSON, no markdown fences, no action links.'
      : 'Answer in ≤120 words. Reply JSON only: {"message":"...","actionLabel":"...","actionPath":"/..."}';
  const actionLine =
    mode === 'json'
      ? 'actionPath must be one of: /active /nutrition /move /mind /track /learn /log /builder /history (omit action if none).'
      : '';
  return [
    'You are Mission Winning coach — evidence-based, concise, mission-briefing tone.',
    'Scope: training, nutrition habits, recovery, and form cues only.',
    'Never diagnose medical conditions or mental illnesses. Never claim exercise treats or cures depression. If user reports pain/injury or crisis, advise seeing a qualified professional and keep guidance general.',
    'You may note that consistent training often supports energy and mood — frame as educational fitness habits, not clinical care.',
    format,
    actionLine,
    `Readiness ${ctx.readiness}/100, strain ${ctx.strain}/100, recovery ${ctx.recovery}/100, train days last 14: ${ctx.trainDays14}.`,
    sessionLine,
    ground,
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatCoachChatTranscript(turns: CoachChatTurn[]): string {
  return turns
    .slice(-MAX_TURNS)
    .map((t) => `${t.role === 'user' ? 'User' : 'Coach'}: ${t.content.slice(0, MAX_TURN_CHARS)}`)
    .join('\n');
}

export function buildChatUserPrompt(turns: CoachChatTurn[], message: string): string {
  const transcript = formatCoachChatTranscript(turns);
  const parts = [
    transcript ? `Prior turns:\n${transcript}` : '',
    `User: ${message.slice(0, 1000)}`,
  ].filter(Boolean);
  return parts.join('\n\n');
}

export function buildCoachAgentWorld(ctx: CoachChatContext): CoachAgentWorld {
  return {
    logFacts: ctx.logFacts ?? [],
    weekSessions: ctx.weekSessions ?? [],
    loadZone: ctx.loadZone ?? 'unknown',
    trainDays14: ctx.trainDays14,
    todaySession: ctx.todaySession,
    documents: buildCoachKnowledgeCorpus(),
  };
}

function llmComplete(): CoachCompleteFn {
  return async (req) => {
    const result = await fetchCoachLlmCompletion({
      system: req.system,
      user: req.user,
      maxTokens: req.maxTokens,
      temperature: req.temperature,
    });
    if (!result.ok) return result;
    return { ok: true, content: result.content, usage: result.usage };
  };
}

async function runChatAgent(
  ctx: CoachChatContext,
  turns: CoachChatTurn[],
  message: string,
  mode: CoachReactMode,
  signal?: AbortSignal
) {
  const world = buildCoachAgentWorld(ctx);
  const hits = retrieveCoachKnowledge(message, world.documents ?? [], { k: 5 });
  return runCoachReactLoop({
    complete: llmComplete(),
    world,
    hits,
    transcript: formatCoachChatTranscript(turns),
    message,
    mode,
    signal,
  });
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
  const agent = await runChatAgent(ctx, turns, message, 'json');
  if (!agent.ok) {
    if (agent.reason === 'unconfigured') return { ok: false, reason: 'unconfigured' };
    if (agent.reason === 'empty') return { ok: false, reason: 'parse' };
    return { ok: false, reason: 'unavailable' };
  }
  const parsed = parseCoachChatJson(agent.message);
  const messageText = (parsed?.message ?? agent.message).trim().slice(0, MAX_MESSAGE);
  if (!messageText) return { ok: false, reason: 'parse' };
  return {
    ok: true,
    message: messageText,
    actionLabel: parsed?.actionLabel,
    actionPath: parsed?.actionPath,
    source: 'llm',
    grounded: Boolean(groundedId) || agent.usedTools || Boolean(ctx.logFacts?.length),
    usage: agent.usage,
  };
}

/**
 * Streaming coach chat — plain-text deltas for word-by-word UI.
 * Caller owns the ReadableStream / HTTP framing.
 */
export async function* streamCoachChat(
  ctx: CoachChatContext,
  turns: CoachChatTurn[],
  message: string,
  signal?: AbortSignal
): AsyncGenerator<
  string,
  { ok: true; grounded: boolean; usage?: import('@/lib/llm/usage').LlmUsage } | CoachChatFail,
  void
> {
  const groundedId = detectExerciseFromMessage(message, ctx.exerciseId);
  const agent = await runChatAgent(ctx, turns, message, 'plain', signal);
  if (!agent.ok) {
    if (agent.reason === 'unconfigured') return { ok: false, reason: 'unconfigured' };
    return { ok: false, reason: 'unavailable' };
  }
  yield agent.message;
  return {
    ok: true,
    grounded: Boolean(groundedId) || agent.usedTools || Boolean(ctx.logFacts?.length),
    usage: agent.usage,
  };
}
