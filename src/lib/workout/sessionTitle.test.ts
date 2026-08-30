/**
 * Session title is a house title — not font-display + text-[1.35rem].
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

test('session title is a house title, not font-display + text-[1.35rem]', () => {
  const chrome = read('src/components/workout/ActiveSessionChrome.tsx');
  const row = sliceFromTestId(chrome, 'session-title', 240);
  assert.match(row, /house-title/);
  assert.doesNotMatch(row, /font-display/);
  assert.doesNotMatch(row, /text-\[1\.35rem\]/);
  assert.doesNotMatch(row, /text-\[1\.65rem\]/);
  assert.doesNotMatch(row, /house-btn-primary/);
});

test('DESIGN names Session title is a house title', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Session title is a house title/);
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
