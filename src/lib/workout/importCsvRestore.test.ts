import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { WORKOUT_STORE_KEY } from '@/lib/backup';
import { __resetForTests as resetStorage, readRaw, writeRaw } from '@/lib/storage/safeStorage';
import type { CompletedWorkoutLog } from '@/types';
import {
  SET_TABLE_A_CSV_HEADER,
  SET_TABLE_B_CSV_HEADER,
  mergeImportedLogs,
  parseWorkoutCsv,
  workoutsToSetTableBCsv,
} from '@/lib/workout/importCsv';
import {
  buildWorkoutCsvDownload,
  importWorkoutCsvText,
  previewWorkoutCsvText,
} from '@/lib/workout/importCsvRestore';

const fixture = (name: string) =>
  readFileSync(path.join(import.meta.dirname, 'fixtures', name), 'utf8');

const STRONG_EMPTY = fixture('strong-empty.csv');
const STRONG_ONE = fixture('strong-one-workout.csv');
const STRONG_MALFORMED = fixture('strong-malformed-row.csv');
const SET_TABLE_B = fixture('set-table-b-sample.csv');

function installStorage(): () => void {
  const map = new Map<string, string>();
  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return () => {
    if (prev === undefined) delete g.localStorage;
    else g.localStorage = prev;
  };
}

function history(): CompletedWorkoutLog[] {
  const raw = readRaw(WORKOUT_STORE_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as { state?: { workoutHistory?: CompletedWorkoutLog[] } };
  return parsed.state?.workoutHistory ?? [];
}

function historyLen(): number {
  return history().length;
}

function dataRows(csv: string): string[] {
  return csv.trimEnd().split('\n').slice(1).filter(Boolean);
}

let uninstall: () => void;

beforeEach(() => {
  uninstall = installStorage();
  resetStorage();
});

afterEach(() => {
  uninstall();
  resetStorage();
});

describe('importCsvRestore preview vs commit', () => {
  it('preview of an empty file does not write', () => {
    writeRaw(WORKOUT_STORE_KEY, JSON.stringify({ version: 0, state: { workoutHistory: [] } }));
    const preview = previewWorkoutCsvText(STRONG_EMPTY);
    assert.equal(preview.ok, false);
    assert.ok(preview.error);
    assert.equal(preview.workouts.length, 0);
    assert.equal(preview.setCount, 0);
    assert.equal(historyLen(), 0, 'empty preview must leave persist untouched');
  });

  it('preview of one workout reports counts and does not write', () => {
    const preview = previewWorkoutCsvText(STRONG_ONE);
    assert.equal(preview.ok, true);
    assert.equal(preview.format, 'set-table-b');
    assert.equal(preview.workouts.length, 1);
    assert.equal(preview.setCount, 2);
    assert.equal(preview.added, 1);
    assert.equal(preview.skippedRows, 0);
    assert.equal(historyLen(), 0, 'preview is a dry-run');
  });

  it('confirm writes; a second different file still adds', () => {
    const first = importWorkoutCsvText(STRONG_ONE);
    assert.equal(first.ok, true);
    assert.equal(first.added, 1);
    assert.equal(historyLen(), 1);

    const preview = previewWorkoutCsvText(SET_TABLE_B);
    assert.equal(preview.ok, true);
    assert.ok((preview.added ?? 0) >= 1);
    assert.equal(historyLen(), 1, 'preview of a second file must not write');

    const second = importWorkoutCsvText(SET_TABLE_B);
    assert.equal(second.ok, true);
    assert.ok((second.added ?? 0) >= 1, 'no one-import cap');
    assert.equal(historyLen(), 1 + (second.added ?? 0));
  });

  it('malformed rows are counted; good sets land on confirm', () => {
    const preview = previewWorkoutCsvText(STRONG_MALFORMED);
    assert.equal(preview.ok, true);
    assert.equal(preview.skippedRows, 1);
    assert.equal(preview.setCount, 2);
    assert.equal(historyLen(), 0);

    const committed = importWorkoutCsvText(STRONG_MALFORMED);
    assert.equal(committed.ok, true);
    assert.equal(committed.skippedRows, 1);
    assert.equal(committed.added, 1);
    assert.equal(historyLen(), 1);
  });

  it('re-import of the same file is a no-op on confirm', () => {
    assert.equal(importWorkoutCsvText(STRONG_ONE).added, 1);
    const preview = previewWorkoutCsvText(STRONG_ONE);
    assert.equal(preview.ok, true);
    assert.equal(preview.added, 0);
    assert.equal(preview.duplicates, 1);
    const again = importWorkoutCsvText(STRONG_ONE);
    assert.equal(again.ok, true);
    assert.equal(again.added, 0);
    assert.equal(again.duplicates, 1);
    assert.equal(historyLen(), 1);
  });
});

describe('importCsvRestore Strong export', () => {
  it('empty persist downloads a header-only Strong file and does not write', () => {
    const missing = buildWorkoutCsvDownload('set-table-b');
    assert.equal(missing.ok, true);
    if (!missing.ok) return;
    assert.equal(missing.count, 0);
    assert.equal(missing.csv.trimEnd(), SET_TABLE_B_CSV_HEADER);

    writeRaw(WORKOUT_STORE_KEY, JSON.stringify({ version: 0, state: { workoutHistory: [] } }));
    const built = buildWorkoutCsvDownload('set-table-b');
    assert.equal(built.ok, true);
    if (!built.ok) return;
    assert.equal(built.count, 0);
    assert.equal(built.dialect, 'set-table-b');
    assert.equal(built.csv.trimEnd(), SET_TABLE_B_CSV_HEADER);
    assert.equal(dataRows(built.csv).length, 0, 'empty history must not invent a set');
    assert.equal(historyLen(), 0, 'export is read-only');

    const setTable = buildWorkoutCsvDownload('set-table-a');
    assert.equal(setTable.ok, true);
    if (!setTable.ok) return;
    assert.equal(setTable.count, 0);
    assert.equal(setTable.csv.trimEnd(), SET_TABLE_A_CSV_HEADER);
  });

  it('one imported fixture round-trips without invented sets', () => {
    const committed = importWorkoutCsvText(STRONG_ONE);
    assert.equal(committed.ok, true);
    assert.equal(committed.added, 1);

    const built = buildWorkoutCsvDownload('set-table-b');
    assert.equal(built.ok, true);
    if (!built.ok) return;
    assert.equal(built.count, 1);
    assert.ok(built.csv.startsWith(SET_TABLE_B_CSV_HEADER));
    assert.doesNotMatch(built.csv, /distance_km|superset_id|weight_kg/);
    assert.equal(dataRows(built.csv).length, 2, 'exactly the two imported sets');

    const back = parseWorkoutCsv(built.csv, 'metric');
    assert.equal(back.error, undefined);
    assert.equal(back.format, 'set-table-b');
    assert.equal(back.workouts.length, 1);
    assert.equal(back.skippedRows, 0);
    const bench = back.workouts[0].exercises.find((e) => e.exerciseId === 'bench-press');
    assert.ok(bench);
    assert.equal(bench.sets.length, 2);
    assert.equal(bench.sets[0].reps, 5);
    assert.equal(bench.sets[0].weight, 100);
    assert.equal(bench.sets[1].reps, 5);
    const setCount = back.workouts[0].exercises.reduce((n, e) => n + e.sets.length, 0);
    assert.equal(setCount, 2, 'do not pad empty sets');

    const { added, duplicates } = mergeImportedLogs(history(), back.workouts);
    assert.equal(added, 0, 'export then import must not duplicate');
    assert.equal(duplicates, 1);
  });

  it('skipped import rows are not rewritten as valid sets on export', () => {
    const committed = importWorkoutCsvText(STRONG_MALFORMED);
    assert.equal(committed.ok, true);
    assert.equal(committed.skippedRows, 1);
    assert.equal(committed.added, 1);

    const built = buildWorkoutCsvDownload('set-table-b');
    assert.equal(built.ok, true);
    if (!built.ok) return;
    assert.doesNotMatch(built.csv, /Ghost Press/, 'skipped row must not come back as a set');
    assert.equal(dataRows(built.csv).length, 2);

    const back = parseWorkoutCsv(built.csv, 'metric');
    assert.equal(back.skippedRows, 0);
    const names = back.workouts[0].exercises.map((e) => e.exerciseId);
    assert.ok(!names.includes('ghost-press'));
    const bench = back.workouts[0].exercises.find((e) => e.exerciseId === 'bench-press');
    assert.ok(bench);
    assert.equal(bench.sets.length, 2);
  });

  it('a second export of the same history matches the first', () => {
    assert.equal(importWorkoutCsvText(STRONG_ONE).added, 1);
    const first = buildWorkoutCsvDownload('set-table-b');
    const second = buildWorkoutCsvDownload('set-table-b');
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(second.csv, first.csv, 'no one-export cap; same persist → same file');
    assert.equal(historyLen(), 1);
  });

  it('pure empty Strong shape is header-only', () => {
    assert.equal(workoutsToSetTableBCsv([], 'metric').trimEnd(), SET_TABLE_B_CSV_HEADER);
  });
});
