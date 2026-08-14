import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveActiveEmptyStart } from './resolveActiveEmptyStart.ts';
import type { CompletedWorkoutLog } from '@/types';

function logWithSets(): CompletedWorkoutLog {
  return {
    id: 'log-1',
    workoutName: 'Past',
    startedAt: '2026-08-01T10:00:00.000Z',
    completedAt: '2026-08-01T11:00:00.000Z',
    exercises: [
      {
        exerciseId: 'bodyweight-squat',
        sets: [
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
        ],
      },
    ],
    durationSeconds: 1200,
    totalVolume: 0,
  };
}

describe('resolveActiveEmptyStart', () => {
  it('cold history → empty freestyle', () => {
    const r = resolveActiveEmptyStart([]);
    assert.equal(r.kind, 'empty');
  });

  it('with history → last session copy, not Just Go', () => {
    const r = resolveActiveEmptyStart([logWithSets()]);
    assert.equal(r.kind, 'repeat_last');
    if (r.kind !== 'repeat_last') return;
    assert.equal(r.name, 'Past');
    assert.equal(r.exercises[0]!.exerciseId, 'bodyweight-squat');
    assert.equal(r.exercises[0]!.sets.length, 2);
  });
});
