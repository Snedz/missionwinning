/**
 * Optional LLM voice for weekly Mission Debrief — mirrors planVoiceServer.
 */

export type DebriefVoiceContext = {
  focusKey: string;
  trainSessions: number;
  proteinDays: number;
  weightDelta?: number | null;
};

export type DebriefVoiceResponse = {
  message: string;
  source: 'llm' | 'rules';
};

export function debriefVoiceFromRules(ctx: DebriefVoiceContext): DebriefVoiceResponse {
  // Rules path returns the focus key for client i18n
  return { message: ctx.focusKey, source: 'rules' };
}

export function buildDebriefVoicePrompt(ctx: DebriefVoiceContext): string {
  return [
    'You are Mission Winning coach — concise, honest, no medical claims.',
    'Write exactly 2 short sentences (max 40 words) for a weekly debrief.',
    `Focus key: ${ctx.focusKey}. Sessions: ${ctx.trainSessions}. Protein days: ${ctx.proteinDays}.`,
    ctx.weightDelta != null ? `Weight delta week: ${ctx.weightDelta} kg.` : '',
    'Reply JSON only: {"message":"..."}',
  ]
    .filter(Boolean)
    .join('\n');
}

export function parseDebriefVoiceJson(raw: string): DebriefVoiceResponse | null {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    const parsed = JSON.parse(raw.slice(start, end + 1)) as { message?: string };
    const message = parsed.message?.trim().slice(0, 400);
    if (!message) return null;
    return { message, source: 'llm' };
  } catch {
    return null;
  }
}

export async function fetchDebriefVoice(
  ctx: DebriefVoiceContext,
  useLlm: boolean
): Promise<DebriefVoiceResponse> {
  if (!useLlm) return debriefVoiceFromRules(ctx);
  const { fetchCoachLlmCompletion } = await import('@/lib/coachLlmClient');
  const result = await fetchCoachLlmCompletion({
    system: 'Reply with valid JSON only.',
    user: buildDebriefVoicePrompt(ctx),
    maxTokens: 180,
    temperature: 0.5,
  });
  if (!result.ok) return debriefVoiceFromRules(ctx);
  return parseDebriefVoiceJson(result.content) ?? debriefVoiceFromRules(ctx);
}
