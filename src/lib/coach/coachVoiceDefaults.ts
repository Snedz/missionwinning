/**
 * English floors for rules-based coach plan voice keys.
 *
 * `planVoiceFromRules` returns i18n keys (`coachVoiceDefault`, …). CoachVoiceCard
 * used `defaultValue: voice.message` — the raw key on hydrate or missing pack.
 * Same defect class as coachWhyDefaults (`.642`/`.645`).
 */

export const COACH_VOICE_DEFAULTS: Record<string, string> = {
  coachVoiceDefault:
    'This week balances progressive overload with recovery. Hit each session with intent and log your sets.',
  coachVoiceDeload:
    'Strain is elevated — treat this as a consolidation week. Same movements, slightly lighter loads.',
  coachVoiceRecovery:
    'Readiness is lower — prioritize mobility and quality reps. Strength returns when you recover.',
  coachVoiceHighVolume:
    'A full training week ahead. Fuel well, sleep consistently, and trust the progression.',
};

/** Resolve rules voice copy — never paint a bare catalogued key. */
export function coachVoiceLine(
  key: string,
  t: (k: string, opts?: Record<string, unknown>) => string
): string {
  const floor = COACH_VOICE_DEFAULTS[key];
  if (floor) {
    return t(key, { defaultValue: floor });
  }
  const line = t(key, { defaultValue: '' });
  return line && line !== key ? line : '';
}
