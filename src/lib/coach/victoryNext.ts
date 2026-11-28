import { getExerciseById } from '@/data/exercises';
import { nextOpenPlanSession } from '@/lib/coach/coachConcept';
import { loadBands } from '@/lib/coach/load';
import { nextTargets, type ProgressionTargets } from '@/lib/coach/progression';
import { todayDayOffset } from '@/lib/coach/splitPlanner';
import type { CoachContext, CoachPlan } from '@/lib/coach/types';
import { localDateKey, localWeekKey } from '@/lib/time/localDate';
import { workingSets } from '@/lib/workout/setMath';
import { resolveSetRowType } from '@/lib/workout/setRowType';
import type { CompletedWorkoutLog } from '@/types';

export type VictoryNextContext = Pick<CoachContext, 'units' | 'goalId' | 'experience'> & {
  plan: CoachPlan | null;
};

type VictoryNextTarget = {
  exerciseId: string;
  target: Pick<ProgressionTargets, 'sets' | 'reps' | 'weight'>;
  source: 'plan' | 'progression';
  bodyweight: boolean;
};

export function victoryNextTargets(
  receipt: CompletedWorkoutLog,
  history: CompletedWorkoutLog[],
  { plan, units, goalId, experience }: VictoryNextContext,
): VictoryNextTarget[] {
  const now = new Date(receipt.completedAt);
  if (receipt.deletedAt || !Number.isFinite(now.getTime())) return [];

  const week = localWeekKey(now);
  const offset = todayDayOffset(week, localDateKey(now));
  const upcoming = plan?.weekStart === week
    ? plan.sessions.filter((s) => s.dayOffset >= offset).sort((a, b) => a.dayOffset - b.dayOffset)
    : [];
  const logged = new Map<string, CompletedWorkoutLog['exercises'][number]>();
  for (const exercise of receipt.exercises) {
    const existing = logged.get(exercise.exerciseId);
    logged.set(exercise.exerciseId, {
      ...exercise,
      sets: [...(existing?.sets ?? []), ...exercise.sets],
    });
  }
  const working = [...logged.values()].map((exercise) => ({
    ...exercise,
    sets: workingSets(exercise.sets).filter((set) =>
      Number.isFinite(set.reps) && set.reps > 0 && Number.isFinite(set.weight) && set.weight >= 0),
  }));
  const prior = history
    .filter((log) => !log.deletedAt && log.id !== receipt.id && Date.parse(log.completedAt) <= now.getTime())
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  const throughFinish = [{ ...receipt, exercises: working }, ...prior];
  const zone = loadBands(throughFinish, now).zone;

  return working.flatMap<VictoryNextTarget>(({ exerciseId, sets }) => {
    const move = getExerciseById(exerciseId);
    if (!move || !logged.get(exerciseId)?.sets.length) return [];
    const rowType = resolveSetRowType(move);
    if (rowType === 'assisted' || rowType === 'duration') return [];
    const bodyweight = rowType === 'bodyweight';
    const next = nextOpenPlanSession(upcoming.filter((session) =>
      session.exercises.some((exercise) => exercise.exerciseId === exerciseId)));
    const prescribed = next?.exercises.find((exercise) => exercise.exerciseId === exerciseId);
    if (prescribed) return [{ exerciseId, target: prescribed, source: 'plan', bodyweight }];
    if (!sets.length) return [];
    const target = nextTargets(exerciseId, throughFinish, units, goalId, experience, zone);
    return [{ exerciseId, target, source: 'progression', bodyweight }];
  });
}
