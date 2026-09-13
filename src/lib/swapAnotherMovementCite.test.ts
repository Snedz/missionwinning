/**
 * Swap another-movement cite is house leftover — house-lede, not text-muted.
 * Confirm stays outline. Portals stay mw-house.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

test('Swap another-movement cite is house leftover, not text-muted', () => {
  const sheet = read('src/components/workout/SessionSwapSheet.tsx');
  const needle = 'activeSwapAnotherMovement';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const cite = sheet.slice(Math.max(0, start - 160), start + 80);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(sheet, /className="mw-house house-swap-sheet"/);
});

test('session-swap-confirm slice never house-btn-primary', () => {
  const confirm = sliceFromTestId(
    read('src/components/workout/SessionSwapSheet.tsx'),
    'session-swap-confirm'
  );
  assert.doesNotMatch(confirm, /house-btn-primary/);
});

test('house leftover rule paints swap another-movement cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-swap-sheet \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Swap another-movement cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Swap another-movement cite is house leftover/);
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
