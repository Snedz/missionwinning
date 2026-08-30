/**
 * Log set on the set table is house leftover press — ink, not poster red.
 * Honesty slices start at data-testid so house classes must follow that attribute.
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

test('Log set slice after set-table-log-set is house leftover press, not poster', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const logSet = sliceFromTestId(table, 'set-table-log-set');
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
  assert.match(logSet, /primary-action/);
  assert.match(logSet, /min-h-\[44px\]/);
  assert.doesNotMatch(logSet, /accent-poster/);
});

test('house leftover rule paints Log set with --house-press', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-press:\s*#18181b/);
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-set-log \{[^}]*--house-press/
  );
});

test('DESIGN names Log set as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Log set is house leftover/);
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
