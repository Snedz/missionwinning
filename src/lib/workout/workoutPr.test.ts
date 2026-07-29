import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getBestPriorSet, isPersonalRecord } from '@/lib/workout/workoutPr';
import type { CompletedWorkoutLog } from '@/types';

const history: CompletedWorkoutLog[] = [
  {
    id: '1',
    workoutName: 'Test',
    startedAt: '2025-01-01T10:00:00Z',
    completedAt: '2025-01-01T10:00:00Z',
    durationSeconds: 1800,
    totalVolume: 800,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 8, weight: 100 }],
      },
    ],
  },
];

describe('workoutPr', () => {
  it('returns null when no prior sets', () => {
    assert.equal(getBestPriorSet('squat', history), null);
  });

  it('detects PR when beating prior e1RM', () => {
    // Clear of the prior 8 × 100 (estimates 124): 5 × 125 estimates 141.
    assert.equal(isPersonalRecord('bench-press', 5, 125, history), true);
    assert.equal(isPersonalRecord('bench-press', 8, 100, history), false);
  });

  it('an equivalent performance is not a record', () => {
    // 5 × 110 and the prior 8 × 100 both estimate 124 — the same strength expressed
    // two ways. Uncapped Epley separated them by 1 kg and fired a PR chip for it;
    // celebrating that is congratulating the athlete for rounding.
    assert.equal(isPersonalRecord('bench-press', 5, 110, history), false);
  });

  it('warmup sets do not trigger PR', () => {
    assert.equal(isPersonalRecord('bench-press', 10, 120, history, 'warmup'), false);
  });

  it('drop sets do not trigger PR', () => {
    assert.equal(isPersonalRecord('bench-press', 10, 120, history, 'drop'), false);
  });
});
