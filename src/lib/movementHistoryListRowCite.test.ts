/**
 * Movement-history list-row cites are house leftover — house-lede, not text-muted.
 * Empty cite leftover stays. Sheet chrome / Close / copy stay. Close stays outline.
 * Log set stays filled. After-set cites stay parked.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

function sliceWorkoutNameCite(sheet: string): string {
  const needle = '{row.workoutName}</p>';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, 'missing workoutName subtitle cite');
  return sheet.slice(Math.max(0, start - 80), start + needle.length);
}

function sliceSetsCite(sheet: string): string {
  const needle = 'formatMovementHistorySets(row.sets, rowType)';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, 'missing sets line cite');
  return sheet.slice(Math.max(0, start - 120), start + 40);
}

function sliceEmptyCite(sheet: string): string {
  const needle = 'data-testid="movement-history-empty"';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return sheet.slice(Math.max(0, start - 220), start + 80);
}

test('Movement-history list-row cites are house leftover, not text-muted', () => {
  const sheet = read('src/components/workout/MovementHistorySheet.tsx');
  const workoutName = sliceWorkoutNameCite(sheet);
  assert.match(workoutName, /house-lede/);
  assert.doesNotMatch(workoutName, /text-muted-foreground/);
  const sets = sliceSetsCite(sheet);
  assert.match(sets, /house-lede/);
  assert.doesNotMatch(sets, /text-muted-foreground/);
  assert.match(sheet, /className="mw-house house-movement-sheet"/);
});

test('movement-history empty cite leftover stays (not this leftover)', () => {
  const sheet = read('src/components/workout/MovementHistorySheet.tsx');
  const cite = sliceEmptyCite(sheet);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(sheet, /No prior sessions yet — log this one/);
});

test('after-set cites stay parked (not this leftover)', () => {
  const next = read('src/components/workout/SetLogNextCite.tsx');
  const nextNeedle = 'data-testid="set-table-next-cite-line"';
  const nextStart = next.indexOf(nextNeedle);
  assert.ok(nextStart >= 0, `missing ${nextNeedle}`);
  const nextLine = next.slice(Math.max(0, nextStart - 180), nextStart + 40);
  assert.match(nextLine, /house-lede/);
  assert.doesNotMatch(nextLine, /text-muted-foreground/);

  const table = read('src/components/workout/SetLogTable.tsx');
  const vsNeedle = 'data-testid="set-table-vs-last"';
  const vsStart = table.indexOf(vsNeedle);
  assert.ok(vsStart >= 0, `missing ${vsNeedle}`);
  const vsLast = table.slice(Math.max(0, vsStart - 180), vsStart + 40);
  assert.match(vsLast, /house-lede/);
  assert.doesNotMatch(vsLast, /text-muted-foreground/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  const e1rm = sliceFromTestId(header, 'session-e1rm');
  assert.match(e1rm, /house-lede/);
  assert.doesNotMatch(e1rm, /text-muted-foreground/);
});

test('Log set stays the sole filled press', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const logSet = sliceFromTestId(table, 'set-table-log-set');
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
});

test('house leftover rule paints movement-history list-row cites with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-movement-sheet \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Movement-history list-row cites is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Movement-history list-row cites is house leftover/);
});

test('Finish / Skip / Swap / Form guide / Repeat last never house-btn-primary', () => {
  const finish = sliceFromTestId(
    read('src/components/workout/ActiveSessionChrome.tsx'),
    'active-finish'
  );
  assert.doesNotMatch(finish, /house-btn-primary/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  for (const id of [
    'active-skip-exercise',
    'active-swap-exercise',
    'active-form-guide',
    'active-repeat-last',
  ] as const) {
    const slice = sliceFromTestId(header, id);
    assert.doesNotMatch(slice, /house-btn-primary/, id);
  }

  const sheet = read('src/components/workout/MovementHistorySheet.tsx');
  const closeNeedle = 'data-testid="movement-history-close"';
  const closeStart = sheet.indexOf(closeNeedle);
  assert.ok(closeStart >= 0, `missing ${closeNeedle}`);
  const close = sheet.slice(Math.max(0, closeStart - 180), closeStart + 40);
  assert.match(close, /house-btn/);
  assert.doesNotMatch(close, /house-btn-primary/);
});
