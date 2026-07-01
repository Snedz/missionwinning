import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getBestPriorSet, isPersonalRecord } from '@/lib/workoutPr';
import type { CompletedWorkoutLog } from '@/types';

const history: CompletedWorkoutLog[] = [
  {
    id: '1',
    workoutName: 'Test',
    completedAt: '2025-01-01T10:00:00Z',
    totalVolume: 800,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ id: 's1', reps: 8, weight: 100, completed: true }],
      },
    ],
  },
];

describe('workoutPr', () => {
  it('returns null when no prior sets', () => {
    assert.equal(getBestPriorSet('squat', history), null);
  });

  it('detects PR when beating prior e1RM', () => {
    assert.equal(isPersonalRecord('bench-press', 5, 110, history), true);
    assert.equal(isPersonalRecord('bench-press', 8, 100, history), false);
  });

  it('first logged set is a PR', () => {
    assert.equal(isPersonalRecord('squat', 5, 80, history), true);
  });
});
