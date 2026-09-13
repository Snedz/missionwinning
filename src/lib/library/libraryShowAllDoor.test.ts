/**
 * Library Show-all door is house leftover — house ink, not shadcn text-foreground / text-sm.
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

test('Library Show-all door is house leftover, not text-foreground / text-sm', () => {
  const page = read('src/page-components/LibraryPage.tsx');
  const needle = 'data-testid="library-show-all"';
  const start = page.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const row = page.slice(start - 280, start + 80);
  assert.match(row, /house-show-all-door/);
  assert.doesNotMatch(row, /text-foreground/);
  assert.doesNotMatch(row, /text-sm/);
  assert.doesNotMatch(row, /house-btn-primary/);
});

test('house leftover rule paints Library Show-all door with --house-ink', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-catalog \.house-show-all-door \{[^}]*--house-ink/
  );
});

test('DESIGN names Library Show-all door is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Library Show-all door is house leftover/);
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
