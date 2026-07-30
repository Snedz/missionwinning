export interface PlanVoiceContext {
  plan: {
    weekStart: string;
    sessions: { name: string; kind: string; whyKeys: string[] }[];
  };
  readiness: number;
  strain: number;
  recovery: number;
}

export interface PlanVoiceResponse {
  message: string;
  source: 'llm' | 'rules';
  /** Token spend when source is 'llm' — threaded up for the route's meter. */
  usage?: import('@/lib/llm/usage').LlmUsage;
}

export function buildPlanVoicePrompt(ctx: PlanVoiceContext): string {
  const sessionSummary = ctx.plan.sessions
    .map((s) => `${s.name} (${s.kind})`)
    .join('; ');
  return [
    'You are Mission Winning coach — evidence-based, concise, motivating. No medical claims.',
    'Write exactly 2 sentences: commander intent for this training week (max 45 words total).',
    `Readiness ${ctx.readiness}/100, strain ${ctx.strain}/100, recovery ${ctx.recovery}/100.`,
    `Week sessions: ${sessionSummary}.`,
    'Reply JSON only: {"message":"..."}',
  ].join('\n');
}

export function parsePlanVoiceJson(raw: string): PlanVoiceResponse | null {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    const parsed = JSON.parse(raw.slice(start, end + 1)) as { message?: string };
    if (!parsed.message) return null;
    const message = parsed.message.trim().slice(0, 400);
    if (!message) return null;
    return { message, source: 'llm' };
  } catch {
    return null;
  }
}

export function planVoiceFromRules(ctx: PlanVoiceContext): PlanVoiceResponse {
  const whyKeys = ctx.plan.sessions.flatMap((s) => s.whyKeys);
  const hasDeload = whyKeys.some((k) => k === 'coachWhyDeload');
  const hasRecovery = ctx.plan.sessions.some((s) => s.kind === 'recovery');
  const strengthCount = ctx.plan.sessions.filter((s) => s.kind === 'strength').length;

  let messageKey = 'coachVoiceDefault';
  if (hasDeload || ctx.strain >= 70) messageKey = 'coachVoiceDeload';
  else if (hasRecovery || ctx.readiness < 40) messageKey = 'coachVoiceRecovery';
  else if (strengthCount >= 4) messageKey = 'coachVoiceHighVolume';

  return { message: messageKey, source: 'rules' };
}

export async function fetchPlanVoice(
  ctx: PlanVoiceContext,
  useLlm: boolean
): Promise<PlanVoiceResponse> {
  if (!useLlm) return planVoiceFromRules(ctx);

  const { fetchCoachLlmCompletion } = await import('@/lib/coachLlmClient');
  const result = await fetchCoachLlmCompletion({
    system: 'Reply with valid JSON only.',
    user: buildPlanVoicePrompt(ctx),
    maxTokens: 200,
    temperature: 0.6,
  });
  if (!result.ok) return planVoiceFromRules(ctx);
  const parsed = parsePlanVoiceJson(result.content);
  return parsed ? { ...parsed, usage: result.usage } : planVoiceFromRules(ctx);
}
