/**
 * The calendar says what happened, in every timezone, and nothing else.
 *
 * `.212` swept fifteen sites for `toISOString()`-derived calendar dates and wrote
 * the rule down: *a guard keyed to one spelling of a defect has only ever tested
 * that spelling*. A month grid is the densest possible instance — 28–31 date
 * derivations per render — so these run under the same UTC+14 / UTC−11 pair that
 * wave used, where an off-by-one-day is guaranteed to show if it exists.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  localMonthDays,
  localMonthKey,
  localMonthLeadingBlanks,
  shiftLocalMonth,
} from '@/lib/time/localDate';
import {
  buildMonthGrid,
  monthIsBeyondRetention,
  trainedDayKeys,
} from '@/lib/history/monthGrid';

test('month length comes from the calendar, including leap February', () => {
  assert.equal(localMonthDays('2026-02').length, 28);
  assert.equal(localMonthDays('2028-02').length, 29, '2028 is a leap year');
  assert.equal(localMonthDays('2026-04').length, 30);
  assert.equal(localMonthDays('2026-07').length, 31);
  assert.equal(localMonthDays('2026-07')[0], '2026-07-01');
  assert.equal(localMonthDays('2026-07')[30], '2026-07-31');
});

test('month navigation rolls the year without a special case', () => {
  assert.equal(shiftLocalMonth('2026-12', 1), '2027-01');
  assert.equal(shiftLocalMonth('2026-01', -1), '2025-12');
  assert.equal(shiftLocalMonth('2026-07', 0), '2026-07');
  assert.equal(shiftLocalMonth('2026-03', -14), '2025-01');
});

test('the grid is Monday-first, matching every other week in the app', () => {
  // 2026-07-01 is a Wednesday → Mon, Tue blank.
  assert.equal(localMonthLeadingBlanks('2026-07'), 2);
  // 2026-02-01 is a Sunday → the whole week precedes it.
  assert.equal(localMonthLeadingBlanks('2026-02'), 6);
  // 2026-06-01 is a Monday → no blanks.
  assert.equal(localMonthLeadingBlanks('2026-06'), 0);
});

test('trained beats logged; everything else is blank, never missed', () => {
  const grid = buildMonthGrid({
    monthKey: '2026-07',
    trainedKeys: new Set(['2026-07-02', '2026-07-06']),
    loggedKeys: new Set(['2026-07-02', '2026-07-03']),
    today: new Date(2026, 6, 10, 12),
  });

  const at = (d: number) => grid.days.find((x) => x.day === d)!;
  assert.equal(at(2).mark, 'trained', 'a day with both is a training day');
  assert.equal(at(3).mark, 'logged');
  assert.equal(at(6).mark, 'trained');
  assert.equal(at(4).mark, 'none');
  assert.equal(grid.trainedDays, 2);
  assert.equal(grid.loggedDays, 1);

  // The rule this file exists for: no cell may ever say "missed".
  const marks = new Set(grid.days.map((d) => d.mark));
  assert.deepEqual(
    [...marks].filter((m) => !['trained', 'logged', 'none'].includes(m)),
    [],
    'the vocabulary is trained / logged / none — "missed" is not reconstructable ' +
      'for a past date and would be shame if it were'
  );
});

test('today is marked, and the future claims nothing', () => {
  const grid = buildMonthGrid({
    monthKey: '2026-07',
    trainedKeys: new Set(),
    loggedKeys: new Set(),
    today: new Date(2026, 6, 10, 12),
  });
  assert.equal(grid.days.filter((d) => d.isToday).length, 1);
  assert.equal(grid.days.find((d) => d.day === 10)!.isToday, true);
  assert.equal(grid.days.find((d) => d.day === 11)!.isFuture, true);
  assert.equal(grid.days.find((d) => d.day === 9)!.isFuture, false);
  assert.equal(grid.days.find((d) => d.day === 10)!.isFuture, false, 'today is not the future');
});

test('a deleted session is not a training day', () => {
  const counts = trainedDayKeys(
    [
      { completedAt: '2026-07-02T10:00:00.000Z' },
      { completedAt: '2026-07-02T18:00:00.000Z' },
      { completedAt: '2026-07-03T10:00:00.000Z', deletedAt: '2026-07-04T00:00:00.000Z' },
      { completedAt: 'not-a-date' },
    ],
    (iso) => {
      const d = new Date(iso);
      return Number.isNaN(d.getTime())
        ? ''
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  );
  assert.equal(counts.size, 1, 'the tombstone and the unparseable row are both dropped');
  assert.equal([...counts.values()][0], 2, 'two sessions on the same day count as two');
});

test('a month past the retention window is flagged rather than silently thinner', () => {
  const today = new Date(2026, 6, 15, 12);
  assert.equal(monthIsBeyondRetention('2026-07', today), false);
  assert.equal(monthIsBeyondRetention('2026-06', today), false, 'within 90 days');
  assert.equal(
    monthIsBeyondRetention('2025-11', today),
    true,
    'nutrition prunes at 90 days and check-ins cap at 90 entries — an old month ' +
      'showing no logged days is a storage limit, not a fact about the athlete'
  );
});

/**
 * The timezone sweep. Every date in this module is built from local fields, so
 * an accidental `toISOString()` anywhere in the chain shifts the whole grid by a
 * day at the extremes — which is exactly how `.212` and `.199` were found.
 */
test('the grid is identical in shape at UTC+14 and UTC−11', () => {
  const original = process.env.TZ;
  const shapes: string[] = [];
  try {
    for (const tz of ['Pacific/Kiritimati', 'Pacific/Niue', 'UTC', 'Europe/Berlin']) {
      process.env.TZ = tz;
      const days = localMonthDays('2026-07');
      assert.equal(days.length, 31, `${tz}: July has 31 days everywhere`);
      assert.equal(days[0], '2026-07-01', `${tz}: the month starts on the 1st`);
      assert.equal(days[30], '2026-07-31', `${tz}: and ends on the 31st`);
      shapes.push(`${localMonthLeadingBlanks('2026-07')}`);
      assert.equal(localMonthKey(new Date(2026, 6, 1)), '2026-07', `${tz}: month key`);
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
  assert.equal(
    new Set(shapes).size,
    1,
    'the leading-blank count must not depend on the timezone — if it does, a date ' +
      'is being derived through UTC somewhere in the chain'
  );
});
