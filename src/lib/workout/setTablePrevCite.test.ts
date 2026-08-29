/**
 * Prev cite is house leftover — muted house ink, not shadcn text-muted.
 * Honesty slices the set-table-prev cell.
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

test('Prev cite slice is house leftover, not text-muted', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const needle = 'data-testid="set-table-prev"';
  const start = table.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const cell = table.slice(start - 220, start + 200);
  assert.match(cell, /house-set-prev/);
  assert.doesNotMatch(cell, /text-muted-foreground/);
  assert.doesNotMatch(cell, /house-btn-primary/);
});

test('house leftover rule paints Prev cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-set-prev \{[^}]*--house-muted/
  );
});

test('DESIGN names Prev cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Prev cite is house leftover/);
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
