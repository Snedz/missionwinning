/** Prefer Mission Coach on victory for the first N completed workouts (wedge habit). */
export const COACH_VICTORY_EARLY_WORKOUTS = 3;

export type VictoryNextAction = {
  /** Native route name or web path */
  href: string;
  labelKey: string;
  defaultLabel: string;
  reasonKey: string;
  defaultReason: string;
};

export type PickVictoryNextActionOpts = {
  proteinLoggedToday?: boolean;
  strainDelta?: number;
  completedWorkouts?: number;
  hasCoachPlan?: boolean;
};

/**
 * One boss next step after a session.
 * Early / no-plan: Mission Coach (Train+Coach wedge).
 */
export function pickVictoryNextAction(opts?: PickVictoryNextActionOpts): VictoryNextAction {
  const coachFirst =
    (typeof opts?.completedWorkouts === 'number' &&
      opts.completedWorkouts > 0 &&
      opts.completedWorkouts <= COACH_VICTORY_EARLY_WORKOUTS) ||
    opts?.hasCoachPlan === false;

  if (coachFirst) {
    return {
      href: '/coach',
      labelKey: 'victoryNextCoachLabel',
      defaultLabel: 'See Mission Coach',
      reasonKey: 'victoryNextCoachReason',
      defaultReason: 'Coach adapts your week from this log — no wearable needed.',
    };
  }

  if (!opts?.proteinLoggedToday) {
    return {
      href: '/bundle',
      labelKey: 'coachActionLogNutrition',
      defaultLabel: 'Log protein (web)',
      reasonKey: 'victoryNextFuelReason',
      defaultReason: 'Fuel depth lives on web for now — open Bundle or continue on Coach.',
    };
  }
  if ((opts.strainDelta ?? 0) >= 5) {
    return {
      href: '/today',
      labelKey: 'coachActionOpenMind',
      defaultLabel: 'Back to Today',
      reasonKey: 'victoryNextMindReason',
      defaultReason: 'Downshift strain — Mind flows are on web; rest and return tomorrow.',
    };
  }
  return {
    href: '/today',
    labelKey: 'coachActionOpenMove',
    defaultLabel: 'Back to Today',
    reasonKey: 'victoryNextMoveReason',
    defaultReason: 'Mobility depth is on web — keep logging; Coach has your week.',
  };
}
