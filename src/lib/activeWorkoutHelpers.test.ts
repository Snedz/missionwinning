import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  findNextSet,
  getLastPerformanceForSet,
  getLastSessionSets,
  sessionSetStats,
  setInputKey,
} from './activeWorkoutHelpers.ts';
import type { CompletedWorkoutLog } from '@/types';

function historyWith(
  exerciseId: string,
  sets: { reps: number; weight: number }[]
): CompletedWorkoutLog[] {
  return [
    {
      id: 'h1',
      workoutName: 'Past',
      startedAt: '2026-07-01T10:00:00Z',
      completedAt: '2026-07-01T11:00:00Z',
      durationSeconds: 3600,
      totalVolume: 100,
      exercises: [
        {
          exerciseId,
          sets: sets.map((s) => ({ ...s, kind: 'normal' as const })),
        },
      ],
    },
  ];
}

describe('activeWorkoutHelpers', () => {
  it('findNextSet returns first incomplete set', () => {
    const exercises = [
      {
        sets: [
          { completed: true },
          { completed: true },
        ],
      },
      {
        sets: [{ completed: true }, { completed: false }],
      },
    ];
    assert.deepEqual(findNextSet(exercises), { exIdx: 1, setIdx: 1 });
  });

  it('findNextSet returns null when all complete', () => {
    assert.equal(findNextSet([{ sets: [{ completed: true }] }]), null);
  });

  it('getLastSessionSets finds most recent matching exercise', () => {
    const hist = historyWith('squats', [
      { reps: 5, weight: 100 },
      { reps: 5, weight: 105 },
    ]);
    const sets = getLastSessionSets(hist, 'squats');
    assert.equal(sets?.length, 2);
    assert.equal(sets?.[1].weight, 105);
    assert.equal(getLastSessionSets(hist, 'missing'), null);
  });

  it('getLastPerformanceForSet matches set index then falls back', () => {
    const hist = historyWith('bench-press', [
      { reps: 8, weight: 60 },
      { reps: 6, weight: 65 },
    ]);
    assert.deepEqual(getLastPerformanceForSet(hist, 'bench-press', 0), {
      reps: 8,
      weight: 60,
    });
    assert.deepEqual(getLastPerformanceForSet(hist, 'bench-press', 5), {
      reps: 6,
      weight: 65,
    });
    assert.equal(getLastPerformanceForSet(hist, 'none', 0), null);
  });

  it('setInputKey is stable', () => {
    assert.equal(setInputKey(2, 3), '2-3');
  });

  it('sessionSetStats counts completed, total, and hard RPE', () => {
    const stats = sessionSetStats([
      {
        sets: [
          { completed: true, rpe: 'easy' },
          { completed: true, rpe: 'hard' },
          { completed: false },
        ],
      },
      {
        sets: [{ completed: true, rpe: 'hard' }],
      },
    ]);
    assert.deepEqual(stats, { completed: 3, total: 4, hardCount: 2 });
  });
});
