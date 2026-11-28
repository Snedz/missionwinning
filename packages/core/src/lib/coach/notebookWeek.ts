import type { CompletedWorkoutLog } from '@/types';
import { computeBodyScores, computeReadiness } from '@/lib/score';
import { localDateKey, localWeekKey } from '@/lib/time/localDate';
import { weightUnitFor, type UnitsPref } from '@/lib/units';
import { notebookProgressionContext } from './notebookProgression';
import { generateWeek } from './planEngine';
import type { CoachPlan, EquipmentProfile } from './types';
import { describeWeekChange } from './weekChange';

export function generateNotebookWeek(input: {
  equipment: EquipmentProfile;
  daysPerWeek: number;
  units: UnitsPref;
  history: CompletedWorkoutLog[];
  revision: number;
}, now = new Date()): CoachPlan {
  const { equipment, daysPerWeek, units, revision } = input;
  const weightUnit = weightUnitFor(units);
  const progression = notebookProgressionContext(input.history, units, now);
  const { history } = progression;
  return {
    ...generateWeek({
      ...progression, equipment, daysPerWeek, preferredDays: [], seedId: 'local',
      readiness: computeReadiness(history, now.getTime()),
      bodyScores: computeBodyScores(history, { now: now.getTime() }),
    }, localWeekKey(now), revision, localDateKey(now), now),
    weightUnit,
  };
}

export function rebuildNotebookWeek(input: Parameters<typeof generateNotebookWeek>[0], before: CoachPlan | null, now = new Date()) {
  const plan = generateNotebookWeek(input, now);
  const withoutHistory = before?.weekStart === plan.weekStart && input.history.some((log) => !log.deletedAt)
    ? generateNotebookWeek({ ...input, history: [] }, now)
    : undefined;
  return {
    plan,
    change: before ? describeWeekChange({
      before, after: plan, history: input.history, unit: weightUnitFor(input.units), now,
      source: 'rebuild', withoutHistory,
    }) : null,
  };
}
