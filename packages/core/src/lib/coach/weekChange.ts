import type { CompletedWorkoutLog } from '@/types';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';
import { convertWeight, type WeightUnit } from '@/lib/units';
import { workoutInWeightUnit } from '@/lib/workout/workoutMerge';
import { workingSets } from '@/lib/workout/setMath';
import type { CoachPlan, PlanExercise, PlanSession } from './types';

type Session = Pick<PlanSession, 'name' | 'dayOffset'>;
type ScheduleReason =
  | { kind: 'calendar'; from: string; finishedOnOldDay?: number }
  | { kind: 'frequency'; before: number; after: number }
  | { kind: 'history'; finished: number }
  | { kind: 'schedule' }
  | { kind: 'sync' };

type ScheduleChange = (
  | { kind: 'moved'; before: Session; after: Session }
  | { kind: 'dropped'; before: Session }
  | { kind: 'added'; after: Session }
) & { reason: ScheduleReason };

type WorkoutFact = { id: string; name: string; date: string };
type SetFact = WorkoutFact & { weight: number; reps: number; workingSets: number };
type Target = Pick<PlanExercise, 'sets' | 'reps' | 'weight'> & { unset: boolean };

export type WeekChange = {
  weekStart: string;
  source: 'rebuild' | 'adapt' | 'sync';
  newWeek: boolean;
  unit: WeightUnit;
  schedule: ScheduleChange[];
  completed: { session: Session; workout?: WorkoutFact }[];
  loads: {
    exerciseId: string;
    days: number[];
    before: Target;
    after: Target;
    whyKey: string | null;
    log?: SetFact;
  }[];
};

type WeekChangeInput = {
  before: CoachPlan;
  after: CoachPlan;
  history: readonly CompletedWorkoutLog[];
  unit: WeightUnit;
  now: Date;
  source: WeekChange['source'];
  withoutHistory?: CoachPlan;
  completedWorkout?: CompletedWorkoutLog;
};

function sessionKey(session: PlanSession) {
  return JSON.stringify([session.kind, [...new Set(session.focusGroups ?? [])].sort()]);
}

function sessionRef({ name, dayOffset }: PlanSession): Session {
  return { name, dayOffset };
}

function isOpen(session: PlanSession) {
  return session.status === 'planned' || session.status === 'swapped';
}

function dateFor(week: string, offset: number): string {
  const [year, month, day] = week.split('-').map(Number);
  return localDateKey(new Date(year, month - 1, day + offset, 12));
}

function workoutFact(log: CompletedWorkoutLog): WorkoutFact {
  return { id: log.clientId ?? log.id, name: log.workoutName, date: localDateKeyFromIso(log.completedAt) };
}

function referenceSet(history: CompletedWorkoutLog[], exerciseId: string): SetFact | undefined {
  // Match progression's latest matching workout and first working set; don't skip back to a different day.
  for (const log of history) {
    const exercise = log.exercises.find((row) => row.exerciseId === exerciseId);
    if (!exercise) continue;
    const sets = workingSets(exercise.sets);
    const first = sets[0];
    if (!first) return;
    return { ...workoutFact(log), weight: first.weight, reps: first.reps, workingSets: sets.length };
  }
}

function target(exercise: PlanExercise, source: WeightUnit, unit: WeightUnit): Target {
  return {
    sets: exercise.sets,
    reps: exercise.reps,
    weight: Math.round(convertWeight(exercise.weight, source, unit) * 100) / 100,
    unset: exercise.whyKey === 'coachFindWorkingWeight' && exercise.weight === 0,
  };
}

export function describeWeekChange(input: WeekChangeInput): WeekChange {
  const { before, after, unit, source, withoutHistory, completedWorkout, now } = input;
  const change: WeekChange = {
    weekStart: after.weekStart, source, newWeek: before.weekStart !== after.weekStart,
    unit, schedule: [], completed: [], loads: [],
  };
  if (change.newWeek) return change;

  const history = input.history.filter((log) => !log.deletedAt);
  const normalized = history.map((log) => workoutInWeightUnit(log, unit));
  const today = localDateKey(now);
  const dates = history.map((log) => localDateKeyFromIso(log.completedAt));
  const calendar = source === 'rebuild' ? today : undefined;
  const representedWithoutLog = (session: PlanSession) => withoutHistory?.sessions.some((baseline) =>
    baseline.dayOffset === session.dayOffset && sessionKey(baseline) === sessionKey(session));

  function scheduleReason(previous?: PlanSession, next?: PlanSession): ScheduleReason {
    if (source === 'sync') return { kind: 'sync' };
    const oldDate = previous && dateFor(before.weekStart, previous.dayOffset);
    if (calendar && oldDate && oldDate < calendar) {
      return { kind: 'calendar', from: calendar, finishedOnOldDay: dates.filter((date) => date === oldDate).length };
    }
    if (withoutHistory && (next ? !representedWithoutLog(next) : previous && representedWithoutLog(previous))) {
      return { kind: 'history', finished: history.length };
    }
    if (before.daysPerWeek !== after.daysPerWeek) {
      return { kind: 'frequency', before: before.daysPerWeek, after: after.daysPerWeek };
    }
    if (calendar && previous && next) return { kind: 'calendar', from: calendar };
    return { kind: 'schedule' };
  }

  const previous = before.sessions.filter(isOpen).sort((a, b) => a.dayOffset - b.dayOffset);
  const next = after.sessions.filter(isOpen).sort((a, b) => a.dayOffset - b.dayOffset);
  const pairs = new Map<PlanSession, PlanSession>();
  const consumed = new Set<PlanSession>();
  const completed = new Set<PlanSession>();
  for (const old of previous) {
    const done = after.sessions.find((session) => session.status === 'done' && session.id === old.id &&
      sessionKey(session) === sessionKey(old));
    if (!done) continue;
    completed.add(old);
    change.completed.push({
      session: sessionRef(done),
      ...(completedWorkout && !completedWorkout.deletedAt && { workout: workoutFact(completedWorkout) }),
    });
  }

  function match(eligible: (old: PlanSession, candidate: PlanSession) => boolean) {
    for (const old of previous) {
      if (pairs.has(old) || completed.has(old)) continue;
      const other = next.find((candidate) => !consumed.has(candidate) && sessionKey(old) === sessionKey(candidate) &&
        eligible(old, candidate));
      if (!other) continue;
      pairs.set(old, other);
      consumed.add(other);
    }
  }
  // Rebuild IDs are calendar slots, not session identities. Keep matching same-day focus first.
  if (source === 'adapt') {
    match((old, other) => old.id === other.id);
  } else {
    match((old, other) => old.dayOffset === other.dayOffset);
    match(() => true);
  }

  const loadGroups = new Map<string, WeekChange['loads'][number]>();
  for (const old of previous) {
    if (completed.has(old)) continue;
    const other = pairs.get(old);
    if (!other) {
      change.schedule.push({ kind: 'dropped', before: sessionRef(old), reason: scheduleReason(old) });
      continue;
    }
    if (old.dayOffset !== other.dayOffset) {
      change.schedule.push({ kind: 'moved', before: sessionRef(old), after: sessionRef(other), reason: scheduleReason(old, other) });
    }

    for (const exercise of other.exercises) {
      const prior = old.exercises.find(({ exerciseId }) => exerciseId === exercise.exerciseId);
      if (!prior) continue;
      const from = target(prior, before.weightUnit ?? unit, unit);
      const to = target(exercise, after.weightUnit ?? unit, unit);
      const weightChanged = Math.abs(from.weight - to.weight) >= (before.weightUnit === after.weightUnit ? 0.01 : 0.05);
      if (from.sets === to.sets && from.reps === to.reps && from.unset === to.unset && !weightChanged) continue;
      const item = {
        exerciseId: exercise.exerciseId, days: [other.dayOffset], before: from, after: to,
        whyKey: source === 'sync' ? null : exercise.whyKey,
        log: source === 'sync' ? undefined : referenceSet(normalized, exercise.exerciseId),
      };
      const key = JSON.stringify([item.exerciseId, from, to, item.whyKey]);
      const group = loadGroups.get(key);
      if (group) group.days.push(other.dayOffset);
      else loadGroups.set(key, item);
    }
  }
  for (const other of next) {
    if (!consumed.has(other)) change.schedule.push({ kind: 'added', after: sessionRef(other), reason: scheduleReason(undefined, other) });
  }
  change.loads = [...loadGroups.values()].map((group) => ({ ...group, days: group.days.sort((a, b) => a - b) }));
  return change;
}

export function hasWeekChanges(change: WeekChange): boolean {
  return change.newWeek || change.schedule.length > 0 || change.completed.length > 0 || change.loads.length > 0;
}
