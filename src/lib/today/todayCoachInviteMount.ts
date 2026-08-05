/**
 * When the quiet Mission Coach invite strip may mount on Today (Flow-7 · K3).
 *
 * After the first log, journey phase is usually `readiness`, not `basic` —
 * gating invite on `basic` alone made the strip unreachable for the cohort
 * that just earned a plan. Align with victory early-coach window
 * (`COACH_VICTORY_EARLY_WORKOUTS` = 3): sessions 1–3, basic or readiness.
 *
 * **K3:** If a plan is already loaded, the week strip owns Coach — do not stack
 * a second “go generate” invite. On readiness with no plan, invite owns the
 * generate CTA and the empty week strip stays off.
 *
 * Never a second orange primary — JourneyHero owns the boss pin.
 */

import type { JourneyPhase } from '@/lib/missionJourney';
import { COACH_VICTORY_EARLY_WORKOUTS } from '@/lib/workout/workoutVictory';

export function todayCoachInviteMayMount(opts: {
  phase: JourneyPhase;
  totalSessions: number;
  /** When true, week strip already covers Coach — invite is redundant. */
  hasCoachPlan?: boolean;
}): boolean {
  if (opts.hasCoachPlan) return false;
  if (opts.totalSessions < 1) return false;
  if (opts.totalSessions > COACH_VICTORY_EARLY_WORKOUTS) return false;
  return opts.phase === 'basic' || opts.phase === 'readiness';
}

/**
 * Compact week strip on Today.
 * Commissioned always may show it. Readiness only when a plan exists (K3) so
 * empty “Open Coach to generate” does not twin the invite strip.
 */
export function todayCoachWeekMayMount(opts: {
  phase: JourneyPhase;
  hasCoachPlan?: boolean;
}): boolean {
  if (opts.phase === 'commissioned') return true;
  if (opts.phase === 'readiness') return opts.hasCoachPlan === true;
  return false;
}
