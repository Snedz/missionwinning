/**
 * When the quiet Mission Coach invite strip may mount on Today (Flow-7).
 *
 * After the first log, journey phase is usually `readiness`, not `basic` —
 * gating invite on `basic` alone made the strip unreachable for the cohort
 * that just earned a plan. Align with victory early-coach window
 * (`COACH_VICTORY_EARLY_WORKOUTS` = 3): sessions 1–3, basic or readiness.
 *
 * Never a second orange primary — JourneyHero owns the boss pin.
 */

import type { JourneyPhase } from '@/lib/missionJourney';
import { COACH_VICTORY_EARLY_WORKOUTS } from '@/lib/workout/workoutVictory';

export function todayCoachInviteMayMount(opts: {
  phase: JourneyPhase;
  totalSessions: number;
}): boolean {
  if (opts.totalSessions < 1) return false;
  if (opts.totalSessions > COACH_VICTORY_EARLY_WORKOUTS) return false;
  return opts.phase === 'basic' || opts.phase === 'readiness';
}
