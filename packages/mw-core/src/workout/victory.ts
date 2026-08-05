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
  /** Workouts completed including the session just finished. */
  completedWorkouts?: number;
  /** True when a Mission Coach plan is loaded for the user. */
  hasCoachPlan?: boolean;
};

/**
 * One boss next step after a session.
 * Prefer Mission Coach / next train — stay in the Train+Coach wedge (Horizon W).
 *
 * **Week-1 session 2 wins** over the early-Coach CTA. After exactly one log,
 * Today and First Steps already name "Start session 2" at `/active`. Victory
 * must not send that athlete to Coach — two next bosses for the same habit loop.
 *
 * Shared by web (`workoutVictory` re-exports) and Expo. Android Victory is
 * separate UI but should follow the same habit-loop order.
 */
export function pickVictoryNextAction(opts?: PickVictoryNextActionOpts): VictoryNextAction {
  const completed =
    typeof opts?.completedWorkouts === 'number' ? opts.completedWorkouts : undefined;

  // Exactly one finished session → second session is the boss habit, not Coach.
  if (completed === 1) {
    return {
      href: '/active',
      labelKey: 'week1SecondSessionCta',
      defaultLabel: 'Start session 2',
      reasonKey: 'week1SecondSessionReason',
      defaultReason:
        'One session logged. A second this week locks the loop — Coach builds from the logs, not another pillar.',
    };
  }

  const early =
    typeof completed === 'number' &&
    completed > 0 &&
    completed <= COACH_VICTORY_EARLY_WORKOUTS;
  // Explicit plan presence (true or false) → Coach. Early workouts (2–3) → Coach.
  const wantsCoach = early || opts?.hasCoachPlan === true || opts?.hasCoachPlan === false;

  if (wantsCoach) {
    return {
      href: '/coach',
      labelKey: 'victoryNextCoachLabel',
      defaultLabel: 'See Mission Coach',
      reasonKey: 'victoryNextCoachReason',
      defaultReason: 'Coach adapts your week from this log — no wearable needed.',
    };
  }

  // High strain: rest / lighter train — not Mind tourism.
  if ((opts?.strainDelta ?? 0) >= 5) {
    return {
      href: '/log',
      labelKey: 'victoryNextRestLabel',
      defaultLabel: 'Back to Today',
      reasonKey: 'victoryNextRestReason',
      defaultReason: 'Strain is up — recover, then hit a lighter session when ready.',
    };
  }

  return {
    href: '/active',
    labelKey: 'victoryNextTrainLabel',
    defaultLabel: 'Train again',
    reasonKey: 'victoryNextTrainReason',
    defaultReason: 'Keep the path alive — Just Go when you’re ready.',
  };
}
