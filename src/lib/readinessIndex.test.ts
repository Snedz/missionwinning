import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import {
  computeReadinessFromHistory,
  computeReadinessIndex,
  resetReadinessCatalogSeed,
} from '@/lib/readinessIndex';
import { resetExerciseMuscleMap, seedExerciseMuscleMap } from '@/lib/exerciseMuscleMap';

function log(
  completedAt: string,
  exercises: CompletedWorkoutLog['exercises']
): CompletedWorkoutLog {
  return {
    id: `log-${completedAt}`,
    workoutName: 'Test',
    startedAt: completedAt,
    completedAt,
    durationSeconds: 60,
    exercises,
    totalVolume: 100,
  };
}

describe('readinessIndex', () => {
  beforeEach(() => {
    resetExerciseMuscleMap();
    resetReadinessCatalogSeed();
  });

  it('uses stored muscleGroups without catalog seed', () => {
    const history = [
      log(new Date().toISOString(), [
        {
          exerciseId: 'unknown-old-id',
          sets: [{ reps: 5, weight: 100 }],
          muscleGroups: ['Chest', 'Arms'],
        },
      ]),
    ];
    const readiness = computeReadinessFromHistory(history);
    assert.equal(readiness.Chest.days, 0);
    assert.equal(readiness.Arms.days, 0);
    assert.equal(readiness.Legs.days, 99);
  });

  it('falls back to seeded catalog when muscleGroups missing', () => {
    seedExerciseMuscleMap([
      { id: 'bench-press', muscleGroups: ['Chest', 'Arms'] },
    ]);
    const history = [
      log(new Date().toISOString(), [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] },
      ]),
    ];
    const readiness = computeReadinessFromHistory(history);
    assert.equal(readiness.Chest.days, 0);
    assert.equal(readiness.Back.days, 99);
  });

  it('computeReadinessIndex lazy-loads catalog for old logs', async () => {
    const history = [
      log(new Date().toISOString(), [
        { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] },
      ]),
    ];
    const readiness = await computeReadinessIndex(history);
    assert.ok(readiness.Chest.days < 99 || readiness.Arms.days < 99 || readiness.Shoulders.days < 99);
  });
});
