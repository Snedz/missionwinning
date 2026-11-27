import type { CompletedWorkoutLog } from '@/types';
import {
  MAJOR_GROUPS,
  type MuscleGroup,
  readinessStatusKey,
  type ReadinessStatusKey,
} from '@/lib/muscleGroups';
import {
  resolveMajorMuscleGroups,
  seedExerciseMuscleMap,
} from '@/lib/exerciseMuscleMap';

export type { MuscleGroup, ReadinessStatusKey };

export interface ReadinessInfo {
  days: number;
  statusKey: ReadinessStatusKey;
}

let catalogSeeded = false;

async function ensureCatalogSeeded(): Promise<void> {
  if (catalogSeeded) return;
  const { EXERCISES } = await import('@/data/exercises');
  seedExerciseMuscleMap(EXERCISES);
  catalogSeeded = true;
}

function needsCatalogBackfill(history: CompletedWorkoutLog[]): boolean {
  for (const log of history) {
    for (const ex of log.exercises) {
      if (!ex.muscleGroups?.length) return true;
    }
  }
  return false;
}

/**
 * Readiness from history using stored muscleGroups when present.
 * Lazily imports EXERCISES only for old logs missing the snapshot.
 */
export async function computeReadinessIndex(
  workoutHistory: CompletedWorkoutLog[]
): Promise<Record<MuscleGroup, ReadinessInfo>> {
  if (needsCatalogBackfill(workoutHistory)) {
    await ensureCatalogSeeded();
  }
  return computeReadinessFromHistory(workoutHistory);
}

/** Sync path — seed catalog first if any log lacks muscleGroups. */
export function computeReadinessFromHistory(
  workoutHistory: CompletedWorkoutLog[]
): Record<MuscleGroup, ReadinessInfo> {
  if (needsCatalogBackfill(workoutHistory) && !catalogSeeded) {
    // Sync callers (score.ts) seed via seedExerciseMuscleMap before calling.
  }

  const lastByGroup: Record<string, Date | null> = {};
  MAJOR_GROUPS.forEach((g) => {
    lastByGroup[g] = null;
  });

  for (const log of workoutHistory) {
    const logDate = new Date(log.completedAt);
    for (const ex of log.exercises) {
      const groups = resolveMajorMuscleGroups(ex.exerciseId, ex.muscleGroups);
      for (const g of groups) {
        if (!lastByGroup[g] || logDate > lastByGroup[g]!) {
          lastByGroup[g] = logDate;
        }
      }
    }
  }

  const readiness: Record<MuscleGroup, ReadinessInfo> = {} as Record<
    MuscleGroup,
    ReadinessInfo
  >;
  MAJOR_GROUPS.forEach((g) => {
    const last = lastByGroup[g];
    const days = last
      ? Math.floor((Date.now() - last.getTime()) / (1000 * 3600 * 24))
      : 99;
    readiness[g] = { days, statusKey: readinessStatusKey(days) };
  });
  return readiness;
}

/** Test helper — clear lazy seed flag. */
export function resetReadinessCatalogSeed(): void {
  catalogSeeded = false;
}
