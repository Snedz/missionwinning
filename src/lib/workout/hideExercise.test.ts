/**
 * Hide this exercise from the library. Empty / missing / already-hidden
 * invents nothing. History / PRs / notes stay. Do not auto-hide lookalikes.
 */
import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { remove } from '@/lib/storage/safeStorage';
import { decideInSetPr } from './inSetPr.ts';
import { listMovementHistory } from './movementHistory.ts';
import { getBestPriorSet, isPersonalRecord } from './workoutPr.ts';
import { exercisesForPicker } from './customExercise.ts';
import {
  applyHideExercise,
  applyUnhideExercise,
  decideHideExercise,
  decideUnhideExercise,
  hideExerciseNow,
  isExerciseHidden,
  listHiddenExercises,
  loadHiddenExerciseIds,
  omitHiddenExercises,
  persistHiddenExerciseIds,
  unhideExerciseNow,
} from './hideExercise.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const BENCH = 'bench-press';
const SQUAT = 'squat';
const CUSTOM = 'custom-landmine';
const KNOWN = [BENCH, SQUAT, CUSTOM];

afterEach(() => {
  remove(STORAGE_KEYS.hiddenExercises);
  remove(STORAGE_KEYS.customExercises);
});

function log(
  exerciseId: string,
  sets: { reps: number; weight: number }[],
  over: Partial<CompletedWorkoutLog> = {}
): CompletedWorkoutLog {
  return {
    id: over.id ?? `log-${exerciseId}`,
    workoutName: over.workoutName ?? 'Push',
    startedAt: over.startedAt ?? 't0',
    completedAt: over.completedAt ?? 't1',
    durationSeconds: over.durationSeconds ?? 0,
    totalVolume: over.totalVolume ?? 100,
    exercises: [
      {
        exerciseId,
        sets: sets.map((s) => ({ reps: s.reps, weight: s.weight })),
        note: over.exercises?.[0]?.note ?? 'elbows in',
      },
    ],
    ...over,
  };
}

describe('decideHideExercise (.1004)', () => {
  it('empty / missing / already-hidden invents nothing', () => {
    assert.equal(
      decideHideExercise({ id: '', knownIds: KNOWN, hiddenIds: [] }).kind,
      'empty'
    );
    assert.equal(
      decideHideExercise({ id: '   ', knownIds: KNOWN, hiddenIds: [] }).kind,
      'empty'
    );
    assert.equal(
      decideHideExercise({ id: null, knownIds: KNOWN, hiddenIds: [] }).kind,
      'empty'
    );
    assert.equal(
      decideHideExercise({
        id: 'missing-id',
        knownIds: KNOWN,
        hiddenIds: [],
      }).kind,
      'noop'
    );
    assert.equal(
      decideHideExercise({
        id: BENCH,
        knownIds: KNOWN,
        hiddenIds: [BENCH],
      }).kind,
      'noop'
    );
    assert.equal(
      applyHideExercise({
        id: '',
        knownIds: KNOWN,
        hiddenIds: [],
      }),
      null
    );
    assert.equal(
      applyHideExercise({
        id: 'ghost',
        knownIds: KNOWN,
        hiddenIds: [],
      }),
      null
    );
    assert.equal(
      applyHideExercise({
        id: BENCH,
        knownIds: KNOWN,
        hiddenIds: [BENCH],
      }),
      null
    );
  });

  it('known id hides once — already-hidden does not duplicate', () => {
    assert.deepEqual(
      decideHideExercise({ id: ` ${BENCH} `, knownIds: KNOWN, hiddenIds: [] }),
      { kind: 'hide', id: BENCH }
    );
    const next = applyHideExercise({
      id: BENCH,
      knownIds: KNOWN,
      hiddenIds: [SQUAT],
    });
    assert.deepEqual(next, [SQUAT, BENCH]);
    assert.equal(
      applyHideExercise({
        id: BENCH,
        knownIds: KNOWN,
        hiddenIds: next ?? [],
      }),
      null
    );
  });

  it('does not auto-hide a lookalike name', () => {
    const next = applyHideExercise({
      id: BENCH,
      knownIds: [...KNOWN, 'incline-bench'],
      hiddenIds: [],
    });
    assert.deepEqual(next, [BENCH]);
    assert.equal(isExerciseHidden('incline-bench', next ?? []), false);
    assert.equal(isExerciseHidden(BENCH, next ?? []), true);
  });
});

describe('decideUnhideExercise (.1004)', () => {
  it('empty / not-hidden invents nothing new', () => {
    assert.equal(
      decideUnhideExercise({ id: '', hiddenIds: [BENCH] }).kind,
      'empty'
    );
    assert.equal(
      decideUnhideExercise({ id: SQUAT, hiddenIds: [BENCH] }).kind,
      'noop'
    );
    assert.equal(applyUnhideExercise({ id: '', hiddenIds: [BENCH] }), null);
    assert.equal(applyUnhideExercise({ id: SQUAT, hiddenIds: [BENCH] }), null);
  });

  it('unhide restores that id only', () => {
    assert.deepEqual(decideUnhideExercise({ id: BENCH, hiddenIds: [BENCH, SQUAT] }), {
      kind: 'unhide',
      id: BENCH,
    });
    assert.deepEqual(
      applyUnhideExercise({ id: BENCH, hiddenIds: [BENCH, SQUAT] }),
      [SQUAT]
    );
  });
});

describe('hide keeps history / PRs / notes', () => {
  it('apply never rewrites the diary or invents a PR', () => {
    const history = [
      log(BENCH, [{ reps: 5, weight: 100 }], {
        id: 'h1',
        exercises: [
          {
            exerciseId: BENCH,
            sets: [{ reps: 5, weight: 100 }],
            note: 'elbows in',
          },
        ],
      }),
    ];
    const snapshot = JSON.stringify(history);
    const next = applyHideExercise({
      id: BENCH,
      knownIds: KNOWN,
      hiddenIds: [],
    });
    assert.deepEqual(next, [BENCH]);
    assert.equal(JSON.stringify(history), snapshot);
    assert.equal(history[0]?.exercises[0]?.note, 'elbows in');
    assert.deepEqual(getBestPriorSet(BENCH, history), { weight: 100, reps: 5 });
    assert.equal(isPersonalRecord(BENCH, 5, 110, history), true);
    assert.equal(listMovementHistory(history, BENCH).length, 1);
    assert.deepEqual(
      decideInSetPr({
        exerciseId: BENCH,
        justLogged: { reps: 3, weight: 110 },
        rowType: 'weight',
        history,
      }).kinds,
      ['heaviest']
    );
  });
});

describe('picker omit + persist', () => {
  const catalog = [
    { id: BENCH, name: 'Bench Press', muscleGroups: [] },
    { id: SQUAT, name: 'Squat', muscleGroups: [] },
  ];

  it('Add / search / picker omit hidden names', () => {
    const listed = exercisesForPicker(catalog, {
      load: () => [{ id: CUSTOM, name: 'Landmine twist', createdAt: 't0' }],
    });
    assert.deepEqual(
      omitHiddenExercises(listed, [CUSTOM, BENCH]).map((row) => row.id),
      [SQUAT]
    );
    assert.deepEqual(
      omitHiddenExercises(listed, []).map((row) => row.id),
      [CUSTOM, BENCH, SQUAT]
    );
  });

  it('listHidden names the id; persist drops blanks', () => {
    persistHiddenExerciseIds(['', BENCH, BENCH, '  ']);
    assert.deepEqual(loadHiddenExerciseIds(), [BENCH]);
    const rows = listHiddenExercises({
      hiddenIds: [BENCH, CUSTOM],
      catalog,
      customs: [{ id: CUSTOM, name: 'Landmine twist' }],
    });
    assert.deepEqual(rows, [
      { id: BENCH, name: 'Bench Press' },
      { id: CUSTOM, name: 'Landmine twist' },
    ]);
  });

  it('hideExerciseNow / unhideExerciseNow respect decide', () => {
    assert.equal(hideExerciseNow(''), false);
    assert.equal(hideExerciseNow('ghost'), false);
    assert.equal(hideExerciseNow(BENCH), true);
    assert.deepEqual(loadHiddenExerciseIds(), [BENCH]);
    assert.equal(hideExerciseNow(BENCH), false);
    assert.equal(unhideExerciseNow(SQUAT), false);
    assert.equal(unhideExerciseNow(BENCH), true);
    assert.deepEqual(loadHiddenExerciseIds(), []);
  });
});

describe('hideExercise helper lock', () => {
  it('stays a pure decide — no store, premium, social, or auto-hide', () => {
    const src = read('src/lib/workout/hideExercise.ts');
    assert.match(src, /export function decideHideExercise/);
    assert.match(src, /export function decideUnhideExercise/);
    assert.match(src, /Hidden is\s+not deleted|not deleted/);
    assert.doesNotMatch(src, /from\s+['"]@\/store\//);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/rewards/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/premium/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/bodyMetrics/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/speech/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/wearables/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|\/bundle/);
    assert.doesNotMatch(src, /discord\.com|WeChat|four-scene/);
    assert.doesNotMatch(src, /looksLike|fuzzy|levenshtein|autoHide|suggestTwin/);
    assert.doesNotMatch(src, /deletedAt|deleteSession|applyMergeExercises/);
  });
});
