import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { hasComposeExercises, mergePersistedWorkoutState } from './workoutRecovery';

function compose(name: string, completed = false): ActiveWorkout {
  return {
    workoutName: name,
    startedAt: new Date().toISOString(),
    exercises: [
      {
        exerciseId: 'barbell-squat',
        sets: [{ id: 's1', reps: 5, weight: 120, completed }],
      },
    ],
  };
}

function log(): CompletedWorkoutLog {
  const now = Date.now();
  return {
    id: 'h1',
    workoutName: 'Legs',
    startedAt: new Date(now - 3_600_000).toISOString(),
    completedAt: new Date(now - 1_800_000).toISOString(),
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'barbell-squat',
        sets: [{ reps: 5, weight: 100 }],
      },
    ],
  };
}

test('mergePersistedWorkoutState', async (t) => {
  await t.test('keeps an in-memory compose when persist returns null', () => {
    const current = compose('Just Go');
    const next = mergePersistedWorkoutState(
      { savedWorkouts: [], workoutHistory: [], activeWorkout: null },
      { savedWorkouts: [], workoutHistory: [], activeWorkout: current }
    );
    assert.equal(next.activeWorkout?.workoutName, 'Just Go');
    assert.ok(hasComposeExercises(next.activeWorkout));
  });

  await t.test('keeps an in-memory compose when persist is missing the session', () => {
    const current = compose('Just Go');
    const next = mergePersistedWorkoutState(
      { savedWorkouts: [], workoutHistory: [log()] },
      { savedWorkouts: [], workoutHistory: [], activeWorkout: current }
    );
    assert.equal(next.activeWorkout?.workoutName, 'Just Go');
    assert.equal(next.workoutHistory?.[0]?.id, 'h1');
  });

  await t.test('logged work on disk wins over a no-sets compose', () => {
    const disk = compose('Yesterday', true);
    const next = mergePersistedWorkoutState(
      { savedWorkouts: [], workoutHistory: [], activeWorkout: disk },
      { savedWorkouts: [], workoutHistory: [], activeWorkout: compose('Just Go') }
    );
    assert.equal(next.activeWorkout?.workoutName, 'Yesterday');
    assert.equal(next.activeWorkout?.exercises[0]?.sets[0]?.completed, true);
  });

  await t.test('logged work in memory wins over a persisted null', () => {
    const live = compose('Live', true);
    const next = mergePersistedWorkoutState(
      { savedWorkouts: [], workoutHistory: [], activeWorkout: null },
      { savedWorkouts: [], workoutHistory: [], activeWorkout: live }
    );
    assert.equal(next.activeWorkout?.workoutName, 'Live');
    assert.equal(next.activeWorkout?.exercises[0]?.sets[0]?.completed, true);
  });

  await t.test('an empty persisted session does not beat a live compose', () => {
    const empty = {
      workoutName: 'Empty',
      startedAt: new Date().toISOString(),
      exercises: [],
    } as ActiveWorkout;
    const next = mergePersistedWorkoutState(
      { savedWorkouts: [], workoutHistory: [], activeWorkout: empty },
      { savedWorkouts: [], workoutHistory: [], activeWorkout: compose('Just Go') }
    );
    assert.equal(next.activeWorkout?.workoutName, 'Just Go');
  });
});
