/**
 * You table Edit / row hairlines is house leftover — house rows, not border-t-2.
 * Selects stay.
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

test('You table display row hairlines are house leftover, not border-t-2', () => {
  const card = read('src/components/profile/AthleteTableCard.tsx');
  const needle = 'data-testid="athlete-table-display"';
  const start = card.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const block = card.slice(start, start + 520);
  assert.match(block, /house-table-row/);
  assert.doesNotMatch(block, /border-t-2/);
  assert.doesNotMatch(block, /house-btn-primary/);
});

test('You table Edit disclosure is house leftover, not border-t-2', () => {
  const card = read('src/components/profile/AthleteTableCard.tsx');
  const needle = 'data-testid="athlete-table-edit"';
  const start = card.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const edit = card.slice(start - 160, start + 80);
  assert.match(edit, /house-table-edit/);
  assert.doesNotMatch(edit, /border-t-2/);
  assert.doesNotMatch(edit, /house-btn-primary/);
});

test('house leftover rule paints table hairlines with --house-line', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-profile \.house-table-row \{[^}]*--house-line/
  );
  assert.match(
    css,
    /\.mw-house \.house-profile \.house-table-edit \{[^}]*--house-line/
  );
});

test('DESIGN names You table Edit / row hairlines is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /You table Edit \/ row hairlines is house leftover/);
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
