/**
 * Garage first-paint board is house leftover — 1px --house-line, not border-2 / border-border.
 * BuddyList / ChatWindow internals stay.
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

test('Garage first-paint board is house leftover, not border-2 / border-border', () => {
  const page = read('src/page-components/ServerPage.tsx');
  const needle = 'data-testid="garage-board"';
  const start = page.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const row = page.slice(start - 200, start + 80);
  assert.match(row, /house-garage-board/);
  assert.doesNotMatch(row, /border-2/);
  assert.doesNotMatch(row, /border-border/);
  assert.doesNotMatch(row, /house-btn-primary/);
});

test('house leftover rule paints Garage board with --house-line', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-garage \.house-garage-board \{[^}]*--house-line/
  );
});

test('DESIGN names Garage first-paint board is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Garage first-paint board is house leftover/);
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
