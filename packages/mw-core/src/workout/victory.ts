/**
 * One boss next step after a session — web + native share this shape.
 * Prefer Mission Coach early; never send free logger users to Bundle for fuel.
 */

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
 * Fuel → `/nutrition` (never Bundle). High strain → Today rest, not Mind tourism.
 */
export function pickVictoryNextAction(opts?: PickVictoryNextActionOpts): VictoryNextAction {
  const completed =
    typeof opts?.completedWorkouts === 'number' ? opts.completedWorkouts : undefined;

  const early =
    typeof completed === 'number' && completed > 0 && completed <= COACH_VICTORY_EARLY_WORKOUTS;

  // Explicit plan presence or early window → Coach (matches web workoutVictory.ts wedge).
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

  if (!opts?.proteinLoggedToday) {
    return {
      href: '/nutrition',
      labelKey: 'victoryNextFuelLabel',
      defaultLabel: 'Log protein',
      reasonKey: 'victoryNextFuelReason',
      defaultReason: 'Fuel the session you just earned — free logger, no paywall.',
    };
  }

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

export type VictorySecondaryLink = {
  href: string;
  labelKey: string;
  defaultLabel: string;
};

/**
 * Quiet secondary links under the one primary Victory CTA (Hick: one boss action).
 * Super Bundle continuity without stealing Peak-End focus.
 */
export function buildVictorySecondaryLinks(opts: {
  primaryHref: string;
  proteinLoggedToday?: boolean;
  strainDelta?: number;
}): VictorySecondaryLink[] {
  const primary = opts.primaryHref || '';
  const out: VictorySecondaryLink[] = [];

  if (!opts.proteinLoggedToday && !primary.includes('/nutrition') && !primary.includes('/bundle')) {
    out.push({
      href: '/nutrition',
      labelKey: 'victorySecondaryFuel',
      defaultLabel: 'Log protein',
    });
  }

  if ((opts.strainDelta ?? 0) >= 5) {
    if (!primary.includes('/mind')) {
      out.push({
        href: '/mind',
        labelKey: 'victorySecondaryMind',
        defaultLabel: 'Mind downshift',
      });
    }
  } else if (!primary.includes('/move')) {
    out.push({
      href: '/move',
      labelKey: 'victorySecondaryMove',
      defaultLabel: 'Mobility',
    });
  }

  return out.slice(0, 2);
}
