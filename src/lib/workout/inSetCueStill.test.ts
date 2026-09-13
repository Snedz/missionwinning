/**
 * In-set cue still is house leftover — house paper, not shadcn bg-background.
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

test('in-set cue still is house leftover, not bg-background', () => {
  const cues = read('src/components/workout/InSetCueList.tsx');
  const row = sliceFromTestId(cues, 'in-set-cues-demo', 200);
  assert.match(row, /house-cue-still/);
  assert.doesNotMatch(row, /bg-background/);
  assert.doesNotMatch(row, /house-btn-primary/);
});

test('house leftover rule paints in-set cue still with --house-paper', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-cue-still \{[^}]*--house-paper/
  );
});

test('DESIGN names In-set cue still is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /In-set cue still is house leftover/);
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
