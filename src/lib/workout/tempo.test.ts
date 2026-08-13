import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import {
  formatTempo,
  LAST_TEMPO_CAP,
  lastTempoForExercise,
  parseOptionalTempo,
  recallLastTempo,
  rememberLastTempo,
} from './tempo.ts';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { sessionLoad } from '@/lib/coach/load';
import type { CompletedWorkoutLog } from '@/types';

const storageMap = new Map<string, string>();
(globalThis as { localStorage?: Storage }).localStorage = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => void storageMap.set(k, v),
  removeItem: (k: string) => void storageMap.delete(k),
  clear: () => storageMap.clear(),
  key: (i: number) => [...storageMap.keys()][i] ?? null,
  get length() {
    return storageMap.size;
  },
} as unknown as Storage;

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('parseOptionalTempo accepts 3-1-1 and the object form', () => {
  assert.deepEqual(parseOptionalTempo('3-1-1'), { ecc: 3, pause: 1, con: 1 });
  assert.deepEqual(parseOptionalTempo('0-0-0'), { ecc: 0, pause: 0, con: 0 });
  assert.deepEqual(parseOptionalTempo('9-9-9'), { ecc: 9, pause: 9, con: 9 });
  assert.deepEqual(parseOptionalTempo({ ecc: 4, pause: 2, con: 1 }), {
    ecc: 4,
    pause: 2,
    con: 1,
  });
  assert.deepEqual(parseOptionalTempo('3–1–1'), { ecc: 3, pause: 1, con: 1 });
  assert.deepEqual(parseOptionalTempo('3/1/1'), { ecc: 3, pause: 1, con: 1 });
});

test('parseOptionalTempo treats empty as absent', () => {
  assert.equal(parseOptionalTempo(undefined), undefined);
  assert.equal(parseOptionalTempo(null), undefined);
  assert.equal(parseOptionalTempo(''), undefined);
  assert.equal(parseOptionalTempo('   '), undefined);
});

test('parseOptionalTempo rejects out-of-range, 4-count, bare 311, and junk', () => {
  assert.equal(parseOptionalTempo('10-1-1'), undefined);
  assert.equal(parseOptionalTempo('3-1-10'), undefined);
  assert.equal(parseOptionalTempo('3-1-1-0'), undefined);
  assert.equal(parseOptionalTempo('311'), undefined);
  assert.equal(parseOptionalTempo('3.5-1-1'), undefined);
  assert.equal(parseOptionalTempo(-1), undefined);
  assert.equal(parseOptionalTempo(NaN), undefined);
  assert.equal(parseOptionalTempo(true), undefined);
  assert.equal(parseOptionalTempo({ ecc: 3, pause: 1, con: 1.5 }), undefined);
  assert.equal(parseOptionalTempo({ ecc: 3, pause: 1 }), undefined);
});

test('formatTempo round-trips a parsed value', () => {
  const t = parseOptionalTempo('3-1-1');
  assert.ok(t);
  assert.equal(formatTempo(t), '3-1-1');
  assert.deepEqual(parseOptionalTempo(formatTempo(t)), t);
});

test('last tempo remember / recall / cap', () => {
  storageMap.clear();
  rememberLastTempo('bench-press', { ecc: 3, pause: 1, con: 1 });
  assert.deepEqual(recallLastTempo('bench-press'), { ecc: 3, pause: 1, con: 1 });
  rememberLastTempo('bench-press', { ecc: 4, pause: 2, con: 1 });
  assert.deepEqual(recallLastTempo('bench-press'), { ecc: 4, pause: 2, con: 1 });
  rememberLastTempo('not-a-tempo', { ecc: 99, pause: 1, con: 1 } as never);
  assert.equal(recallLastTempo('not-a-tempo'), undefined);

  storageMap.clear();
  for (let i = 0; i < LAST_TEMPO_CAP + 5; i++) {
    rememberLastTempo(`ex-${i}`, { ecc: 2, pause: 0, con: 1 });
  }
  assert.equal(recallLastTempo('ex-0'), undefined, 'oldest id is evicted past the cap');
  assert.deepEqual(recallLastTempo(`ex-${LAST_TEMPO_CAP + 4}`), { ecc: 2, pause: 0, con: 1 });
  const stored = JSON.parse(storageMap.get(STORAGE_KEYS.lastTempoByExercise) ?? '{}') as Record<
    string,
    unknown
  >;
  assert.equal(Object.keys(stored).length, LAST_TEMPO_CAP);
});

test('lastTempoForExercise prefers session, then device, then history', () => {
  storageMap.clear();
  const history: { exercises: { exerciseId: string; sets: { tempo?: { ecc: number; pause: number; con: number } }[] }[] }[] =
    [
      {
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [{ tempo: { ecc: 2, pause: 0, con: 1 } }],
          },
        ],
      },
    ];
  assert.deepEqual(lastTempoForExercise('bench-press', [], history), {
    ecc: 2,
    pause: 0,
    con: 1,
  });

  rememberLastTempo('bench-press', { ecc: 3, pause: 1, con: 1 });
  assert.deepEqual(lastTempoForExercise('bench-press', [], history), {
    ecc: 3,
    pause: 1,
    con: 1,
  });

  assert.deepEqual(
    lastTempoForExercise(
      'bench-press',
      [{ completed: true, tempo: { ecc: 4, pause: 1, con: 1 } }],
      history
    ),
    { ecc: 4, pause: 1, con: 1 }
  );
});

test('sessionLoad ignores tempo — it is not an effort signal', () => {
  const base: CompletedWorkoutLog = {
    id: 'w',
    workoutName: 'Push',
    startedAt: '2026-08-13T10:00:00Z',
    completedAt: '2026-08-13T11:00:00Z',
    durationSeconds: 3600,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 5, weight: 100, rpe: 'hard' }],
      },
    ],
  };
  const withTempo: CompletedWorkoutLog = {
    ...base,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 5, weight: 100, rpe: 'hard', tempo: { ecc: 3, pause: 1, con: 1 } }],
      },
    ],
  };
  assert.deepEqual(sessionLoad(withTempo), sessionLoad(base));
});

test('tempo lives on completed set rows, never as a Log set gate', () => {
  for (const file of [
    'src/components/workout/SetLogRow.tsx',
    'src/components/workout/SetLogTable.tsx',
  ]) {
    assert.match(
      stripComments(read(file)),
      /SetTempoField/,
      `${file} must mount the optional tempo control`
    );
  }
  const consoleSrc = stripComments(read('src/components/workout/LogConsole.tsx'));
  assert.doesNotMatch(consoleSrc, /tempo/i, 'LogConsole must not take a tempo field');
  const page = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(
    page,
    /disabled=\{[^}]*tempo/,
    'Log set must not be disabled for missing tempo'
  );
  const today = stripComments(read('src/page-components/HomePage.tsx'));
  assert.doesNotMatch(today, /SetTempoField|activeTempo/, 'tempo is not on Today first paint');
});
