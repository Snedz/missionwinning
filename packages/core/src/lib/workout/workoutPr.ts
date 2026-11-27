import type { CompletedWorkoutLog, SetKind } from '@/types';
import { estimateOneRepMax } from '@/lib/benchmarks';
import { countsTowardPr } from '@/lib/workout/setKind';

export type SetPerformance = { weight: number; reps: number };

/** Best prior set for an exercise (by estimated 1RM). */
export function getBestPriorSet(
  exerciseId: string,
  history: CompletedWorkoutLog[]
): SetPerformance | null {
  let best: SetPerformance | null = null;
  let bestEst = 0;

  for (const log of history) {
    // A deleted session cannot hold the record it is being compared against.
    if (log.deletedAt) continue;
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    for (const set of ex.sets) {
      if (set.weight <= 0 || set.reps <= 0) continue;
      if (!countsTowardPr(set.kind)) continue;
      const est = estimateOneRepMax(set.weight, set.reps);
      if (est > bestEst) {
        bestEst = est;
        best = { weight: set.weight, reps: set.reps };
      }
    }
  }

  return best;
}

/** True when this set beats all prior logged sets for the exercise. */
export function isPersonalRecord(
  exerciseId: string,
  reps: number,
  weight: number,
  history: CompletedWorkoutLog[],
  kind: SetKind = 'normal'
): boolean {
  if (weight <= 0 || reps <= 0) return false;
  if (!countsTowardPr(kind)) return false;

  /*
   * `.208` — a set no formula covers cannot be a record.
   *
   * `estimateOneRepMax` returns 0 above 12 reps, because no 1RM formula is
   * fitted there (`percentLoad.ts` says so explicitly). `getBestPriorSet` can
   * therefore only ever return a set of 12 reps or fewer — so for an athlete who
   * only trains high-rep, `prior` is **permanently null**, and `if (!prior)
   * return true` fired the brass chip and the haptic on **every set, forever**.
   *
   * Goblet squats at 20kg × 20: a PR on set one, a PR on set two hundred. A
   * celebration that cannot fail to happen carries no information, and this one
   * also writes `isPr` into the log, so it is on the record too.
   *
   * Checking the *new* set first is what fixes it: no estimate, no claim. The
   * genuine first-estimable-set case still reads as a PR, which is correct — it
   * beats everything the app can compare it to.
   */
  const newEst = estimateOneRepMax(weight, reps);
  if (newEst <= 0) return false;

  const prior = getBestPriorSet(exerciseId, history);
  if (!prior) return true;
  const priorEst = estimateOneRepMax(prior.weight, prior.reps);
  return newEst > priorEst;
}
