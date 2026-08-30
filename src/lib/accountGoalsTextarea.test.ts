/**
 * Account first-paint goals textarea is house leftover — house-field, not border-2.
 * Save stays outline.
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

test('Account first-paint goals textarea is house leftover, not border-2', () => {
  const card = read('src/components/profile/ProfilePreferencesCard.tsx');
  const needle = 'data-testid="account-goals-textarea"';
  const start = card.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const field = card.slice(start - 160, start + 80);
  assert.match(field, /house-field/);
  assert.doesNotMatch(field, /border-2/);
  assert.doesNotMatch(field, /border-border/);
  assert.doesNotMatch(field, /house-btn-primary/);
});

test('house leftover rule paints goals textarea with --house-line', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-account \.house-field \{[^}]*--house-line/
  );
});

test('DESIGN names Account first-paint goals textarea is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Account first-paint goals textarea is house leftover/);
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
