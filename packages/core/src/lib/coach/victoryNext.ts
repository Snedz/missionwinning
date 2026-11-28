import { getExerciseById } from '@/data/exercises';
import { weightUnitFor, type UnitsPref, type WeightUnit } from '@/lib/units';
import { workingSets } from '@/lib/workout/setMath';
import { exerciseFromCatalogLike, resolveSetRowType, resolveSetRowTypeFromId } from '@/lib/workout/setRowType';
import type { CompletedWorkoutLog } from '@/types';
import { nextOpenPlanSession } from './coachConcept';
import { notebookProgressionContext } from './notebookProgression';
import { nextTargets, type ProgressionTargets } from './progression';
import type { CoachPlan } from './types';

export type VictoryNextTarget = {
  exerciseId: string;
} & (
  | { source: 'progression' | 'plan'; target: ProgressionTargets; unit: WeightUnit }
  | { source: 'unavailable'; reason: 'working-sets' | 'duration' | 'assisted' }
);

export function victoryNextTargets(
  receipt: CompletedWorkoutLog,
  history: CompletedWorkoutLog[],
  units: UnitsPref,
  plan: CoachPlan | null = null,
): VictoryNextTarget[] {
  if (receipt.deletedAt) return [];

  const now = new Date(receipt.completedAt);
  const earlier = history.filter((entry) =>
    entry.id !== receipt.id && Date.parse(entry.completedAt) <= now.getTime(),
  ).sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  const ctx = notebookProgressionContext([receipt, ...earlier], units, now);
  const unit = weightUnitFor(units);
  const next = nextOpenPlanSession(plan?.sessions ?? []);
  const rows = new Map<string, VictoryNextTarget>();
  for (const { exerciseId, sets } of receipt.exercises) {
    if (rows.has(exerciseId)) continue;
    const catalog = getExerciseById(exerciseId);
    const type = catalog ? resolveSetRowType(exerciseFromCatalogLike(catalog)) : resolveSetRowTypeFromId(exerciseId);
    if (type === 'duration' || type === 'assisted') {
      rows.set(exerciseId, { exerciseId, source: 'unavailable', reason: type });
    } else if (workingSets(sets).some((set) => set.reps > 0)) {
      const target = nextTargets(exerciseId, ctx.history, ctx.units, ctx.goalId, ctx.experience, ctx.loadZone);
      rows.set(exerciseId, { exerciseId, source: 'progression', target, unit });
    } else {
      const target = next?.exercises.find((exercise) => exercise.exerciseId === exerciseId);
      rows.set(exerciseId, target
        ? { exerciseId, source: 'plan', target, unit: plan?.weightUnit ?? unit }
        : { exerciseId, source: 'unavailable', reason: 'working-sets' });
    }
  }
  return [...rows.values()];
}
