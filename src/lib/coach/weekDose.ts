import type { CoachPlan } from '@/lib/coach/types';

/** Plain-language “prescription” summary for Coach week view. */
export type WeekDoseSummary = {
  sessionCount: number;
  strengthCount: number;
  conditioningCount: number;
  recoveryCount: number;
  estMinutes: number;
  /** Dominant intent for copy: strength | mixed | recovery */
  intent: 'strength' | 'conditioning' | 'recovery' | 'mixed';
};

export function summarizeWeekDose(plan: CoachPlan): WeekDoseSummary {
  const sessions = plan.sessions;
  const sessionCount = sessions.length;
  const strengthCount = sessions.filter((s) => s.kind === 'strength').length;
  const conditioningCount = sessions.filter((s) => s.kind === 'conditioning').length;
  const recoveryCount = sessions.filter((s) => s.kind === 'recovery').length;
  const estMinutes = sessions.reduce((sum, s) => sum + (s.estMinutes || 0), 0);

  let intent: WeekDoseSummary['intent'] = 'mixed';
  if (strengthCount >= conditioningCount && strengthCount >= recoveryCount && strengthCount > 0) {
    intent = strengthCount === sessionCount ? 'strength' : 'mixed';
  } else if (
    conditioningCount >= strengthCount &&
    conditioningCount >= recoveryCount &&
    conditioningCount > 0
  ) {
    intent = conditioningCount === sessionCount ? 'conditioning' : 'mixed';
  } else if (recoveryCount > 0 && recoveryCount >= strengthCount && recoveryCount >= conditioningCount) {
    intent = recoveryCount === sessionCount ? 'recovery' : 'mixed';
  }

  return {
    sessionCount,
    strengthCount,
    conditioningCount,
    recoveryCount,
    estMinutes,
    intent,
  };
}
