/**
 * Account first-paint reminders day-review row is house leftover — not CardContent.
 * Select stays. First paint.
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

test('Account first-paint reminders day-review row is house leftover, not CardContent', () => {
  const row = read('src/components/profile/ProfileDayReviewRow.tsx');
  const needle = 'data-testid="account-day-review-row"';
  const start = row.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const slice = row.slice(start - 160, start + 80);
  assert.doesNotMatch(slice, /<CardContent[\s>]/);
  assert.doesNotMatch(slice, /house-btn-primary/);
});

test('Account day-review row does not import shadcn Card', () => {
  const row = read('src/components/profile/ProfileDayReviewRow.tsx');
  assert.doesNotMatch(row, /from '@\/components\/ui\/card'/);
});

test('DESIGN names Account first-paint reminders day-review row is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Account first-paint reminders day-review row is house leftover/);
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
