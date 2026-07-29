import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  findNextSet,
  getLastPerformanceForSet,
  getLastSessionSets,
  resolveSetInput,
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

describe('resolveSetInput', () => {
  const base = { defaultReps: 5, defaultWeight: 85 };

  it('the coach prescription wins over the logger suggestion', () => {
    // The bug: a strength plan of 3x5 @ 85 used to prefill as 6 reps, because
    // suggestNextSetTarget assumed 8-12 for everyone and ran first.
    const out = resolveSetInput({
      ...base,
      prescribed: true,
      suggestion: { reps: 6, weight: 85 },
      lastPerformance: { reps: 6, weight: 85 },
    });
    assert.deepEqual(out, { reps: 5, weight: 85 });
  });

  it('a deload prescription is not talked out of', () => {
    const out = resolveSetInput({
      defaultReps: 5,
      defaultWeight: 90,
      prescribed: true,
      suggestion: { reps: 5, weight: 100 },
    });
    assert.equal(out.weight, 90, 'the back-off weight must survive');
  });

  it('freestyle work still gets the suggestion', () => {
    const out = resolveSetInput({
      ...base,
      prescribed: false,
      suggestion: { reps: 9, weight: 80 },
      lastPerformance: { reps: 8, weight: 80 },
    });
    assert.deepEqual(out, { reps: 9, weight: 80 });
  });

  it('what the athlete typed always wins, prescribed or not', () => {
    const manual = { reps: 3, weight: 120 };
    assert.deepEqual(
      resolveSetInput({ ...base, manual, prescribed: true, suggestion: { reps: 9, weight: 70 } }),
      manual
    );
    assert.deepEqual(
      resolveSetInput({ ...base, manual, prescribed: false, suggestion: { reps: 9, weight: 70 } }),
      manual
    );
  });

  it('falls back through last performance to the template default', () => {
    assert.deepEqual(
      resolveSetInput({ ...base, suggestion: null, lastPerformance: { reps: 7, weight: 75 } }),
      { reps: 7, weight: 75 }
    );
    assert.deepEqual(resolveSetInput({ ...base, suggestion: null, lastPerformance: null }), {
      reps: 5,
      weight: 85,
    });
  });
});
