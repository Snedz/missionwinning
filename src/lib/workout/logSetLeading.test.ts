/**
 * Log set leading is house leftover — 1.25 from house.css, not leading-tight.
 * Scoped to the set table.
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

test('set-table Log set leading is house leftover, not leading-tight', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const row = sliceFromTestId(table, 'set-table-log-set');
  assert.match(row, /house-set-log/);
  assert.doesNotMatch(row, /leading-tight/);
  assert.match(row, /house-btn-primary/);
});

test('house leftover rule paints set-table Log set leading at 1.25', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-set-table \.house-set-log \{[^}]*line-height:\s*1\.25/
  );
  assert.doesNotMatch(
    css,
    /\.mw-house \.house-compose-live \.house-set-log \{[^}]*line-height:/
  );
});

test('DESIGN names Log set leading is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Log set leading is house leftover/);
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
