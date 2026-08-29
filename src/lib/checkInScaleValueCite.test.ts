/**
 * Check-in scale value cite is house leftover — house-lede, not text-muted.
 * Scale control / confirm stay. Confirm stays outline. Portals stay mw-house.
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

function sliceValueCite(sheet: string): string {
  const needle = '{value}/5';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return sheet.slice(Math.max(0, start - 160), start + 40);
}

test('Check-in scale value cite is house leftover, not text-muted', () => {
  const sheet = read('src/components/workout/SessionCheckInSheet.tsx');
  const cite = sliceValueCite(sheet);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(sheet, /className="mw-house house-checkin"/);
});

test('check-in scale hints stay text-muted (not this leftover)', () => {
  const sheet = read('src/components/workout/SessionCheckInSheet.tsx');
  const hintsStart = sheet.indexOf('{lowHint}');
  assert.ok(hintsStart >= 0, 'missing scale low/high hints');
  const hints = sheet.slice(Math.max(0, hintsStart - 160), hintsStart + 80);
  assert.match(hints, /text-\[10px\] text-muted-foreground/);
});

test('check-in scale control stays house-checkin-scale (not this leftover)', () => {
  const sheet = read('src/components/workout/SessionCheckInSheet.tsx');
  assert.match(sheet, /className="house-checkin-scale"/);
  assert.match(sheet, /house-checkin-tick/);
});

test('check-in confirm never house-btn-primary', () => {
  const sheet = read('src/components/workout/SessionCheckInSheet.tsx');
  const saveStart = sheet.indexOf('sessionCheckInSave');
  assert.ok(saveStart >= 0, 'missing sessionCheckInSave');
  const save = sheet.slice(Math.max(0, saveStart - 220), saveStart + 40);
  assert.doesNotMatch(save, /house-btn-primary/);
  assert.match(save, /house-btn min-h-\[52px\]/);
});

test('house leftover rule paints check-in scale value cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-checkin \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Check-in scale value cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Check-in scale value cite is house leftover/);
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
