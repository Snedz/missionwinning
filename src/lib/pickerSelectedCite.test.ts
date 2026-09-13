/**
 * Exercise picker selected cite is house leftover — house-lede, not text-muted.
 * Option-details leftover stays. Empty cite stays. Picker rewrite stays parked.
 * After-set cites stay parked. Log set stays filled.
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

function sliceSelected(picker: string): string {
  const needle = 'exercisePickerSelected';
  const start = picker.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return picker.slice(Math.max(0, start - 180), start + 40);
}

function sliceEmpty(picker: string): string {
  const needle = 'exercisePickerEmpty';
  const start = picker.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return picker.slice(Math.max(0, start - 180), start + 40);
}

function sliceOptionDetail(picker: string): string {
  const needle = 'ex.muscleGroups.slice(0, 2)';
  const start = picker.indexOf(needle);
  assert.ok(start >= 0, 'missing picker option detail cite');
  return picker.slice(Math.max(0, start - 160), start + needle.length);
}

test('Exercise picker selected cite is house leftover, not text-muted', () => {
  const picker = read('src/components/library/ExercisePicker.tsx');
  const cite = sliceSelected(picker);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
});

test('picker option-details leftover stays (not this leftover)', () => {
  const picker = read('src/components/library/ExercisePicker.tsx');
  const cite = sliceOptionDetail(picker);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
});

test('picker empty cite leftover ships separately as house-lede', () => {
  const picker = read('src/components/library/ExercisePicker.tsx');
  assert.match(sliceEmpty(picker), /house-lede/);
  assert.doesNotMatch(sliceEmpty(picker), /text-muted-foreground/);
});

test('picker rewrite stays parked (not this leftover)', () => {
  const picker = read('src/components/library/ExercisePicker.tsx');
  assert.match(picker, /border-2 border-border/);
  assert.match(picker, /hover:bg-muted/);
  assert.doesNotMatch(picker, /house-btn-primary/);
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

test('house leftover rule paints picker selected cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house \.house-picker-selected\.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Exercise picker selected cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Exercise picker selected cite is house leftover/);
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
});
