/**
 * Nav to /coach is not the app-group Loading skeleton.
 * Segment loading is house leftover — a page import suspends and the group wins.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

test('/coach segment loading is house leftover — not group SkeletonCard', () => {
  const rel = 'app/(app)/coach/loading.tsx';
  assert.ok(existsSync(path.join(root, rel)), 'missing app/(app)/coach/loading.tsx');
  const src = read(rel);
  assert.match(src, /house-empty|house-plan/);
  assert.doesNotMatch(src, /CoachPage/);
  assert.doesNotMatch(src, /SkeletonCard|Skeleton /);
  assert.doesNotMatch(src, /Loading…|Loading\.\.\./);
  const group = read('app/(app)/loading.tsx');
  assert.match(group, /SkeletonCard/);
});

test('DESIGN names /coach client nav is not group Loading', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /\/coach client nav is not group Loading/);
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
