/**
 * History first paint is house leftover — not Loading sessions.
 * Empty still waits for persist hydrate. Calendar / charts stay parked.
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

test('History first paint is house leftover — not Loading sessions', () => {
  const src = read('src/page-components/HistoryPage.tsx');
  const start = src.indexOf('{!hasHydrated');
  const end = src.indexOf('session-history-empty');
  assert.ok(start >= 0 && end > start, 'missing hydrate first-paint branch');
  const branch = src.slice(start, end);
  assert.doesNotMatch(branch, /SkeletonBlock|Loading sessions/);
  assert.match(branch, /house-empty|house-history/);
  assert.match(src, /hasHydrated/, 'empty still waits for persist hydrate');
  assert.match(src, /session-history-empty/);
});

test('DESIGN names History first paint is not Loading sessions', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /History first paint is not Loading sessions/);
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
