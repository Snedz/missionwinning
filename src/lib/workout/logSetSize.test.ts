/**
 * Log set size is house leftover — 12px from house.css, not text-xs.
 * Scoped to the set table. LogConsole stays 19px.
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

test('set-table Log set size is house leftover, not text-xs', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const row = sliceFromTestId(table, 'set-table-log-set');
  assert.match(row, /house-set-log/);
  assert.doesNotMatch(row, /text-xs/);
  assert.match(row, /house-btn-primary/);
});

test('house leftover rule paints set-table Log set size at 12px', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-set-table \.house-set-log \{[^}]*font-size:\s*12px/
  );
  assert.doesNotMatch(
    css,
    /\.mw-house \.house-compose-live \.house-set-log \{[^}]*font-size:/
  );
});

test('LogConsole Log set keeps 19px — shared house-set-log is not the size rule', () => {
  const consoleSrc = read('src/components/workout/LogConsole.tsx');
  const row = consoleSrc.slice(
    consoleSrc.indexOf('house-set-log'),
    consoleSrc.indexOf('house-set-log') + 180
  );
  assert.match(row, /text-\[19px\]/);
});

test('DESIGN names Log set size is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Log set size is house leftover/);
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
