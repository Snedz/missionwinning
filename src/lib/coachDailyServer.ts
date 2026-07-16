import type { CoachInsight } from '@/lib/score';

export interface DailyCoachContext {
  readiness: number;
  strain: number;
  recovery: number;
  missionScore: number;
  streak: number;
  focusGroup: string;
  pillars: {
    moveFlows: number;
    mindSessions: number;
    proteinDays: number;
    trainDays: number;
  };
  fallback: CoachInsight;
}

export interface DailyCoachResponse {
  message: string;
  actionLabel: string;
  actionPath: string;
  source: 'llm' | 'rules';
}

export function buildCoachPrompt(ctx: DailyCoachContext): string {
  return [
    'You are Mission Winning coach — evidence-based, concise, motivating. No medical claims.',
    'One sentence insight (max 28 words) + suggest ONE next action from the app.',
    `Readiness ${ctx.readiness}/100, strain ${ctx.strain}/100, recovery ${ctx.recovery}/100.`,
    `Mission score ${ctx.missionScore}, training streak ${ctx.streak} days.`,
    `Focus muscle group: ${ctx.focusGroup}.`,
    `This week — train days ${ctx.pillars.trainDays}, protein days ${ctx.pillars.proteinDays}, move ${ctx.pillars.moveFlows}, mind ${ctx.pillars.mindSessions}.`,
    'Valid action paths: /active /nutrition /move /mind /track /learn /log /builder',
    'Reply JSON only: {"message":"...","actionLabel":"...","actionPath":"/..."}',
  ].join('\n');
}

const VALID_PATHS = new Set([
  '/active',
  '/nutrition',
  '/move',
  '/mind',
  '/track',
  '/learn',
  '/log',
  '/builder',
  '/history',
]);

export function parseCoachLlmJson(raw: string): DailyCoachResponse | null {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      message?: string;
      actionLabel?: string;
      actionPath?: string;
    };
    if (!parsed.message || !parsed.actionLabel || !parsed.actionPath) return null;
    if (!VALID_PATHS.has(parsed.actionPath)) return null;
    const message = parsed.message.trim().slice(0, 280);
    const actionLabel = parsed.actionLabel.trim().slice(0, 60);
    if (!message || !actionLabel) return null;
    return {
      message,
      actionLabel,
      actionPath: parsed.actionPath,
      source: 'llm',
    };
  } catch {
    return null;
  }
}

export function coachFromFallback(ctx: DailyCoachContext): DailyCoachResponse {
  const fb = ctx.fallback;
  return {
    message: fb.messageKey,
    actionLabel: fb.actionLabelKey,
    actionPath: fb.actionPath,
    source: 'rules',
  };
}

export async function fetchDailyCoachInsight(ctx: DailyCoachContext): Promise<DailyCoachResponse> {
  const { fetchCoachLlmCompletion } = await import('@/lib/coachLlmClient');
  const result = await fetchCoachLlmCompletion({
    system: 'Reply with valid JSON only.',
    user: buildCoachPrompt(ctx),
    maxTokens: 180,
    temperature: 0.6,
  });
  if (!result.ok) return coachFromFallback(ctx);
  const parsed = parseCoachLlmJson(result.content);
  return parsed ?? coachFromFallback(ctx);
}
