/**
 * Account first-paint reminders kinds list is house leftover — house list, not border-t-2.
 * Guest path stays.
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

test('Account first-paint reminders kinds list is house leftover, not border-t-2', () => {
  const card = read('src/components/profile/ProfileRemindersCard.tsx');
  const needle = 'data-testid="account-reminders-kinds"';
  const start = card.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const list = card.slice(start - 160, start + 80);
  assert.match(list, /house-reminders-kinds/);
  assert.doesNotMatch(list, /border-t-2/);
  assert.doesNotMatch(list, /house-btn-primary/);
});

test('house leftover rule paints reminders kinds list with --house-line', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-account \.house-reminders-kinds \{[^}]*--house-line/
  );
});

test('DESIGN names Account first-paint reminders kinds list is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Account first-paint reminders kinds list is house leftover/);
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
