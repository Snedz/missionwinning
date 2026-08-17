/**
 * a team-training app-style percent-of-max load — resolve e1RM, prescribe weight from loadPct.
 * Free forever. See docs/DESIGN_RESEARCH.md § Wave 6.
 */

import { estimate1rm } from '@/lib/coach/progress';
import type { UnitsPref } from '@/lib/units';
import { weightStep } from '@/lib/units';
import { loadBearingSets, roundToStep } from '@/lib/workout/setMath';
import type { CompletedWorkoutLog } from '@/types';

export type LoadPctExperience = 'beginner' | 'intermediate' | 'advanced';

/**
 * Best working max for an exercise from history.
 *
 * Delegates to `estimate1rm` so prescriptions, the /benchmarks cards, the live PR
 * chip and the debrief all quote the same number. Before `.174` this used uncapped
 * Epley and **never checked `deletedAt`**, so a single deleted heavy session — or one
 * 20-rep set, which no 1RM formula is fitted for — inflated an athlete's working max
 * for the whole 28-day window.
 *
 * Returns null when nothing in history can support an estimate (e.g. a lift only ever
 * trained above 12 reps). Callers must treat null as "prescribe from the last session
 * instead", which is the correct behaviour for an endurance-rep history anyway.
 */
export function workingMaxFromHistory(
  exerciseId: string,
  history: CompletedWorkoutLog[]
): number | null {
  let best = 0;
  for (const log of history) {
    if (log.deletedAt) continue;
    const hit = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!hit) continue;
    for (const s of loadBearingSets(hit.sets)) {
      const est = estimate1rm(s.weight, s.reps);
      if (est !== null && est > best) best = est;
    }
  }
  return best > 0 ? best : null;
}

/** Baseline % of max by experience + goal (clamped 65–90). */
export function suggestLoadPct(experience: LoadPctExperience, goalId: string): number {
  let pct = experience === 'beginner' ? 70 : experience === 'advanced' ? 80 : 75;
  if (goalId === 'strength' || goalId === 'pft') pct += 5;
  if (goalId === 'endurance' || goalId === 'fat_loss') pct -= 5;
  return Math.max(65, Math.min(90, pct));
}

/** Absolute weight from max × loadPct, rounded to unit step. */
export function weightFromLoadPct(
  workingMax: number,
  loadPct: number,
  units: UnitsPref
): number {
  if (workingMax <= 0 || loadPct <= 0) return 0;
  const step = weightStep(units);
  const raw = workingMax * (loadPct / 100);
  return Math.max(0, roundToStep(raw, step));
}

/** Inverse: what % of max is this weight (for adjust / display). */
export function loadPctFromWeight(workingMax: number, weight: number): number | null {
  if (workingMax <= 0 || weight <= 0) return null;
  return Math.max(1, Math.min(100, Math.round((weight / workingMax) * 100)));
}

/**
 * Starting loadPct from last working weight vs max, else experience/goal baseline.
 */
export function resolveStartingLoadPct(opts: {
  workingMax: number;
  lastWeight: number;
  experience: LoadPctExperience;
  goalId: string;
}): number {
  const { workingMax, lastWeight, experience, goalId } = opts;
  if (lastWeight > 0 && workingMax > 0) {
    const fromLast = (lastWeight / workingMax) * 100;
    if (fromLast >= 50 && fromLast <= 95) return fromLast;
  }
  return suggestLoadPct(experience, goalId);
}

/** Scale a stored loadPct (e.g. adjust today conservative). */
export function scaleLoadPct(loadPct: number | undefined, factor: number): number | undefined {
  if (loadPct == null || loadPct <= 0) return undefined;
  return Math.max(1, Math.min(100, Math.round(loadPct * factor)));
}
