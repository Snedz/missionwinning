import type { CompletedWorkoutLog } from '@/types';
import { estimateOneRepMax } from '@/lib/benchmarks';

export type SetPerformance = { weight: number; reps: number };

/** Best prior set for an exercise (by estimated 1RM). */
export function getBestPriorSet(
  exerciseId: string,
  history: CompletedWorkoutLog[]
): SetPerformance | null {
  let best: SetPerformance | null = null;
  let bestEst = 0;

  for (const log of history) {
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    for (const set of ex.sets) {
      if (set.weight <= 0 || set.reps <= 0) continue;
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
  history: CompletedWorkoutLog[]
): boolean {
  if (weight <= 0 || reps <= 0) return false;
  const prior = getBestPriorSet(exerciseId, history);
  if (!prior) return true;
  const newEst = estimateOneRepMax(weight, reps);
  const priorEst = estimateOneRepMax(prior.weight, prior.reps);
  return newEst > priorEst;
}
