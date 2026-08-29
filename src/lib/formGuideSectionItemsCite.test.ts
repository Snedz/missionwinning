/**
 * Form guide section items is house leftover — house-lede, not an unpainted span.
 * Breath leftover stays. Ready leftover stays. Got it stays outline. Copy stays.
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

function sliceItems(sheet: string): string {
  const needle = '{item}</span>';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, 'missing form-guide section item cite');
  return sheet.slice(Math.max(0, start - 80), start + needle.length);
}

function sliceBreath(sheet: string): string {
  const needle = '{guide.breathing}</p>';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, 'missing form-guide breath cite');
  return sheet.slice(Math.max(0, start - 80), start + needle.length);
}

function sliceReady(sheet: string): string {
  const needle = '{!guide.militaryStyle';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return sheet.slice(start, start + 280);
}

test('Form guide section items is house leftover, not an unpainted span', () => {
  const sheet = read('src/components/form/FormGuideSheet.tsx');
  const cite = sliceItems(sheet);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(sheet, /className="mw-house house-form-guide"/);
  assert.match(sheet, /house-form-mark/);
});

test('form guide breath cite leftover stays (not this leftover)', () => {
  const sheet = read('src/components/form/FormGuideSheet.tsx');
  const cite = sliceBreath(sheet);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
});

test('form guide ready-position cite leftover stays (not this leftover)', () => {
  const sheet = read('src/components/form/FormGuideSheet.tsx');
  const cite = sliceReady(sheet);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
});

test('form-guide-got-it slice never house-btn-primary', () => {
  const gotIt = sliceFromTestId(
    read('src/components/form/FormGuideSheet.tsx'),
    'form-guide-got-it'
  );
  assert.doesNotMatch(gotIt, /house-btn-primary/);
});

test('after-set cites stay parked (not this leftover)', () => {
  const next = read('src/components/workout/SetLogNextCite.tsx');
  const nextNeedle = 'data-testid="set-table-next-cite-line"';
  const nextStart = next.indexOf(nextNeedle);
  assert.ok(nextStart >= 0, `missing ${nextNeedle}`);
  const nextLine = next.slice(Math.max(0, nextStart - 180), nextStart + 40);
  assert.match(nextLine, /text-muted-foreground/);

  const table = read('src/components/workout/SetLogTable.tsx');
  const vsNeedle = 'data-testid="set-table-vs-last"';
  const vsStart = table.indexOf(vsNeedle);
  assert.ok(vsStart >= 0, `missing ${vsNeedle}`);
  const vsLast = table.slice(Math.max(0, vsStart - 180), vsStart + 40);
  assert.match(vsLast, /text-muted-foreground/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  const e1rm = sliceFromTestId(header, 'session-e1rm');
  assert.match(e1rm, /text-muted-foreground/);
});

test('Log set stays the sole filled press', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const logSet = sliceFromTestId(table, 'set-table-log-set');
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
});

test('house leftover rule paints form-guide section items with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-form-guide li \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Form guide section items is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Form guide section items is house leftover/);
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
