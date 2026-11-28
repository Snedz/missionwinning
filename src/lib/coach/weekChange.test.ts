import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CompletedWorkoutLog } from '@/types';
import { buildCoachContextFromInputs } from './contextBuilder';
import { nextTargets } from './progression';
import type { CoachContext, CoachPlan, PlanSession } from './types';
import { describeCoachWeekChange, findWeekChangeWorkout } from './weekChange';

const exerciseId = 'goblet-squat';
const ctx: CoachContext = {
  ...buildCoachContextFromInputs({ equipment: 'dumbbells', history: [], daysPerWeek: 3, seedId: 'test' }),
};
const heavy: CompletedWorkoutLog = {
  id: 'heavier', workoutName: 'Legs', startedAt: '2026-11-24T10:00:00Z',
  completedAt: '2026-11-24T10:10:00Z', durationSeconds: 600, totalVolume: 275,
  exercises: [{ exerciseId, sets: [{ weight: 15, reps: 6, kind: 'warmup' }, { weight: 27.5, reps: 10 }] }],
};
const light = {
  ...heavy, id: 'older', completedAt: '2026-11-23T10:10:00Z',
  exercises: [{ exerciseId, sets: [{ weight: 22.5, reps: 8 }, { weight: 22.5, reps: 8 }] }],
};
const weekStart = '2026-11-23';
const strength = (dayOffset: number, history = [light]): PlanSession => ({
  id: weekStart + '-d' + dayOffset, dayOffset, kind: 'strength', name: 'Legs', focusGroups: ['Legs'],
  estMinutes: 25, status: 'planned', exercises: [
    { exerciseId, ...nextTargets(exerciseId, history, ctx.units, ctx.goalId, ctx.experience) },
  ],
});
const plan = (revision: number, sessions: PlanSession[]): CoachPlan => ({
  revision, sessions, weekStart, daysPerWeek: 3, generatedAt: '2026-11-23T12:00:00Z',
  contextHash: 'test', equipmentProfile: 'dumbbells',
});

test('a rebuild pairs same-day focus before moving other slots and cites the saved working set that affected the targets', () => {
  const before = plan(1, [strength(0), strength(2), { ...strength(4), kind: 'recovery' }]);
  const after = plan(2, [
    strength(2, [heavy, light]), strength(3, [heavy, light]), { ...strength(4), kind: 'conditioning' },
  ]);
  const change = describeCoachWeekChange(before, after, { ...ctx, history: [heavy, light] }, 'rebuild');
  assert.ok(change);
  assert.deepEqual(change.schedule.map((row) => row.kind), ['moved', 'dropped', 'added']);
  assert.deepEqual(change.schedule[0], {
    kind: 'moved', before: { name: 'Legs', kind: 'strength', focusGroups: ['Legs'], dayOffset: 0 },
    after: { name: 'Legs', kind: 'strength', focusGroups: ['Legs'], dayOffset: 3 },
  });
  assert.deepEqual(change.loads.map(({ session }) => session.dayOffset), [3, 2]);
  const [row] = change.loads;
  assert.deepEqual(row.savedSet, { workoutId: 'heavier', completedAt: heavy.completedAt, weight: 27.5, reps: 10 });
  const { weight: oldWeight, sets: oldSets, reps: oldReps } = before.sessions[0].exercises[0];
  const { weight, sets, reps } = after.sessions[0].exercises[0];
  assert.deepEqual(row.before, { weight: oldWeight, sets: oldSets, reps: oldReps, unset: false });
  assert.deepEqual(row.after, { weight, sets, reps, unset: false });
  assert.notEqual(row.before.weight, row.after.weight);
  assert.equal(findWeekChangeWorkout([heavy], exerciseId, row.savedSet!), heavy);
  assert.equal(findWeekChangeWorkout([{ ...heavy, deletedAt: heavy.completedAt }], exerciseId, row.savedSet!), undefined);
  assert.equal(findWeekChangeWorkout([{ ...heavy, exercises: light.exercises }], exerciseId, row.savedSet!), undefined);
});

test('unchanged plans, reordered arrays and week rollovers do not invent a receipt', () => {
  const before = plan(1, [strength(0), strength(2)]);
  assert.equal(describeCoachWeekChange(before, plan(2, [...before.sessions].reverse()), ctx, 'rebuild'), null);
  assert.equal(describeCoachWeekChange(before, plan(1, [strength(3)]), ctx, 'rebuild'), null);
  assert.equal(describeCoachWeekChange(before, { ...plan(2, [strength(3)]), weekStart: '2026-11-30' }, ctx, 'rebuild'), null);
});

test('a rebuilt slot can explain a changed prescription from its prior completed session', () => {
  const before = plan(1, [{ ...strength(2), status: 'done' }]);
  const after = plan(2, [strength(2, [heavy, light])]);
  const change = describeCoachWeekChange(before, after, { ...ctx, history: [heavy, light] }, 'rebuild');
  assert.deepEqual(change?.schedule.map((row) => row.kind), ['added']);
  assert.equal(change?.loads[0].savedSet?.workoutId, heavy.id);
});

test('adaptation preserves session identity, distinguishing a move, a miss and a completion', () => {
  const before = plan(1, [strength(0), strength(2), strength(4)]);
  const after = plan(4, [
    { ...strength(0), status: 'missed' }, { ...strength(2), dayOffset: 3 }, { ...strength(4), status: 'done' },
  ]);
  const change = describeCoachWeekChange(before, after, ctx, 'adapt');
  assert.deepEqual(change?.schedule.map((row) => row.kind), ['completed', 'dropped', 'moved']);
  assert.equal(change?.schedule.find((row) => row.kind === 'dropped')?.missed, true);
  assert.deepEqual(change?.loads, []);
});

test('volume adjustment, tombstones and warmup-only latest logs cannot claim a causal set', () => {
  const before = plan(1, [strength(2)]);
  const withHeavy = strength(2, [heavy, light]);
  const adjusted = { ...withHeavy, exercises: withHeavy.exercises.map((e) => ({ ...e, sets: 9 })) };
  assert.equal(describeCoachWeekChange(before, plan(2, [adjusted]), { ...ctx, history: [heavy, light] }, 'adapt')?.loads[0].savedSet, undefined);
  assert.equal(describeCoachWeekChange(before, plan(2, [withHeavy]), {
    ...ctx, history: [{ ...heavy, deletedAt: heavy.completedAt }, light],
  }, 'rebuild')?.loads[0].savedSet, undefined);
  const warmup = { ...heavy, exercises: [{ exerciseId, sets: heavy.exercises[0].sets.slice(0, 1) }] };
  assert.equal(describeCoachWeekChange(before, plan(2, [strength(2, [warmup, light])]), {
    ...ctx, history: [warmup, light],
  }, 'rebuild')?.loads[0].savedSet, undefined);
});
