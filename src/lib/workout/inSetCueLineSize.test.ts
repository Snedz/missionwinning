/**
 * In-set cue line size is house leftover — 14px from house.css, not text-sm.
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

test('in-set cue line size is house leftover, not text-sm', () => {
  const cues = read('src/components/workout/InSetCueList.tsx');
  const start = cues.indexOf('{lines.map((line) => (');
  assert.ok(start >= 0, 'missing cue line map');
  const row = cues.slice(start, start + 280);
  assert.match(row, /house-cue-line/);
  assert.doesNotMatch(row, /text-sm/);
  assert.doesNotMatch(row, /house-btn-primary/);
});

test('house leftover rule paints in-set cue line size at 14px', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-cue-line \{[^}]*font-size:\s*14px/
  );
});

test('DESIGN names In-set cue line size is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /In-set cue line size is house leftover/);
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
