/**
 * Replaying one day.
 *
 * `.251` — the weight here is on the two ways a replay lies: showing a day as
 * **empty** when it merely fell off a limit, and putting an entry on the wrong
 * calendar day east of UTC.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { writeJson } from '@/lib/storage/safeStorage';
import { buildDayRecord } from '@/lib/journey/dayRecord';
import { sweepDaysWithData } from '@/lib/journey/daysWithData';
import type { CompletedWorkoutLog } from '@/types';

function resetStorage() {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
}

beforeEach(resetStorage);

/** A session at 10:00 local on the given local date. */
function workoutAt(y: number, m: number, d: number, id = 'w1'): CompletedWorkoutLog {
  const at = new Date(y, m - 1, d, 10, 0, 0, 0).toISOString();
  return {
    id,
    workoutName: 'Push Day',
    startedAt: at,
    completedAt: at,
    durationSeconds: 3000,
    exercises: [],
    totalVolume: 4000,
  };
}

test('a day carries what was logged on it, and nothing from its neighbours', () => {
  const history = [workoutAt(2026, 3, 1, 'a'), workoutAt(2026, 3, 2, 'b')];
  writeJson(STORAGE_KEYS.nutritionLog, [{ date: '2026-03-01', name: 'Eggs', protein: 30 }]);
  sweepDaysWithData(history.map((w) => w.completedAt));

  const rec = buildDayRecord('2026-03-01', history);
  assert.equal(rec.entries.length, 2, 'the workout and the meal');
  assert.ok(rec.entries.every((e) => e.at.startsWith('2026-03-01')));
});

test('a day reads forwards — the morning before the evening', () => {
  /*
   * `gatherJournalEntries` returns newest-first, which is correct for the Today
   * feed and wrong here. Rendering the page is what showed it: the check-in at
   * 8pm sat above the session at 7am, so the replay described the day
   * backwards.
   */
  const history = [workoutAt(2026, 3, 1, 'a')];
  writeJson(STORAGE_KEYS.mindCheckIns, [{ date: '2026-03-01', mood: 4, sleep: 4, note: 'Good' }]);
  writeJson(STORAGE_KEYS.nutritionLog, [
    { date: '2026-03-01', name: 'Breakfast', protein: 30, time: '8:15 AM' },
  ]);
  sweepDaysWithData(history.map((w) => w.completedAt));

  const times = buildDayRecord('2026-03-01', history).entries.map((e) => e.at);
  assert.deepEqual([...times].sort((a, b) => a.localeCompare(b)), times, 'earliest first');
  assert.ok(times.length >= 3, 'need several entries for the order to mean anything');
});

test('neighbours read forwards in time, not in storage order', () => {
  /*
   * `listDaysWithData` is newest-first because that is how it is displayed.
   * "Next" to a human means later, so the neighbours come from the reversed
   * list — reading them off the storage order would swap the arrows.
   */
  const history = [
    workoutAt(2026, 3, 1, 'a'),
    workoutAt(2026, 3, 5, 'b'),
    workoutAt(2026, 3, 9, 'c'),
  ];
  sweepDaysWithData(history.map((w) => w.completedAt));

  const mid = buildDayRecord('2026-03-05', history);
  assert.equal(mid.previous, '2026-03-01', 'previous is earlier');
  assert.equal(mid.next, '2026-03-09', 'next is later');
  assert.equal(mid.index, 2);
  assert.equal(mid.total, 3);
});

test('the ends of the record have no neighbour beyond them', () => {
  const history = [workoutAt(2026, 3, 1, 'a'), workoutAt(2026, 3, 9, 'c')];
  sweepDaysWithData(history.map((w) => w.completedAt));

  assert.equal(buildDayRecord('2026-03-01', history).previous, null, 'nothing before the first');
  assert.equal(buildDayRecord('2026-03-09', history).next, null, 'nothing after the last');
});

test('an old day still lists its entries — the gather ceiling must not truncate it', () => {
  /*
   * The failure worth designing against. `gatherJournalEntries` sorts
   * newest-first and takes a limit, so a small ceiling silently drops the
   * *oldest* days — and a day that renders **empty** reads as "you did nothing"
   * rather than "this page could not see it". That is `.208`'s shape: a
   * confident claim the data does not support.
   */
  const history = Array.from({ length: 40 }, (_, i) =>
    workoutAt(2026, 3, 1 + i, `w${i}`)
  );
  writeJson(
    STORAGE_KEYS.nutritionLog,
    Array.from({ length: 300 }, (_, i) => ({ date: '2026-04-20', name: `Meal ${i}`, protein: 20 }))
  );
  sweepDaysWithData(history.map((w) => w.completedAt));

  const oldest = buildDayRecord('2026-03-01', history);
  assert.equal(oldest.entries.length, 1, 'the earliest day is still readable behind 300 newer rows');
});

test('a day is bucketed locally, not by UTC', () => {
  const previous = process.env.TZ;
  process.env.TZ = 'Pacific/Auckland';
  try {
    // 10:00 on 1 Aug in Auckland is 2026-07-31T21:00Z — UTC would say 31 July.
    const history = [workoutAt(2026, 8, 1, 'a')];
    sweepDaysWithData(history.map((w) => w.completedAt));

    assert.equal(buildDayRecord('2026-08-01', history).entries.length, 1, 'the day it was lived');
    assert.equal(buildDayRecord('2026-07-31', history).entries.length, 0, 'not the UTC day');
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('a malformed or unknown day is empty, not a throw', () => {
  // The date comes out of the URL, so it is user input.
  const history = [workoutAt(2026, 3, 1, 'a')];
  sweepDaysWithData(history.map((w) => w.completedAt));

  for (const bad of ['', 'yesterday', '2026-13-99/../etc', '<script>']) {
    const rec = buildDayRecord(bad, history);
    assert.deepEqual(rec.entries, [], `"${bad}" must not resolve`);
    assert.equal(rec.index, null, `"${bad}" is not in the record`);
  }

  // A well-formed day with nothing logged is legitimately empty, not an error.
  const quiet = buildDayRecord('2026-03-04', history);
  assert.deepEqual(quiet.entries, []);
  assert.equal(quiet.index, null);
  assert.equal(quiet.total, 1, 'the record still knows how many days it holds');
});
