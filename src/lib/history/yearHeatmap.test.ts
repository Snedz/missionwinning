/**
 * Year heatmap bucketing. Live sessions on a local day, tombs out,
 * nothing outside the window, and a UTC date slice must not move the day.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildYearHeatmap, sessionHeatLevel, YEAR_HEAT_WEEKS } from './yearHeatmap.ts';

const src = readFileSync(path.join(import.meta.dirname, 'yearHeatmap.ts'), 'utf8');

function localNoonIso(y: number, m: number, d: number, h = 12, min = 0): string {
  return new Date(y, m - 1, d, h, min, 0, 0).toISOString();
}

function cellAt(
  grid: ReturnType<typeof buildYearHeatmap>,
  key: string
) {
  for (const week of grid.weeks) {
    const cell = week.cells.find((c) => c.key === key);
    if (cell) return cell;
  }
  return undefined;
}

test('levels are 0 / 1 / 2 / 3 / 4+ and junk is empty', () => {
  assert.equal(sessionHeatLevel(0), 0);
  assert.equal(sessionHeatLevel(-1), 0);
  assert.equal(sessionHeatLevel(1.5), 0);
  assert.equal(sessionHeatLevel(Number.NaN), 0);
  assert.equal(sessionHeatLevel(1), 1);
  assert.equal(sessionHeatLevel(2), 2);
  assert.equal(sessionHeatLevel(3), 3);
  assert.equal(sessionHeatLevel(4), 4);
  assert.equal(sessionHeatLevel(9), 4);
});

test('two sessions on one local day bucket together; a tomb and junk do not', () => {
  const today = new Date(2026, 8, 24, 15, 0, 0, 0);
  const grid = buildYearHeatmap({
    today,
    history: [
      { completedAt: localNoonIso(2026, 9, 23, 8) },
      { completedAt: localNoonIso(2026, 9, 23, 18, 40) },
      { completedAt: localNoonIso(2026, 9, 24, 9), deletedAt: localNoonIso(2026, 9, 25) },
      { completedAt: 'not-a-date' },
      { completedAt: '' },
    ],
  });

  const day = cellAt(grid, '2026-09-23');
  assert.ok(day, 'the logged day is a cell');
  assert.equal(day.sessions, 2);
  assert.equal(day.level, 2);
  assert.equal(cellAt(grid, '2026-09-24')?.sessions, 0, 'a tomb is not a logged day');
  assert.equal(grid.trainedDays, 1);
  assert.equal(grid.sessions, 2);
});

test('the grid is Monday-first and ends on the week of today', () => {
  const today = new Date(2026, 8, 24, 15, 0, 0, 0);
  const grid = buildYearHeatmap({ today, history: [] });
  assert.equal(grid.weeks.length, YEAR_HEAT_WEEKS);
  assert.equal(grid.endKey, '2026-09-24');
  const last = grid.weeks[grid.weeks.length - 1];
  assert.ok(last);
  assert.equal(last.weekKey, '2026-09-21', '2026-09-24 is a Thursday; the column starts Monday');
  assert.equal(last.cells.length, 7);
  assert.deepEqual(
    last.cells.map((c) => c.weekday),
    [0, 1, 2, 3, 4, 5, 6]
  );
  assert.equal(last.cells[0].key, '2026-09-21');
  assert.equal(last.cells[3].isToday, true);
  assert.equal(last.cells[4].isFuture, true, 'Friday has not happened');
  assert.equal(last.cells[4].sessions, 0);
  assert.equal(grid.trainedDays, 0);
  assert.equal(grid.sessions, 0);
  for (const week of grid.weeks) {
    assert.equal(week.cells[0].key, week.weekKey);
  }
});

test('a session outside the window is not a cell and is not in the totals', () => {
  const today = new Date(2026, 8, 24, 15, 0, 0, 0);
  const grid = buildYearHeatmap({
    today,
    weeks: 2,
    history: [
      { completedAt: localNoonIso(2026, 9, 22) },
      { completedAt: localNoonIso(2026, 8, 1) },
    ],
  });
  assert.equal(grid.weeks.length, 2);
  assert.equal(cellAt(grid, '2026-09-22')?.sessions, 1);
  assert.equal(cellAt(grid, '2026-08-01'), undefined);
  assert.equal(grid.trainedDays, 1);
  assert.equal(grid.sessions, 1);
});

test('four sessions on one day are level 4, and a future log in this week still counts', () => {
  const today = new Date(2026, 8, 24, 15, 0, 0, 0);
  const grid = buildYearHeatmap({
    today,
    weeks: 1,
    history: [
      { completedAt: localNoonIso(2026, 9, 22) },
      { completedAt: localNoonIso(2026, 9, 22, 13) },
      { completedAt: localNoonIso(2026, 9, 22, 14) },
      { completedAt: localNoonIso(2026, 9, 22, 15) },
      { completedAt: localNoonIso(2026, 9, 25, 9) },
    ],
  });
  assert.equal(cellAt(grid, '2026-09-22')?.level, 4);
  const friday = cellAt(grid, '2026-09-25');
  assert.equal(friday?.isFuture, true);
  assert.equal(friday?.sessions, 1);
  assert.equal(grid.sessions, 5);
});

test('east of UTC, a morning session stays on the local day', () => {
  const previous = process.env.TZ;
  process.env.TZ = 'Pacific/Kiritimati';
  try {
    // 01:00 local on the 24th is still the 23rd in UTC. Slicing the ISO
    // date would file the session on the wrong day.
    const today = new Date(2026, 8, 24, 15, 0, 0, 0);
    const logged = new Date(2026, 8, 24, 1, 0, 0, 0);
    assert.notEqual(logged.toISOString().slice(0, 10), '2026-09-24');
    const grid = buildYearHeatmap({
      today,
      weeks: 1,
      history: [{ completedAt: logged.toISOString() }],
    });
    assert.equal(cellAt(grid, '2026-09-24')?.sessions, 1);
    assert.equal(cellAt(grid, '2026-09-23')?.sessions, 0);
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('the helper does not derive a calendar date from an ISO slice', () => {
  assert.doesNotMatch(src, /\.toISOString\s*\(/);
  assert.doesNotMatch(src, /\.slice\(\s*0\s*,\s*10\s*\)/);
  assert.match(src, /localDateKeyFromIso/);
  assert.match(src, /trainedDayKeys/);
});
