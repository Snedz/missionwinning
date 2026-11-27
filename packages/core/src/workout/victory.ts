/**
 * One boss next step after a session — web + native share this shape.
 * Prefer Mission Coach early; never send free logger users to Bundle for fuel.
 *
 * **Week-1 session 2 wins** over the early-Coach CTA (aligned with web `.412`).
 * After exactly one log, the habit loop is a second train at `/active`, not
 * Coach. Inlined here so mw-core stays free of app `src/` imports.
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
 * Early / plan known: Mission Coach (Train+Coach wedge), except session 2.
 * High strain → post-train Mind collection (not generic tourism).
 * Fuel stays a secondary link when primary is Coach/Train — never Bundle.
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

  // High strain: recovery mind with collection deep-link (matches web workoutVictory).
  if ((opts?.strainDelta ?? 0) >= 5) {
    return {
      href: '/mind?collection=post-train',
      labelKey: 'victoryNextRecoverMindLabel',
      defaultLabel: 'Post-train downshift',
      reasonKey: 'victoryNextRecoverMindReason',
      defaultReason: 'Strain is up — a short downshift before the next load.',
    };
  }

  // Late freestyle with protein still open: free Fuel logger (never Bundle).
  if (!opts?.proteinLoggedToday) {
    return {
      href: '/nutrition',
      labelKey: 'victoryNextFuelLabel',
      defaultLabel: 'Log protein',
      reasonKey: 'victoryNextFuelReason',
      defaultReason: 'Fuel the session you just earned — free logger, no paywall.',
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
