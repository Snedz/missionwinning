/**
 * Coach first paint is house leftover — not CoachPlanSkeleton.
 * Generate still waits until !loading. Voice extras stay parked.
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

test('Coach first paint is house leftover — not CoachPlanSkeleton', () => {
  const src = read('src/page-components/CoachPage.tsx');
  const start = src.indexOf('{loading &&');
  const end = src.indexOf('{!loading && locked && plan');
  assert.ok(start >= 0 && end > start, 'missing loading first-paint branch');
  const branch = src.slice(start, end);
  assert.doesNotMatch(branch, /CoachPlanSkeleton|Loading coach plan/);
  assert.match(branch, /house-empty|house-plan/);
  assert.match(src, /!loading && !plan/, 'generate still waits until !loading');
});

test('DESIGN names Coach first paint is not a plan skeleton', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Coach first paint is not a plan skeleton/);
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
