import assert from 'node:assert/strict';
import { test } from 'node:test';
import { victoryNextTargets, type VictoryNextContext } from '@/lib/coach/victoryNext';
import type { CoachPlan, PlanSession } from '@/lib/coach/types';
import type { CompletedWorkoutLog } from '@/types';

const ctx = { plan: null, goalId: 'general', experience: 'beginner', units: 'metric' } satisfies VictoryNextContext;
const at = (day: number) => new Date(2026, 10, day, 12).toISOString();
const log = (exercises: CompletedWorkoutLog['exercises'], day = 25): CompletedWorkoutLog => ({
  exercises, id: String(day), workoutName: 'Quick Log', startedAt: at(day), completedAt: at(day),
  durationSeconds: 30, totalVolume: 0,
});
const set = (reps: number, weight: number) => ({ reps, weight });
const push = { exerciseId: 'push-ups', sets: [set(4, 0)] };
const lunge = { exerciseId: 'lunges', sets: [set(6, 30)] };

test('uses Mission Coach progression from saved sets, not a hardcoded increase', () => {
  const receipt = log([push, lunge]);
  const result = victoryNextTargets(receipt, [receipt], ctx);
  assert.deepEqual(result.map(({ exerciseId, source, target: { sets, reps, weight } }) => (
    { exerciseId, source, sets, reps, weight }
  )), [
    { exerciseId: 'push-ups', source: 'progression', sets: 1, reps: 5, weight: 0 },
    { exerciseId: 'lunges', source: 'progression', sets: 1, reps: 7, weight: 30 },
  ]);
});

test('prefers the earliest real upcoming prescription for each logged exercise', () => {
  const pushTarget = { exerciseId: 'push-ups', sets: 3, reps: 8, weight: 0, whyKey: 'push' };
  const lungeTarget = { exerciseId: 'lunges', sets: 2, reps: 10, weight: 20, whyKey: 'lunge' };
  const slot = (dayOffset: number, status: PlanSession['status'], exercises: PlanSession['exercises']): PlanSession => ({
    id: String(dayOffset), dayOffset, name: 'Strength', kind: 'strength', focusGroups: [], estMinutes: 20, status, exercises,
  });
  const plan: CoachPlan = {
    revision: 1, contextHash: 'week', equipmentProfile: 'dumbbells', daysPerWeek: 3,
    weekStart: '2026-11-23', generatedAt: at(23),
    sessions: [
      slot(6, 'planned', [{ ...pushTarget, reps: 99 }]),
      slot(0, 'planned', [{ ...pushTarget, reps: 80 }]),
      slot(2, 'done', [{ ...pushTarget, reps: 90 }]),
      slot(3, 'swapped', [pushTarget, { ...lungeTarget, exerciseId: 'bench-press' }]),
      slot(4, 'missed', [{ ...lungeTarget, weight: 999 }]),
      slot(5, 'planned', [lungeTarget]),
    ],
  };
  const receipt = log([push, lunge]);
  assert.deepEqual(victoryNextTargets(receipt, [], { ...ctx, plan }).map((row) => row.target), [pushTarget, lungeTarget]);
  const switched = { ...ctx, units: 'imperial' as const };
  const stampedLunge = { ...lungeTarget, weightUnits: 'metric' as const };
  const mixedPlan = { ...plan, sessions: [...plan.sessions.slice(0, -1), slot(5, 'planned', [stampedLunge])] };
  assert.deepEqual(victoryNextTargets(receipt, [], { ...switched, plan: mixedPlan }).map((row) => row.weightUnits), [
    undefined, 'metric',
  ]);
  assert.equal(victoryNextTargets(receipt, [], switched)[1]?.weightUnits, 'imperial');
  assert.deepEqual(
    victoryNextTargets(receipt, [], { ...ctx, plan: { ...plan, weekStart: '2026-11-16' } }),
    victoryNextTargets(receipt, [], ctx),
  );
});

test('omits unsupported rows and warmups rather than seeding guessed targets', () => {
  const receipt = log([
    { ...push, sets: [{ reps: 4, weight: 0, kind: 'warmup' }] },
    { exerciseId: 'plank', sets: [{ reps: 40, weight: 0, durationSeconds: 40 }] },
    { exerciseId: 'shrimp-squat-reg', sets: [{ reps: 4, weight: 0 }] },
    { exerciseId: 'bench-press', sets: [{ reps: 0, weight: 20 }] },
    { exerciseId: 'custom-unknown', sets: [{ reps: 40, weight: 0, durationSeconds: 40 }] },
  ]);
  assert.deepEqual(victoryNextTargets(receipt, [], ctx), []);
  assert.deepEqual(victoryNextTargets({ ...log([push]), deletedAt: at(25) }, [], ctx), []);
});

test('deduplicates exercises and ignores future, deleted, and duplicate history', () => {
  const receipt = log([push, { ...push, sets: [{ reps: 6, weight: 0 }] }]);
  const deleted = { ...log([push], 24), deletedAt: at(24) };
  const future = log([{ ...push, sets: [{ reps: 99, weight: 0 }] }], 26);
  const rows = victoryNextTargets(receipt, [future, deleted, receipt], ctx);
  assert.deepEqual(rows, victoryNextTargets(receipt, [], ctx));
  assert.deepEqual(rows.map(({ target }) => [target.sets, target.reps]), [[2, 6]]);
});
