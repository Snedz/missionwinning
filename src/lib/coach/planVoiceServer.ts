import type { BodyScores } from '@/lib/score';

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

  const apiUrl = process.env.COACH_LLM_API_URL;
  const apiKey = process.env.COACH_LLM_API_KEY;
  if (!apiUrl || !apiKey) return planVoiceFromRules(ctx);

  const model = process.env.COACH_LLM_MODEL || 'gpt-4o-mini';
  const body = {
    model,
    messages: [
      { role: 'system', content: 'Reply with valid JSON only.' },
      { role: 'user', content: buildPlanVoicePrompt(ctx) },
    ],
    max_tokens: 200,
    temperature: 0.6,
  };

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return planVoiceFromRules(ctx);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return planVoiceFromRules(ctx);
    const parsed = parsePlanVoiceJson(content);
    return parsed ?? planVoiceFromRules(ctx);
  } catch {
    return planVoiceFromRules(ctx);
  }
}
