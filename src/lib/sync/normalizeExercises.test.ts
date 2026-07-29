import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  flattenExercises,
  groupFlatSets,
  isFlatSetArray,
  normalizeCloudExercises,
  rpeCategoryToNumber,
  rpeNumberToCategory,
  setKindToKind,
  type FlatSetRow,
} from '@/lib/sync/normalizeExercises';
import { sessionLoad } from '@/lib/coach/load';
import type { CompletedWorkoutLog } from '@/types';

function flat(over: Partial<FlatSetRow> & { exerciseId: string }): FlatSetRow {
  return { reps: 5, weight: 100, setIndex: 0, ...over };
}

test('Android RPE 6-10 maps onto the categories web reasons about', () => {
  assert.equal(rpeNumberToCategory(6), 'easy');
  assert.equal(rpeNumberToCategory(7), 'med');
  assert.equal(rpeNumberToCategory(8), 'med');
  assert.equal(rpeNumberToCategory(9), 'hard');
  assert.equal(rpeNumberToCategory(10), 'hard');
  assert.equal(rpeNumberToCategory(null), undefined);
  assert.equal(rpeNumberToCategory(undefined), undefined);
  assert.equal(rpeNumberToCategory(NaN), undefined);
});

test('the reverse map round-trips stably', () => {
  for (const n of [6, 7, 9]) {
    assert.equal(rpeCategoryToNumber(rpeNumberToCategory(n)), n, `${n} should survive`);
  }
  assert.equal(rpeCategoryToNumber(undefined), undefined);
});

test('set kinds pass through, "normal" and unknowns are dropped', () => {
  assert.equal(setKindToKind('warmup'), 'warmup');
  assert.equal(setKindToKind('failure'), 'failure');
  assert.equal(setKindToKind('drop'), 'drop');
  assert.equal(setKindToKind('normal'), undefined, 'web omits normal');
  assert.equal(setKindToKind('nonsense'), undefined, 'never guess');
});

test('flat detection does not misfire on the nested shape', () => {
  assert.equal(isFlatSetArray([flat({ exerciseId: 'bench-press' })]), true);
  assert.equal(isFlatSetArray([{ exerciseId: 'bench-press', sets: [] }]), false);
  assert.equal(isFlatSetArray([]), false);
  assert.equal(isFlatSetArray(null), false);
});

test('a superset keeps its exercise order and per-exercise set order', () => {
  const grouped = groupFlatSets([
    flat({ exerciseId: 'bench-press', setIndex: 0, weight: 100 }),
    flat({ exerciseId: 'row', setIndex: 0, weight: 60 }),
    flat({ exerciseId: 'bench-press', setIndex: 1, weight: 105 }),
    flat({ exerciseId: 'row', setIndex: 1, weight: 62.5 }),
  ]);
  assert.deepEqual(grouped.map((e) => e.exerciseId), ['bench-press', 'row']);
  assert.deepEqual(grouped[0].sets.map((s) => s.weight), [100, 105]);
  assert.deepEqual(grouped[1].sets.map((s) => s.weight), [60, 62.5]);
});

test('out-of-order setIndex is sorted, not preserved', () => {
  const grouped = groupFlatSets([
    flat({ exerciseId: 'squat', setIndex: 2, reps: 3 }),
    flat({ exerciseId: 'squat', setIndex: 0, reps: 5 }),
    flat({ exerciseId: 'squat', setIndex: 1, reps: 4 }),
  ]);
  assert.deepEqual(grouped[0].sets.map((s) => s.reps), [5, 4, 3]);
});

test('normalize is the identity on rows web already wrote', () => {
  const nested = [
    { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100, kind: 'warmup' as const, rpe: 'hard' as const }] },
  ];
  assert.deepEqual(normalizeCloudExercises(nested), nested);
});

test('garbage becomes an empty session rather than a thrown engine', () => {
  assert.deepEqual(normalizeCloudExercises(null), []);
  assert.deepEqual(normalizeCloudExercises('nope'), []);
  assert.deepEqual(normalizeCloudExercises([{ junk: true }]), []);
});

/**
 * The bug this module exists for: before `.174` an Android-synced session read as
 * zero working sets on web, so it vanished from load, debrief and PRs.
 */
test('a normalized Android session counts the same as its web-logged twin', () => {
  const androidRows: FlatSetRow[] = [
    flat({ exerciseId: 'bench-press', setIndex: 0, reps: 5, weight: 100, rpe: 9, setKind: 'normal' }),
    flat({ exerciseId: 'bench-press', setIndex: 1, reps: 5, weight: 100, rpe: 9, setKind: 'normal' }),
  ];
  const base = {
    id: 'w1',
    workoutName: 'Push',
    startedAt: '2026-07-29T10:00:00Z',
    completedAt: '2026-07-29T11:00:00Z',
    durationSeconds: 3600,
    deletedAt: null,
    totalVolume: 1000,
  };

  const fromAndroid: CompletedWorkoutLog = { ...base, exercises: normalizeCloudExercises(androidRows) };
  const fromWeb: CompletedWorkoutLog = {
    ...base,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 5, weight: 100, rpe: 'hard' },
          { reps: 5, weight: 100, rpe: 'hard' },
        ],
      },
    ],
  };

  const a = sessionLoad(fromAndroid);
  assert.equal(a.workingSets, 2, 'the Android session must not read as zero sets');
  assert.deepEqual(a, sessionLoad(fromWeb), 'both platforms must produce the same load');
});

test('the un-normalized flat shape is exactly what used to break', () => {
  const broken: CompletedWorkoutLog = {
    id: 'w2',
    workoutName: 'Push',
    startedAt: '2026-07-29T10:00:00Z',
    completedAt: '2026-07-29T11:00:00Z',
    durationSeconds: 3600,
    deletedAt: null,
    totalVolume: 1000,
    // Cast mirrors what the DB actually handed the engines pre-fix.
    exercises: [flat({ exerciseId: 'bench-press' })] as unknown as CompletedWorkoutLog['exercises'],
  };
  assert.equal(sessionLoad(broken).workingSets, 0, 'documents the defect this module fixes');
});

test('flatten gives Android back the shape its installed builds expect', () => {
  const rows = flattenExercises('w1', '2026-07-29T11:00:00Z', [
    { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100, rpe: 'hard' }, { reps: 5, weight: 100 }] },
  ]);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((r) => r.setIndex), [0, 1]);
  assert.equal(rows[0].rpe, 9);
  assert.equal(rows[1].rpe, null, 'an unrated set stays unrated');
  assert.equal(rows[0].setKind, 'normal');
  assert.notEqual(rows[0].id, rows[1].id, 'ids must be unique');
});

test('flatten and group are inverses over the fields Android carries', () => {
  const original = [
    {
      exerciseId: 'bench-press',
      sets: [
        { reps: 5, weight: 100, rpe: 'hard' as const },
        { reps: 8, weight: 80, kind: 'warmup' as const },
      ],
    },
  ];
  const round = groupFlatSets(flattenExercises('w', '2026-07-29T11:00:00Z', original));
  assert.deepEqual(round, original);
});
