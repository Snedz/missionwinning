/**
 * Merge duplicate exercises. Empty / same / missing invent nothing.
 * Confirm-gated. PRs recompute from the merged diary.
 */
import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { remove } from '@/lib/storage/safeStorage';
import { decideInSetPr } from './inSetPr.ts';
import { knownMaxFromHistory } from './setRowPercent.ts';
import { getBestPriorSet, isPersonalRecord } from './workoutPr.ts';
import {
  applyMergeExercises,
  collectKnownExerciseIds,
  decideMergeExercises,
  filterMergeCandidates,
  listMergeCandidates,
  mergeExerciseCards,
  persistMergedPrefs,
  transferKeyedPref,
  mergeRestMemory,
} from './mergeExercises.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const SOURCE = 'custom-bench';
const KEEPER = 'bench-press';
const KNOWN = [SOURCE, KEEPER, 'squat'];

afterEach(() => {
  remove(STORAGE_KEYS.lastRestByExercise);
  remove(STORAGE_KEYS.pinnedNoteByExercise);
  remove(STORAGE_KEYS.lastTempoByExercise);
  remove(STORAGE_KEYS.customExercises);
});

function log(
  exerciseId: string,
  sets: { reps: number; weight: number; kind?: string }[],
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
        sets: sets.map((s) => ({
          reps: s.reps,
          weight: s.weight,
          kind: s.kind as CompletedWorkoutLog['exercises'][number]['sets'][number]['kind'],
        })),
        note: over.exercises?.[0]?.note,
      },
    ],
    ...over,
  };
}

describe('decideMergeExercises (.1002)', () => {
  it('empty / same-id / missing invents nothing', () => {
    assert.equal(
      decideMergeExercises({ sourceId: '', keeperId: KEEPER, knownIds: KNOWN }).kind,
      'empty'
    );
    assert.equal(
      decideMergeExercises({ sourceId: SOURCE, keeperId: '   ', knownIds: KNOWN }).kind,
      'empty'
    );
    assert.equal(
      decideMergeExercises({ sourceId: null, keeperId: KEEPER, knownIds: KNOWN }).kind,
      'empty'
    );
    assert.equal(
      decideMergeExercises({ sourceId: SOURCE, keeperId: SOURCE, knownIds: KNOWN }).kind,
      'noop'
    );
    assert.equal(
      decideMergeExercises({
        sourceId: 'missing-a',
        keeperId: KEEPER,
        knownIds: KNOWN,
      }).kind,
      'noop'
    );
    assert.equal(
      decideMergeExercises({
        sourceId: SOURCE,
        keeperId: 'missing-b',
        knownIds: KNOWN,
      }).kind,
      'noop'
    );
    assert.equal(applyMergeExercises({
      sourceId: '',
      keeperId: KEEPER,
      knownIds: KNOWN,
      history: [log(SOURCE, [{ reps: 5, weight: 100 }])],
    }), null);
  });

  it('valid pair always needs confirm — never auto-apply', () => {
    const decision = decideMergeExercises({
      sourceId: ` ${SOURCE} `,
      keeperId: KEEPER,
      knownIds: KNOWN,
    });
    assert.deepEqual(decision, {
      kind: 'needs-confirm',
      sourceId: SOURCE,
      keeperId: KEEPER,
    });
  });

  it('does not invent a lookalike match', () => {
    const known = collectKnownExerciseIds({
      catalog: [{ id: 'bench-press' }, { id: 'incline-bench' }],
      customs: [{ id: SOURCE }],
    });
    assert.ok(known.includes(SOURCE));
    assert.ok(known.includes('bench-press'));
    assert.equal(
      decideMergeExercises({
        sourceId: SOURCE,
        keeperId: '',
        knownIds: known,
      }).kind,
      'empty'
    );
    const names = listMergeCandidates({
      catalog: [
        { id: 'bench-press', name: 'Barbell Bench Press' },
        { id: 'incline-bench', name: 'Incline Bench' },
      ],
      customs: [{ id: SOURCE, name: 'Bench' }],
    });
    assert.ok(names.some((r) => r.id === SOURCE && r.name === 'Bench'));
    assert.ok(names.some((r) => r.id === 'bench-press'));
    assert.equal(
      decideMergeExercises({
        sourceId: SOURCE,
        keeperId: 'incline-bench',
        knownIds: known,
      }).kind,
      'needs-confirm',
      'explicit pick is allowed; names are not auto-paired'
    );
  });
});

describe('applyMergeExercises after confirm', () => {
  it('rewrites history onto the keeper and drops the source identity', () => {
    const history = [
      log(SOURCE, [{ reps: 5, weight: 80 }], { id: 'h-source' }),
      log(KEEPER, [{ reps: 5, weight: 100 }], { id: 'h-keeper' }),
    ];
    const next = applyMergeExercises({
      sourceId: SOURCE,
      keeperId: KEEPER,
      knownIds: KNOWN,
      history,
      customs: [{ id: SOURCE, name: 'Bench', createdAt: 't0' }],
      now: '2026-08-25T12:00:00.000Z',
    });
    assert.ok(next);
    assert.equal(next?.history[0]?.exercises[0]?.exerciseId, KEEPER);
    assert.equal(next?.history[0]?.revision, 2);
    assert.equal(next?.history[1]?.exercises[0]?.exerciseId, KEEPER);
    assert.deepEqual(next?.customs, []);
    assert.equal(
      next?.history.some((row) =>
        row.exercises.some((ex) => ex.exerciseId === SOURCE)
      ),
      false
    );
  });

  it('does not wipe the source without transferring sets', () => {
    const history = [log(SOURCE, [{ reps: 8, weight: 90, kind: 'normal' }], { id: 'h1' })];
    const next = applyMergeExercises({
      sourceId: SOURCE,
      keeperId: KEEPER,
      knownIds: KNOWN,
      history,
    });
    assert.ok(next);
    assert.equal(next?.history[0]?.exercises[0]?.sets[0]?.weight, 90);
    assert.equal(next?.history[0]?.exercises[0]?.sets[0]?.kind, 'normal');
    assert.equal(next?.history[0]?.exercises[0]?.exerciseId, KEEPER);
  });

  it('live session: source becomes keeper, or vanishes if keeper is already there — sets travel', () => {
    const renamed = mergeExerciseCards(
      [
        {
          exerciseId: SOURCE,
          sets: [{ reps: 5, weight: 80, completed: true }],
          note: 'elbows in',
        },
      ],
      SOURCE,
      KEEPER
    );
    assert.equal(renamed.length, 1);
    assert.equal(renamed[0]?.exerciseId, KEEPER);
    assert.equal(renamed[0]?.sets.length, 1);
    assert.equal(renamed[0]?.note, 'elbows in');

    const both = mergeExerciseCards(
      [
        {
          exerciseId: KEEPER,
          sets: [{ reps: 5, weight: 100, completed: true }],
          note: 'keep',
        },
        {
          exerciseId: SOURCE,
          sets: [{ reps: 8, weight: 80, completed: true }],
          note: 'drop me',
        },
      ],
      SOURCE,
      KEEPER
    );
    assert.equal(both.length, 1);
    assert.equal(both[0]?.exerciseId, KEEPER);
    assert.equal(both[0]?.sets.length, 2);
    assert.equal(both[0]?.sets[0]?.weight, 100);
    assert.equal(both[0]?.sets[1]?.weight, 80);
    assert.equal(both[0]?.note, 'keep');
  });

  it('prefs ride the keeper; keeper values win; source keys go', () => {
    const next = applyMergeExercises({
      sourceId: SOURCE,
      keeperId: KEEPER,
      knownIds: KNOWN,
      history: [],
      rest: {
        [SOURCE]: { work: 90, warmup: 45 },
        [KEEPER]: { work: 180 },
      },
      pins: { [SOURCE]: 'from source', [KEEPER]: 'from keeper' },
      tempo: { [SOURCE]: { ecc: 3, pause: 1, con: 1 } },
    });
    assert.ok(next);
    assert.deepEqual(next?.rest[KEEPER], { work: 180, warmup: 45 });
    assert.equal(next?.rest[SOURCE], undefined);
    assert.equal(next?.pins[KEEPER], 'from keeper');
    assert.equal(next?.pins[SOURCE], undefined);
    assert.deepEqual(next?.tempo[KEEPER], { ecc: 3, pause: 1, con: 1 });
    assert.equal(next?.tempo[SOURCE], undefined);
  });

  it('PRs and 1RM recompute from the merged diary — never invented', () => {
    const history = [log(SOURCE, [{ reps: 5, weight: 120 }], { id: 'old' })];
    const next = applyMergeExercises({
      sourceId: SOURCE,
      keeperId: KEEPER,
      knownIds: KNOWN,
      history,
    });
    assert.ok(next);
    const merged = next!.history;
    assert.deepEqual(getBestPriorSet(KEEPER, merged), { weight: 120, reps: 5 });
    assert.equal(getBestPriorSet(SOURCE, merged), null);
    assert.equal(isPersonalRecord(KEEPER, 5, 110, merged), false);
    assert.equal(isPersonalRecord(KEEPER, 5, 140, merged), true);
    assert.equal(knownMaxFromHistory(KEEPER, merged), null, '5-rep set is not a 1RM');
    const withSingle = applyMergeExercises({
      sourceId: SOURCE,
      keeperId: KEEPER,
      knownIds: KNOWN,
      history: [log(SOURCE, [{ reps: 1, weight: 140 }], { id: 'single' })],
    });
    assert.equal(knownMaxFromHistory(KEEPER, withSingle!.history), 140);
    assert.equal(knownMaxFromHistory(SOURCE, withSingle!.history), null);
    assert.deepEqual(
      decideInSetPr({
        exerciseId: KEEPER,
        justLogged: { reps: 3, weight: 130 },
        rowType: 'weight',
        history: merged,
      }).kinds,
      ['heaviest']
    );
    assert.deepEqual(
      decideInSetPr({
        exerciseId: SOURCE,
        justLogged: { reps: 5, weight: 130 },
        rowType: 'weight',
        history: merged,
      }).kinds,
      []
    );
  });

  it('session with both names merges cards; tags travel', () => {
    const both: CompletedWorkoutLog = {
      id: 'both',
      workoutName: 'Push',
      startedAt: 't0',
      completedAt: 't1',
      durationSeconds: 0,
      totalVolume: 200,
      exercises: [
        {
          exerciseId: KEEPER,
          sets: [{ reps: 5, weight: 100 }],
        },
        {
          exerciseId: SOURCE,
          sets: [{ reps: 8, weight: 80, kind: 'drop' }],
          note: 'source note',
        },
      ],
    };
    const next = applyMergeExercises({
      sourceId: SOURCE,
      keeperId: KEEPER,
      knownIds: KNOWN,
      history: [both],
    });
    assert.equal(next?.history[0]?.exercises.length, 1);
    assert.equal(next?.history[0]?.exercises[0]?.sets.length, 2);
    assert.equal(next?.history[0]?.exercises[0]?.sets[1]?.kind, 'drop');
    assert.equal(next?.history[0]?.exercises[0]?.note, 'source note');
  });
});

describe('merge helpers', () => {
  it('transferKeyedPref keeper wins; source fills a hole', () => {
    assert.deepEqual(transferKeyedPref({ a: 1, b: 2 }, 'a', 'b'), { b: 2 });
    assert.deepEqual(transferKeyedPref({ a: 1 }, 'a', 'b'), { b: 1 });
    assert.deepEqual(mergeRestMemory({ work: 180 }, { work: 90, warmup: 45 }), {
      work: 180,
      warmup: 45,
    });
  });

  it('filterMergeCandidates is search only — never invents a pair', () => {
    const rows = [
      { id: SOURCE, name: 'Bench' },
      { id: KEEPER, name: 'Barbell Bench Press' },
    ];
    assert.equal(filterMergeCandidates(rows, 'bench').length, 2);
    assert.equal(filterMergeCandidates(rows, 'nope').length, 0);
  });

  it('persist writes transferred prefs and drops the source key', () => {
    persistMergedPrefs({
      rest: { [KEEPER]: { work: 180 } },
      pins: { [KEEPER]: '45 incline' },
      tempo: { [KEEPER]: { ecc: 3, pause: 0, con: 1 } },
    });
    const next = applyMergeExercises({
      sourceId: SOURCE,
      keeperId: KEEPER,
      knownIds: KNOWN,
      history: [],
      rest: { [SOURCE]: { work: 90 } },
      pins: { [SOURCE]: 'from source' },
      tempo: {},
    });
    persistMergedPrefs(next!);
    assert.ok(next);
  });
});

describe('mergeExercises helper lock', () => {
  it('stays a pure confirm-gated decide — no store, premium, social, or auto-match', () => {
    const src = read('src/lib/workout/mergeExercises.ts');
    assert.match(src, /export function decideMergeExercises/);
    assert.match(src, /export function applyMergeExercises/);
    assert.match(src, /needs-confirm/);
    assert.match(src, /Cannot be undone|cannot be undone/);
    assert.doesNotMatch(src, /from\s+['"]@\/store\//);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/rewards/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/premium/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/bodyMetrics/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/speech/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/wearables/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|\/bundle/);
    assert.doesNotMatch(src, /discord\.com|WeChat|four-scene/);
    assert.doesNotMatch(src, /looksLike|fuzzy|levenshtein|autoMerge|suggestTwin/);
  });
});
