import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExerciseBenchmark, estimateOneRepMax } from '@/lib/benchmarks';
import type { CompletedWorkoutLog, SetKind } from '@/types';

/**
 * `.174` pointed /benchmarks at the one shared estimator. Before that it re-implemented
 * Epley inline, counted warmups and failure sets as evidence, had no rep cap, and
 * charted deleted sessions. These pin each of those four.
 */

function log(
  daysAgo: number,
  sets: { reps: number; weight: number; kind?: SetKind }[],
  deletedAt: string | null = null
): CompletedWorkoutLog {
  const at = new Date(Date.now() - daysAgo * 86_400_000).toISOString();
  return {
    id: `w-${daysAgo}`,
    workoutName: 'S',
    startedAt: at,
    completedAt: at,
    durationSeconds: 3600,
    deletedAt,
    exercises: [{ exerciseId: 'bench-press', sets }],
    totalVolume: sets.reduce((s, x) => s + x.reps * x.weight, 0),
  };
}

test('estimateOneRepMax keeps its zero-for-invalid contract', () => {
  assert.equal(estimateOneRepMax(0, 5), 0);
  assert.equal(estimateOneRepMax(100, 0), 0);
  // Above the 12-rep cap the estimator declines; callers here expect 0, not null.
  assert.equal(estimateOneRepMax(40, 20), 0);
});

test('estimateOneRepMax agrees with the shared engine', () => {
  assert.equal(estimateOneRepMax(100, 5), 113, 'Brzycki at 5 reps');
  assert.equal(estimateOneRepMax(140, 1), 140, 'a single is its own max');
});

test('a deleted session is not charted', () => {
  const stats = buildExerciseBenchmark('bench-press', [
    log(10, [{ reps: 5, weight: 200 }], new Date().toISOString()),
    log(2, [{ reps: 5, weight: 100 }]),
  ]);
  assert.equal(stats?.timeline.length, 1, 'only the live session appears');
  assert.equal(stats?.bestEstimated1RM, 113, 'the tombstoned 200 kg must not set the best');
});

test('warmups and failure sets are not evidence of strength', () => {
  const stats = buildExerciseBenchmark('bench-press', [
    log(2, [
      { reps: 1, weight: 200, kind: 'warmup' },
      { reps: 1, weight: 190, kind: 'failure' },
      { reps: 5, weight: 100 },
    ]),
  ]);
  assert.equal(stats?.bestEstimated1RM, 113, 'the 200 kg warmup must not become the record');
  assert.equal(stats?.totalSets, 3, 'but all three were still logged');
});

test('a session of only >12-rep sets contributes no strength point', () => {
  const stats = buildExerciseBenchmark('bench-press', [
    log(4, [{ reps: 20, weight: 40 }]),
    log(2, [{ reps: 5, weight: 100 }]),
  ]);
  assert.equal(stats?.timeline.length, 1, 'the endurance session is not a strength data point');
});
