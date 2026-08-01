/**
 * The number that has to survive the caps.
 *
 * `.227` — "days logged" is the one figure in this app that cannot be derived
 * from stored rows, because every store is capped and the oldest rows are gone.
 * The tests below spend most of their weight on the two ways it could lie:
 * counting a day twice, and losing a day when the store it came from is
 * truncated.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { writeJson } from '@/lib/storage/safeStorage';
import {
  daysWithDataCount,
  firstDayWithData,
  hasDataOn,
  listDaysWithData,
  markTodayWithData,
  sweepDaysWithData,
} from '@/lib/journey/daysWithData';
import { localDateKey } from '@/lib/time/localDate';

/** A localStorage stand-in, since these libs read through safeStorage. */
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

test('a day counts once, however many things were logged on it', () => {
  writeJson(STORAGE_KEYS.nutritionLog, [
    { date: '2026-03-01', protein: 40 },
    { date: '2026-03-01', protein: 30 },
  ]);
  writeJson(STORAGE_KEYS.activityLog, [{ date: '2026-03-01', durationMin: 30 }]);
  sweepDaysWithData(['2026-03-01T10:00:00.000Z']);

  assert.equal(daysWithDataCount(), 1, 'four rows on one day is one day');
});

test('it unions across every dated store', () => {
  writeJson(STORAGE_KEYS.nutritionLog, [{ date: '2026-03-01' }]);
  writeJson(STORAGE_KEYS.activityLog, [{ date: '2026-03-02' }]);
  writeJson(STORAGE_KEYS.mindCheckIns, [{ date: '2026-03-03' }]);
  writeJson(STORAGE_KEYS.bodyMetrics, [{ date: '2026-03-04' }]);
  writeJson(STORAGE_KEYS.sessionJournal, [{ date: '2026-03-05' }]);
  writeJson(STORAGE_KEYS.pillarWins, [{ completedAt: '2026-03-06T12:00:00.000Z' }]);

  sweepDaysWithData(['2026-03-07T12:00:00.000Z']);
  assert.equal(daysWithDataCount(), 7, 'one day from each source, plus the workout');
});

test('a day survives the row that produced it being dropped', () => {
  /*
   * The whole reason this store exists. `HISTORY_CAP` is 1000 and the journal
   * caps at 200 — a long-running athlete's early months are deleted, and a
   * count derived from surviving rows would *shrink* as they trained more.
   */
  writeJson(STORAGE_KEYS.nutritionLog, [{ date: '2024-01-01' }, { date: '2024-01-02' }]);
  sweepDaysWithData([]);
  assert.equal(daysWithDataCount(), 2);

  // The cap bites: the old rows are gone.
  writeJson(STORAGE_KEYS.nutritionLog, []);
  sweepDaysWithData([]);

  assert.equal(daysWithDataCount(), 2, 'the days must outlive the rows');
  assert.equal(firstDayWithData(), '2024-01-01');
});

test('sweeping repeatedly changes nothing', () => {
  /*
   * It runs on every load, so a sweep that found nothing new must produce a
   * byte-identical payload — that is what lets `.210`'s dedupeWrites skip the
   * disk entirely rather than rewriting the file on each app open.
   */
  writeJson(STORAGE_KEYS.nutritionLog, [{ date: '2026-03-02' }, { date: '2026-03-01' }]);
  const first = sweepDaysWithData(['2026-03-03T10:00:00.000Z']);
  const second = sweepDaysWithData(['2026-03-03T10:00:00.000Z']);
  const third = sweepDaysWithData(['2026-03-03T10:00:00.000Z']);

  assert.deepEqual(second, first);
  assert.deepEqual(third, first);
  assert.deepEqual(first, [...first].sort((a, b) => b.localeCompare(a)), 'stable order');
});

test('an instant is read as a local day, not a UTC one', () => {
  /*
   * `.225`'s defect, which this file must not reintroduce: `pillarWins` and
   * workout logs store ISO **instants**, and slicing one gives the UTC date.
   * East of UTC that is a different calendar day for the whole morning.
   */
  const previous = process.env.TZ;
  process.env.TZ = 'Pacific/Auckland';
  try {
    // 10:00 on 1 Aug in Auckland is 2026-07-31T21:00Z.
    writeJson(STORAGE_KEYS.pillarWins, [{ completedAt: '2026-07-31T21:00:00.000Z' }]);
    sweepDaysWithData([]);
    assert.deepEqual(listDaysWithData(), ['2026-08-01'], 'the athlete logged this on 1 August');
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('malformed rows cannot poison the set', () => {
  writeJson(STORAGE_KEYS.nutritionLog, [
    { date: 'not-a-date' },
    { date: '' },
    { date: 12345 },
    {},
    null,
    { date: '2026-03-01' },
  ]);
  sweepDaysWithData(['', 'nonsense']);

  assert.deepEqual(listDaysWithData(), ['2026-03-01'], 'only real day keys survive');
});

test('a corrupt stored value degrades to empty, not to a throw', () => {
  // This runs on load. Throwing here would take the whole app down over a
  // value that is, at worst, a lost count.
  writeJson(STORAGE_KEYS.daysWithData, { not: 'an array' });
  assert.equal(daysWithDataCount(), 0);
  assert.equal(firstDayWithData(), null);

  writeJson(STORAGE_KEYS.nutritionLog, [{ date: '2026-03-01' }]);
  assert.deepEqual(sweepDaysWithData([]), ['2026-03-01'], 'and it recovers on the next sweep');
});

test('markTodayWithData records the local day, idempotently', () => {
  markTodayWithData();
  markTodayWithData();
  assert.equal(daysWithDataCount(), 1);
  assert.ok(hasDataOn(localDateKey()));
});

test('every dated store is represented in SOURCES', () => {
  /*
   * `.220`'s rule, applied before the defect rather than after it: a guard
   * whose *name* claims a scope wider than its *enumeration* is the shape this
   * repo has paid for a dozen times.
   *
   * This asks the question the other way round — of the keys that hold dated
   * rows, which does the sweep not read? A new pillar that writes a dated store
   * and is not added to `SOURCES` fails here rather than silently never
   * counting its days.
   */
  const src = readFileSync(path.join(import.meta.dirname, 'daysWithData.ts'), 'utf8');

  const dated = [
    'nutritionLog',
    'activityLog',
    'mindCheckIns',
    'bodyMetrics',
    'sessionJournal',
    'pillarWins',
  ];
  const missing = dated.filter((k) => !src.includes(`STORAGE_KEYS.${k}`));
  assert.deepEqual(missing, [], 'these stores hold dated rows the sweep never reads');
});
