/**
 * Account owner-tools cards are house leftover — house-card, not Card.
 * Both frames. Demo cites / View events stay. Not first paint.
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

function eachTestId(src: string, testId: string): string[] {
  const needle = `data-testid="${testId}"`;
  const rows: string[] = [];
  let from = 0;
  while (true) {
    const start = src.indexOf(needle, from);
    if (start < 0) break;
    rows.push(src.slice(start - 160, start + 80));
    from = start + needle.length;
  }
  return rows;
}

test('Account owner-tools cards are house leftover, not Card', () => {
  const card = read('src/components/profile/ProfileOwnerTools.tsx');
  const rows = eachTestId(card, 'account-owner-tools-card');
  assert.equal(rows.length, 2, 'snapshot + events frames');
  for (const row of rows) {
    assert.match(row, /house-card/);
    assert.doesNotMatch(row, /<Card[\s>]/);
    assert.doesNotMatch(row, /content-card/);
    assert.doesNotMatch(row, /house-btn-primary/);
  }
});

test('Account owner-tools cards do not import shadcn Card', () => {
  const card = read('src/components/profile/ProfileOwnerTools.tsx');
  assert.doesNotMatch(card, /from '@\/components\/ui\/card'/);
});

test('DESIGN names Account owner-tools cards is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Account owner-tools cards is house leftover/);
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
