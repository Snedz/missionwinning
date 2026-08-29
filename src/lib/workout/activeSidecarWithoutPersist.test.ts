/**
 * /active first paint sidecar does not wait on persist.
 * Sidecar matches the painted compose, not an empty "Add an exercise" wait.
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

test('TrainSidecar paints compose when the store is empty — persist does not own it', () => {
  const src = read('src/components/house/TrainSidecar.tsx');
  assert.match(src, /paintTodayComposeWorkout|composeSidecarWorkout/);
  assert.doesNotMatch(
    src,
    /if \(!workout\)/,
    'sidecar must not wait for a hydrated store'
  );
  assert.doesNotMatch(
    src,
    /activeEmptyExercises/,
    'sidecar must not say Add an exercise while the table has sets'
  );
});

test('DESIGN names Sidecar first paint does not wait on persist', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Sidecar first paint does not wait on persist/);
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
