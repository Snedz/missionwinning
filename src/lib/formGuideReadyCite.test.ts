/**
 * Form guide ready-position cite is house leftover — house-lede, not text-muted.
 * Got it stays outline. Portals stay mw-house.
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

test('Form guide ready-position cite is house leftover, not text-muted', () => {
  const sheet = read('src/components/form/FormGuideSheet.tsx');
  const needle = '{!guide.militaryStyle';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const cite = sheet.slice(start, start + 280);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(sheet, /className="mw-house house-form-guide"/);
});

test('form-guide-got-it slice never house-btn-primary', () => {
  const gotIt = sliceFromTestId(
    read('src/components/form/FormGuideSheet.tsx'),
    'form-guide-got-it'
  );
  assert.doesNotMatch(gotIt, /house-btn-primary/);
});

test('house leftover rule paints form-guide ready cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-form-guide \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Form guide ready-position cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Form guide ready-position cite is house leftover/);
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
