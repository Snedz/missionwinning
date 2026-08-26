/**
 * ReAct loop for premium coach chat.
 *
 * Each turn is a ZDR-safe one-shot chat completion (full prompt, no
 * stored conversation id, no Files). The model either calls a local tool or
 * returns Final. Cap is two tool rounds so a confused completion cannot
 * spend the daily quota on a loop.
 */

import { formatCoachLogFactCite } from '@/lib/coach/agent/facts';
import { formatRetrievalBlock } from '@/lib/coach/agent/retrieve';
import { COACH_AGENT_TOOLS, dispatchCoachTool, formatToolCatalog } from '@/lib/coach/agent/tools';
import type {
  CoachAgentWorld,
  CoachCompleteFn,
  CoachReactParse,
  CoachReactStep,
  CoachRetrievalHit,
} from '@/lib/coach/agent/types';
import type { LlmUsage } from '@/lib/llm/usage';
import { sumLlmUsage } from '@/lib/llm/usage';

export const COACH_REACT_MAX_TOOL_ROUNDS = 2;

export type CoachReactMode = 'json' | 'plain';

export type CoachReactOk = {
  ok: true;
  message: string;
  steps: CoachReactStep[];
  usage?: LlmUsage;
  usedTools: boolean;
};

export type CoachReactFail = {
  ok: false;
  reason: 'unconfigured' | 'unavailable' | 'empty';
  steps: CoachReactStep[];
  usage?: LlmUsage;
};

const ACTION_RE = /Action\s*:\s*([a-z0-9_]+)/i;
const INPUT_RE = /Action\s*Input\s*:\s*([\s\S]+)/i;
const THOUGHT_RE = /Thought\s*:\s*([^\n]+)/i;
const FINAL_RE = /Final\s*:\s*([\s\S]+)/i;

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function parseCoachReact(raw: string): CoachReactParse {
  const text = raw.trim();
  const asJson = parseJsonObject(text);
  if (asJson) {
    if (typeof asJson.final === 'string' && asJson.final.trim()) {
      return {
        kind: 'final',
        thought: typeof asJson.thought === 'string' ? asJson.thought : undefined,
        text: asJson.final.trim(),
      };
    }
    if (typeof asJson.message === 'string' && asJson.message.trim()) {
      // Keep the JSON object so fetchCoachChat can still read actionPath.
      return { kind: 'final', text };
    }
    if (typeof asJson.action === 'string' && asJson.action.trim()) {
      const input =
        asJson.action_input && typeof asJson.action_input === 'object' && !Array.isArray(asJson.action_input)
          ? (asJson.action_input as Record<string, unknown>)
          : asJson.input && typeof asJson.input === 'object' && !Array.isArray(asJson.input)
            ? (asJson.input as Record<string, unknown>)
            : {};
      return {
        kind: 'action',
        thought: typeof asJson.thought === 'string' ? asJson.thought : undefined,
        name: asJson.action.trim(),
        input,
      };
    }
  }

  const actionMatch = text.match(ACTION_RE);
  const finalMatch = text.match(FINAL_RE);
  const thought = text.match(THOUGHT_RE)?.[1]?.trim();

  if (actionMatch && !/^final$/i.test(actionMatch[1] ?? '')) {
    const inputRaw = text.match(INPUT_RE)?.[1]?.trim() ?? '{}';
    const firstLine = inputRaw.split(/\n(?=Final:|Thought:)/i)[0] ?? '{}';
    const input = parseJsonObject(firstLine) ?? {};
    return { kind: 'action', thought, name: actionMatch[1]!.toLowerCase(), input };
  }

  if (finalMatch) {
    return { kind: 'final', thought, text: finalMatch[1]!.trim() };
  }

  return { kind: 'final', thought, text };
}

export function buildCoachReactSystemPrompt(
  mode: CoachReactMode,
  hits: readonly CoachRetrievalHit[]
): string {
  const format =
    mode === 'plain'
      ? 'When you can answer, write Final: then ≤120 words of plain text. No JSON, no markdown fences, no action links.'
      : 'When you can answer, write Final: then a JSON object only: {"message":"...","actionLabel":"...","actionPath":"/..."}.';
  return [
    'You are Mission Winning coach — evidence-based, concise, mission-briefing tone.',
    'Scope: training, nutrition habits, recovery, and form cues only.',
    'Never diagnose medical conditions or mental illnesses. Never claim exercise treats or cures depression. If the user reports pain/injury or crisis, advise a qualified professional and keep guidance general.',
    'Quote retrieved notes and log facts. Never invent a set, a weight, or a date.',
    'Load band is descriptive, not an injury prediction.',
    format,
    mode === 'json'
      ? 'actionPath must be one of: /active /nutrition /move /mind /track /learn /log /builder /history (omit action if none).'
      : '',
    'You may call at most one tool per turn using exactly:',
    'Thought: why this tool',
    'Action: tool_name',
    'Action Input: {"arg":"value"}',
    'Tools:',
    formatToolCatalog(COACH_AGENT_TOOLS),
    formatRetrievalBlock(hits),
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildCoachReactUserPrompt(params: {
  world: CoachAgentWorld;
  transcript: string;
  message: string;
  steps: readonly CoachReactStep[];
  forceFinal?: boolean;
}): string {
  const { world, transcript, message, steps, forceFinal } = params;
  const facts =
    world.logFacts.length > 0
      ? world.logFacts
          .slice(0, 6)
          .map((f) => formatCoachLogFactCite(f))
          .join('; ')
      : 'none';
  const week =
    world.weekSessions.length > 0
      ? world.weekSessions.map((s) => `${s.name} (${s.status})`).join('; ')
      : 'none';
  const session = world.todaySession
    ? `${world.todaySession.name} (${world.todaySession.kind}, ~${world.todaySession.estMinutes} min)`
    : 'no planned session';
  const trail = steps
    .map((s) => {
      if (s.action) {
        return `Thought: ${s.thought ?? ''}\nAction: ${s.action}\nAction Input: ${JSON.stringify(s.input ?? {})}\nObservation: ${s.observation ?? ''}`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
  return [
    `Today: ${session}. Load band: ${world.loadZone}. Train days last 14: ${world.trainDays14}.`,
    `Log facts: ${facts}.`,
    `Week: ${week}.`,
    transcript ? `Prior turns:\n${transcript}` : '',
    `User: ${message.slice(0, 1000)}`,
    trail ? `Tool trail:\n${trail}` : '',
    forceFinal
      ? 'No more tools. Write Final: now from the observations and retrieved notes.'
      : 'Call a tool only if the retrieved notes and log facts are not enough.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export async function runCoachReactLoop(params: {
  complete: CoachCompleteFn;
  world: CoachAgentWorld;
  hits: readonly CoachRetrievalHit[];
  transcript: string;
  message: string;
  mode?: CoachReactMode;
  signal?: AbortSignal;
}): Promise<CoachReactOk | CoachReactFail> {
  const mode = params.mode ?? 'plain';
  const steps: CoachReactStep[] = [];
  let usage: LlmUsage | undefined;
  const system = buildCoachReactSystemPrompt(mode, params.hits);

  for (let round = 0; round <= COACH_REACT_MAX_TOOL_ROUNDS; round++) {
    if (params.signal?.aborted) {
      return { ok: false, reason: 'unavailable', steps, usage };
    }
    const forceFinal = round === COACH_REACT_MAX_TOOL_ROUNDS;
    const user = buildCoachReactUserPrompt({
      world: params.world,
      transcript: params.transcript,
      message: params.message,
      steps,
      forceFinal,
    });
    const result = await params.complete({
      system,
      user,
      maxTokens: forceFinal ? 350 : 220,
      temperature: 0.4,
    });
    if (!result.ok) {
      if (result.reason === 'unconfigured' || result.reason === 'zdr_inactive') {
        return { ok: false, reason: 'unconfigured', steps, usage };
      }
      return { ok: false, reason: 'unavailable', steps, usage };
    }
    usage = sumLlmUsage(usage, result.usage);
    const parsed = parseCoachReact(result.content);
    if (parsed.kind === 'final') {
      const message = parsed.text.trim();
      if (!message) return { ok: false, reason: 'empty', steps, usage };
      return { ok: true, message, steps, usage, usedTools: steps.some((s) => Boolean(s.action)) };
    }
    if (forceFinal) {
      return { ok: false, reason: 'empty', steps, usage };
    }
    const dispatched = dispatchCoachTool(parsed.name, parsed.input, params.world);
    steps.push({
      thought: parsed.thought,
      action: parsed.name,
      input: parsed.input,
      observation: dispatched.observation,
    });
  }

  return { ok: false, reason: 'empty', steps, usage };
}
