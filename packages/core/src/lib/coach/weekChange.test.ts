import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CompletedWorkoutLog } from '@/types';
import { generateNotebookWeek, rebuildNotebookWeek } from './notebookWeek';
import { describeWeekChange, hasWeekChanges } from './weekChange';
import type { CoachPlan, PlanSession } from './types';

const day = (offset: number) => new Date(2026, 5, 8 + offset, 12);
const date = (offset: number) => day(offset).toISOString();
const input = { units: 'metric', equipment: 'dumbbells', daysPerWeek: 3, revision: 1 } as const;

function log(offset: number, weight: number, patch: Partial<CompletedWorkoutLog> = {}): CompletedWorkoutLog {
  return {
    id: `workout-${offset}`, workoutName: 'Lower body', completedAt: date(offset), startedAt: date(offset),
    weightUnit: 'kg', durationSeconds: 500, totalVolume: weight * 10,
    exercises: [{ exerciseId: 'lunges', sets: [{ reps: 10, weight }] }],
    ...patch,
  };
}

function session(dayOffset: number, patch: Partial<PlanSession> = {}): PlanSession {
  return {
    id: `2026-06-08-d${dayOffset}`, dayOffset, name: 'Full body', kind: 'strength', focusGroups: ['Legs', 'Chest'],
    estMinutes: 20, status: 'planned',
    exercises: [{ exerciseId: 'lunges', sets: 1, reps: 10, weight: 20, whyKey: 'coachWhyHold' }],
    ...patch,
  };
}

const plan = (sessions: PlanSession[], patch: Partial<CoachPlan> = {}): CoachPlan => ({
  sessions, weekStart: '2026-06-08', daysPerWeek: 3, weightUnit: 'kg', revision: 1,
  generatedAt: date(0), equipmentProfile: 'dumbbells', contextHash: 'fixture', ...patch,
});

test('real rebuild matches repeated sessions by calendar and focus, then quotes the new load from the actual log', () => {
  const history = [log(0, 20)];
  const before = generateNotebookWeek({ ...input, history }, day(2));
  const updated = [log(3, 30), ...history];
  const { plan: after, change } = rebuildNotebookWeek({ ...input, history: updated, revision: 2 }, before, day(3));
  assert.deepEqual(before.sessions.map((s) => s.dayOffset), [2, 4, 6]);
  assert.deepEqual(after.sessions.map((s) => s.dayOffset), [3, 5, 6]);
  assert.deepEqual(change?.schedule.map((row) => 'before' in row && 'after' in row && [row.kind, row.before.dayOffset, row.after.dayOffset]), [
    ['moved', 2, 3], ['moved', 4, 5],
  ]);
  assert.deepEqual(change?.schedule[0]?.reason, { kind: 'calendar', from: '2026-06-11', finishedOnOldDay: 0 });
  assert.deepEqual(change?.loads.find((row) => row.exerciseId === 'lunges'), {
    exerciseId: 'lunges', days: [3, 5, 6],
    before: { sets: 1, reps: 10, weight: 20, unset: false },
    after: { sets: 1, reps: 10, weight: 30, unset: false },
    whyKey: 'coachWhyHold',
    log: { id: 'workout-3', name: 'Lower body', date: '2026-06-11', weight: 30, reps: 10, workingSets: 1 },
  });
});

test('added and dropped sessions are not called moves when the focus changed, and calendar facts ignore tombstones', () => {
  const before = plan([session(1), session(4), session(5, { status: 'done' })]);
  const after = plan([session(4, { kind: 'recovery', name: 'Recovery', focusGroups: ['Core'] })], { daysPerWeek: 2 });
  const change = describeWeekChange({
    before, after, history: [log(1, 20), log(1, 50, { id: 'deleted', deletedAt: date(2) })],
    unit: 'kg', now: day(3), source: 'rebuild',
  });
  assert.deepEqual(change.schedule.map(({ kind, reason }) => ({ kind, reason })), [
    { kind: 'dropped', reason: { kind: 'calendar', from: '2026-06-11', finishedOnOldDay: 1 } },
    { kind: 'dropped', reason: { kind: 'frequency', before: 3, after: 2 } },
    { kind: 'added', reason: { kind: 'frequency', before: 3, after: 2 } },
  ]);
  assert.deepEqual(change.loads, []);
});

test('schedule cites history only where the same planner inputs without logs would change that result', () => {
  const before = plan([session(2)]);
  const after = plan([session(4, { kind: 'recovery', name: 'Recovery', focusGroups: ['Core'] })]);
  const base = { before, after, history: [log(0, 20)], unit: 'kg', now: day(2), source: 'rebuild' } as const;
  assert.deepEqual(describeWeekChange({ ...base, withoutHistory: before }).schedule.map(({ reason }) => reason),
    [{ kind: 'history', finished: 1 }, { kind: 'history', finished: 1 }]);
  assert.deepEqual(describeWeekChange({ ...base, withoutHistory: after }).schedule.map(({ reason }) => reason),
    [{ kind: 'schedule' }, { kind: 'schedule' }]);
});

test('a real high-load log replaces strength with recovery and cites history on both rows', () => {
  const before = generateNotebookWeek({ ...input, history: [] }, day(3));
  const history: CompletedWorkoutLog[] = [];
  for (let offset = 3; offset >= -3; offset--) {
    history.push(log(offset, 150, {
      durationSeconds: 7200,
      exercises: [{ exerciseId: 'lunges', sets: [{ reps: 5, weight: 150, rpe: 'hard' }] }],
    }));
  }
  for (let offset = -11; offset >= -67; offset -= 3) history.push(log(offset, 100, { durationSeconds: 2700 }));
  const { plan: after, change } = rebuildNotebookWeek({ ...input, history, revision: 2 }, before, day(3));
  assert.ok(after.sessions.some(({ kind }) => kind === 'recovery'));
  assert.ok(change?.schedule.some((row) => row.kind === 'added' && row.after.name.includes('Recovery')
    && row.reason.kind === 'history' && row.reason.finished === history.length));
  assert.ok(change?.schedule.some((row) => row.kind === 'dropped' && row.before.name.includes('Strength')
    && row.reason.kind === 'history' && row.reason.finished === history.length));
});

test('local completion during adaptation links the finished workout instead of dropping the planned session', () => {
  const before = plan([session(2), session(4)]);
  const after = plan([session(2, { status: 'done' }), session(5, { id: session(4).id })]);
  const completedWorkout = log(2, 20);
  const change = describeWeekChange({
    before, after, history: [completedWorkout], completedWorkout, unit: 'kg', now: day(2), source: 'adapt',
  });
  assert.deepEqual(change.completed, [{ session: { name: 'Full body', dayOffset: 2 }, workout: { id: 'workout-2', name: 'Lower body', date: '2026-06-10' } }]);
  assert.deepEqual(change.schedule, [{ kind: 'moved', before: { name: 'Full body', dayOffset: 4 },
    after: { name: 'Full body', dayOffset: 5 }, reason: { kind: 'schedule' } }]);
});

test('unit-only conversions, revision changes and new weeks are not fake progress', () => {
  const before = plan([session(2)]);
  const after = plan([session(2, { exercises: [{ ...session(2).exercises[0], weight: 44.09 }] })], { weightUnit: 'lb', revision: 2 });
  const base = { before, after, history: [], unit: 'kg', now: day(2), source: 'sync' } as const;
  assert.equal(hasWeekChanges(describeWeekChange(base)), false);
  const newWeek = describeWeekChange({ ...base, after: { ...after, weekStart: '2026-06-15' } });
  assert.equal(newWeek.newWeek, true);
  assert.deepEqual(newWeek.schedule, []);
  assert.deepEqual(newWeek.loads, []);
});

test('a load compares normalized units and never quotes a deleted, warm-up, or unrelated set or a remote cause', () => {
  const before = plan([session(2)]);
  const after = plan([session(2, { exercises: [{ ...session(2).exercises[0], weight: 55, whyKey: 'coachWhyLoadUp' }] })], { weightUnit: 'lb' });
  const history = [
    log(3, 100, { deletedAt: date(3) }),
    log(2, 100, { exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 18, weight: 100 }] }] }),
    log(1, 25, { exercises: [{ exerciseId: 'lunges', sets: [
      { reps: 4, weight: 30, kind: 'warmup' }, { reps: 8, weight: 55, weightUnit: 'lb' },
    ] }] }),
  ];
  const base = { before, after, history, unit: 'kg', now: day(2) } as const;
  const local = describeWeekChange({ ...base, source: 'rebuild' }).loads[0];
  assert.equal(local?.after.weight, 24.95);
  assert.equal(local?.whyKey, 'coachWhyLoadUp');
  assert.deepEqual(local?.log, { id: 'workout-1', name: 'Lower body', date: '2026-06-09', weight: 24.95, reps: 8, workingSets: 1 });
  const synced = describeWeekChange({ ...base, source: 'sync' }).loads[0];
  assert.equal(synced?.whyKey, null);
  assert.equal(synced?.log, undefined);
});
