import { estimate1rm } from "@/lib/coach/progress";
import type { CompletedWorkoutLog } from "@/types";
import { countsTowardStrengthEstimate } from "@/lib/workout/setKind";

/**
 * Estimated 1-rep max — delegates to the one estimator.
 *
 * This used to re-implement Epley inline, uncapped, which is why a 15-rep set could
 * fire the live PR chip for a "record" the debrief then refused to confirm. Keeps the
 * `0`-for-invalid contract its callers rely on rather than returning null.
 */
export function estimateOneRepMax(weight: number, reps: number): number {
  return estimate1rm(weight, reps) ?? 0;
}

export interface BenchmarkTimelinePoint {
  date: string;
  workoutId: string;
  workoutName: string;
  estimated1RM: number;
  actual1RM: number | null;
  bestSet: { weight: number; reps: number };
  setsLogged: number;
}

export interface ExerciseBenchmarkStats {
  exerciseId: string;
  sessionCount: number;
  totalSets: number;
  bestEstimated1RM: number;
  bestActual1RM: number | null;
  latestEstimated1RM: number;
  latestActual1RM: number | null;
  estimateVsActualDelta: number | null;
  timeline: BenchmarkTimelinePoint[];
}

/*
 * `formatChartDate` used to live here, stamping a `dateLabel` onto every
 * timeline point. `.242` deleted it rather than giving it a language, because
 * threading one in would have fixed the wrong half: the label was computed
 * inside a `useMemo` keyed on `workoutHistory`, so switching the app's language
 * left the chart axis in the previous one until a workout was logged. A display
 * string baked into a data structure is a language stamped at build time —
 * `.195`'s shape, one field over. Points carry the raw ISO `date`; the component
 * that draws the axis formats it, with `lang` in its deps.
 */

export function buildExerciseBenchmark(
  exerciseId: string,
  history: CompletedWorkoutLog[]
): ExerciseBenchmarkStats | null {
  const timeline: BenchmarkTimelinePoint[] = [];
  let totalSets = 0;

  const chronological = [...history].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  for (const log of chronological) {
    // A deleted session is not evidence. Tombstones propagate cross-device (.127), so
    // this was silently charting sessions the athlete had removed.
    if (log.deletedAt) continue;
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex || ex.sets.length === 0) continue;

    let bestEstimated = 0;
    let bestActual: number | null = null;
    let bestSet = ex.sets[0];

    for (const set of ex.sets) {
      if (set.weight <= 0 || set.reps <= 0) continue;
      // `totalSets` counts what was logged — warmups included, since the label says
      // "sets logged". Only the *estimate* excludes them.
      totalSets++;
      if (!countsTowardStrengthEstimate(set.kind)) continue;
      const est = estimateOneRepMax(set.weight, set.reps);
      if (est > bestEstimated) {
        bestEstimated = est;
        bestSet = set;
      }
      if (set.reps === 1 && set.weight > (bestActual ?? 0)) {
        bestActual = set.weight;
      }
    }

    if (bestEstimated <= 0) continue;

    timeline.push({
      date: log.completedAt,
      workoutId: log.id,
      workoutName: log.workoutName,
      estimated1RM: bestEstimated,
      actual1RM: bestActual,
      bestSet,
      setsLogged: ex.sets.length,
    });
  }

  if (timeline.length === 0) return null;

  const latest = timeline[timeline.length - 1];
  const bestEstimated1RM = Math.max(...timeline.map((t) => t.estimated1RM));
  const actualValues = timeline.map((t) => t.actual1RM).filter((v): v is number => v !== null);
  const bestActual1RM = actualValues.length > 0 ? Math.max(...actualValues) : null;

  const estimateVsActualDelta =
    bestActual1RM !== null ? bestEstimated1RM - bestActual1RM : null;

  return {
    exerciseId,
    sessionCount: timeline.length,
    totalSets,
    bestEstimated1RM,
    bestActual1RM,
    latestEstimated1RM: latest.estimated1RM,
    latestActual1RM: latest.actual1RM,
    estimateVsActualDelta,
    timeline,
  };
}

export function getExercisesWithBenchmarkData(
  history: CompletedWorkoutLog[]
): string[] {
  const ids = new Set<string>();
  for (const log of history) {
    for (const ex of log.exercises) {
      if (ex.sets.some((s) => s.weight > 0 && s.reps > 0)) {
        ids.add(ex.exerciseId);
      }
    }
  }
  return Array.from(ids);
}

export function buildAllBenchmarkSummaries(history: CompletedWorkoutLog[]) {
  const exerciseIds = getExercisesWithBenchmarkData(history);
  return exerciseIds
    .map((id) => buildExerciseBenchmark(id, history))
    .filter((b): b is ExerciseBenchmarkStats => b !== null)
    .sort((a, b) => b.bestEstimated1RM - a.bestEstimated1RM);
}
