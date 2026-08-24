import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { WORKOUT_STORE_KEY } from '@/lib/backup';
import { __resetForTests as resetStorage, readRaw, writeRaw } from '@/lib/storage/safeStorage';
import {
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

function historyLen(): number {
  const raw = readRaw(WORKOUT_STORE_KEY);
  if (!raw) return 0;
  const parsed = JSON.parse(raw) as { state?: { workoutHistory?: unknown[] } };
  return parsed.state?.workoutHistory?.length ?? 0;
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
