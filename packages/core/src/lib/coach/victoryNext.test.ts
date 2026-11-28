import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import { generateNotebookWeek } from './notebookWeek';
import { victoryNextTargets } from './victoryNext';

function log(id: string, day: number, exercises: CompletedWorkoutLog['exercises']): CompletedWorkoutLog {
  const completedAt = new Date(2026, 5, day, 12).toISOString();
  return {
    id, workoutName: 'Quick workout', completedAt, startedAt: completedAt, durationSeconds: 900,
    totalVolume: 0, weightUnit: 'kg', exercises,
  };
}

test('uses the saved receipt, ignores warmups and cannot cite a newer or deleted workout', () => {
  const older = log('earlier', 9, [{ exerciseId: 'push-ups', sets: [{ reps: 5, weight: 0, rpe: 'hard' }] }]);
  const receipt = log('receipt', 10, [{ exerciseId: 'push-ups', sets: [
    { reps: 20, weight: 0, kind: 'warmup' },
    { reps: 4, weight: 0, rpe: 'med' },
  ] }]);
  const later = log('later', 11, [{ exerciseId: 'push-ups', sets: [{ reps: 18, weight: 0 }] }]);
  const deleted = { ...older, id: 'deleted', completedAt: receipt.completedAt, deletedAt: later.completedAt };
  assert.deepEqual(victoryNextTargets(receipt, [older, later, deleted, receipt], 'metric'), [{
    exerciseId: 'push-ups', source: 'progression', unit: 'kg',
    target: { sets: 1, reps: 5, weight: 0, whyKey: 'coachWhyRepProgress' },
  }]);
  assert.deepEqual(victoryNextTargets(deleted, [older, deleted], 'metric'), []);
});

test('mixed-unit working sets match the real next session target and reason', () => {
  const receipt = log('receipt', 10, [{ exerciseId: 'lunges', sets: [
    { reps: 6, weight: 55, weightUnit: 'lb', rpe: 'med' },
    { reps: 6, weight: 25, weightUnit: 'kg', rpe: 'med' },
  ] }]);
  for (const units of ['metric', 'imperial'] as const) {
    const plan = generateNotebookWeek({
      equipment: 'dumbbells', daysPerWeek: 3, units, history: [receipt], revision: 1,
    }, new Date(receipt.completedAt));
    const planned = plan.sessions[0].exercises.find((exercise) => exercise.exerciseId === 'lunges');
    assert.ok(planned, 'The real planner must select logged lunges for this fixture');
    const { exerciseId, ...target } = planned;
    assert.deepEqual(victoryNextTargets(receipt, [], units), [{
      exerciseId, source: 'progression', unit: units === 'metric' ? 'kg' : 'lb', target,
    }]);
    assert.equal(target.weight, units === 'metric' ? 25 : 55);
  }
});

test('uses only a matching next-session target as fallback and does not convert timed work to reps', () => {
  const receipt = log('receipt', 10, [
    { exerciseId: 'lunges', sets: [{ reps: 6, weight: 5, kind: 'warmup' }] },
    { exerciseId: 'plank', sets: [{ reps: 0, weight: 0, durationSeconds: 20 }] },
  ]);
  const plan = generateNotebookWeek({
    equipment: 'dumbbells', daysPerWeek: 3, units: 'metric', history: [receipt], revision: 1,
  }, new Date(receipt.completedAt));
  const target = plan.sessions[0].exercises.find((exercise) => exercise.exerciseId === 'lunges');
  assert.ok(target);
  assert.deepEqual(victoryNextTargets(receipt, [], 'imperial', plan), [
    { exerciseId: 'lunges', source: 'plan', target, unit: 'kg' },
    { exerciseId: 'plank', source: 'unavailable', reason: 'duration' },
  ]);
  assert.deepEqual(victoryNextTargets(receipt, [], 'metric')[0], {
    exerciseId: 'lunges', source: 'unavailable', reason: 'working-sets',
  });
});
