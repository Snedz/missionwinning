import { weightUnitFor, type UnitsPref } from '@/lib/units';
import { workoutInWeightUnit } from '@/lib/workout/workoutMerge';
import type { CompletedWorkoutLog } from '@/types';
import { loadBands } from './load';

export function notebookProgressionContext(history: CompletedWorkoutLog[], units: UnitsPref, now: Date) {
  const normalized = history.filter((entry) => !entry.deletedAt)
    .map((entry) => workoutInWeightUnit(entry, weightUnitFor(units)));
  return {
    history: normalized,
    units,
    goalId: 'strength',
    experience: 'beginner' as const,
    loadZone: loadBands(normalized, now).zone,
  };
}
