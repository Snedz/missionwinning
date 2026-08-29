/**
 * Set row hairline is house leftover — house-line, not shadcn border-border.
 * Incomplete first-paint rows only.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

test('incomplete set row hairline is house leftover, not border-border', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const start = table.indexOf('data-set-complete=');
  assert.ok(start >= 0, 'missing data-set-complete row');
  const row = table.slice(start, start + 420);
  assert.match(row, /house-set-line/);
  assert.doesNotMatch(row, /border-b border-border/);
  assert.doesNotMatch(row, /house-btn-primary/);
});

test('house leftover rule paints set row hairline with --house-line', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-compose-live tr\.house-set-line \{[^}]*--house-line/
  );
});

test('DESIGN names Set row hairline is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Set row hairline is house leftover/);
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
