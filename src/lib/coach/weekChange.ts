import type { CompletedWorkoutLog } from '@/types';
import { workingSets } from '@/lib/workout/setMath';
import { nextTargets } from './progression';
import type { CoachContext, CoachPlan, PlanExercise, PlanSession } from './types';

type Session = Pick<PlanSession, 'name' | 'kind' | 'focusGroups' | 'dayOffset'>;
type Target = Pick<PlanExercise, 'sets' | 'reps' | 'weight'> & { unset: boolean };
type SavedSet = { workoutId: string; completedAt: string; weight: number; reps: number };
type ScheduleChange =
  | { kind: 'moved'; before: Session; after: Session }
  | { kind: 'dropped'; before: Session; missed: boolean }
  | { kind: 'added'; after: Session }
  | { kind: 'completed'; after: Session };

export type CoachWeekChange = {
  source: 'adapt' | 'rebuild';
  weekStart: string;
  beforeRevision: number;
  afterRevision: number;
  units: CoachContext['units'];
  schedule: ScheduleChange[];
  loads: {
    session: Session;
    exerciseId: string;
    before: Target;
    after: Target;
    reasonKey?: string;
    savedSet?: SavedSet;
  }[];
};

function session({ name, kind, focusGroups, dayOffset }: PlanSession): Session {
  return { name, kind, focusGroups, dayOffset };
}

function focusKey(s: Session): string {
  return [s.kind, ...[...new Set(s.focusGroups)].sort()].join(':');
}

function isPending(s: PlanSession): boolean {
  return s.status === 'planned' || s.status === 'swapped';
}

function target({ sets, reps, weight, whyKey }: PlanExercise): Target {
  return { sets, reps, weight, unset: weight === 0 && whyKey === 'coachFindWorkingWeight' };
}

function sameTarget(a: Target, b: Target): boolean {
  return a.sets === b.sets && a.reps === b.reps && a.weight === b.weight && a.unset === b.unset;
}

function firstWorkingSet(log: CompletedWorkoutLog, exerciseId: string) {
  const exercise = log.exercises.find((e) => e.exerciseId === exerciseId);
  return exercise && workingSets(exercise.sets)[0];
}

export function findWeekChangeWorkout(
  history: readonly CompletedWorkoutLog[],
  exerciseId: string,
  quote: SavedSet,
): CompletedWorkoutLog | undefined {
  return history.find((log) => {
    if (log.deletedAt || (log.clientId ?? log.id) !== quote.workoutId || log.completedAt !== quote.completedAt) return false;
    const first = firstWorkingSet(log, exerciseId);
    return first?.weight === quote.weight && first.reps === quote.reps;
  });
}

function progressionEvidence(
  before: Target,
  exercise: PlanExercise,
  ctx: CoachContext,
): { reasonKey?: string; savedSet?: SavedSet } {
  const history = ctx.history.filter((log) => !log.deletedAt);
  const predict = (rows: CompletedWorkoutLog[]) => ({
    exerciseId: exercise.exerciseId,
    ...nextTargets(exercise.exerciseId, rows, ctx.units, ctx.goalId, ctx.experience, ctx.loadZone),
  });
  const actual = predict(history);
  if (actual.whyKey !== exercise.whyKey || !sameTarget(target(actual), target(exercise))) return {};

  const log = history.find((row) => row.exercises.some((e) => e.exerciseId === exercise.exerciseId));
  const first = log && firstWorkingSet(log, exercise.exerciseId);
  if (!log || !first) return { reasonKey: actual.whyKey };
  const withoutLog = target(predict(history.filter((row) => row !== log)));
  const to = target(actual);
  if (!(['sets', 'reps', 'weight', 'unset'] as const).some(
    (key) => before[key] !== to[key] && withoutLog[key] !== to[key],
  )) return { reasonKey: actual.whyKey };
  return {
    reasonKey: actual.whyKey,
    savedSet: {
      workoutId: log.clientId ?? log.id,
      completedAt: log.completedAt,
      weight: first.weight,
      reps: first.reps,
    },
  };
}

export function describeCoachWeekChange(
  before: CoachPlan,
  after: CoachPlan,
  ctx: CoachContext,
  source: CoachWeekChange['source'],
): CoachWeekChange | null {
  if (before.weekStart !== after.weekStart || before.revision >= after.revision) return null;
  const schedule: ScheduleChange[] = [];
  const loads: CoachWeekChange['loads'] = [];
  const previous = before.sessions.filter(isPending).sort((a, b) => a.dayOffset - b.dayOffset);
  const next = after.sessions.filter(isPending).sort((a, b) => a.dayOffset - b.dayOffset);
  const pairs = new Map<PlanSession, PlanSession>();
  const consumed = new Set<PlanSession>();
  const completed = new Set<PlanSession>();
  for (const old of before.sessions.filter((s) => s.status !== 'done').sort((a, b) => a.dayOffset - b.dayOffset)) {
    const done = after.sessions.find((s) => s.id === old.id && s.status === 'done' && focusKey(s) === focusKey(old));
    if (done) {
      completed.add(old);
      schedule.push({ kind: 'completed', after: session(done) });
    }
  }

  function match(eligible: (old: PlanSession, candidate: PlanSession) => boolean) {
    for (const old of previous) {
      if (pairs.has(old) || completed.has(old)) continue;
      const other = next.find((s) => !consumed.has(s) && focusKey(old) === focusKey(s) && eligible(old, s));
      if (!other) continue;
      pairs.set(old, other);
      consumed.add(other);
    }
  }
  // IDs in a rebuild identify calendar slots, not workouts.
  if (source === 'adapt') match((old, other) => old.id === other.id);
  match((old, other) => old.dayOffset === other.dayOffset);
  const recreated = new Map<PlanSession, PlanSession>();
  if (source === 'rebuild') {
    for (const other of next) {
      if (consumed.has(other)) continue;
      const earlier = before.sessions.find((old) =>
        old.status === 'done' && old.dayOffset === other.dayOffset && focusKey(old) === focusKey(other)
      );
      if (!earlier) continue;
      recreated.set(other, earlier);
      consumed.add(other);
    }
    match(() => true);
  }

  function compareTargets(old: PlanSession, other: PlanSession) {
    for (const exercise of other.exercises) {
      const prior = old.exercises.find((e) => e.exerciseId === exercise.exerciseId);
      if (!prior) continue;
      const from = target(prior);
      const to = target(exercise);
      if (sameTarget(from, to)) continue;
      loads.push({
        session: session(other), exerciseId: exercise.exerciseId, before: from, after: to,
        ...progressionEvidence(from, exercise, ctx),
      });
    }
  }

  for (const old of previous) {
    if (completed.has(old)) continue;
    const other = pairs.get(old);
    if (!other) {
      const missed = after.sessions.some((s) => s.id === old.id && focusKey(s) === focusKey(old) && s.status === 'missed');
      schedule.push({ kind: 'dropped', before: session(old), missed });
      continue;
    }
    if (old.dayOffset !== other.dayOffset) {
      schedule.push({ kind: 'moved', before: session(old), after: session(other) });
    }
    compareTargets(old, other);
  }
  for (const other of next) {
    const earlier = recreated.get(other);
    if (earlier) compareTargets(earlier, other);
    else if (!consumed.has(other)) schedule.push({ kind: 'added', after: session(other) });
  }
  if (!schedule.length && !loads.length) return null;
  return {
    source, weekStart: after.weekStart, beforeRevision: before.revision, afterRevision: after.revision,
    units: ctx.units, schedule, loads,
  };
}
