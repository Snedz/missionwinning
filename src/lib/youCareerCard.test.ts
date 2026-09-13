/**
 * You first-paint career card is house leftover — house-card, not Card border-2.
 * Empty EmptyState stays parked.
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

test('You first-paint career card is house leftover, not Card', () => {
  const card = read('src/components/profile/CareerLineCard.tsx');
  const needle = 'data-testid="athlete-career-card"';
  const start = card.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const row = card.slice(start - 160, start + 80);
  assert.match(row, /house-card/);
  assert.doesNotMatch(row, /<Card[\s>]/);
  assert.doesNotMatch(row, /content-card/);
  assert.doesNotMatch(row, /border-2/);
  assert.doesNotMatch(row, /border-border/);
  assert.doesNotMatch(row, /house-btn-primary/);
});

test('You career card does not import shadcn Card', () => {
  const card = read('src/components/profile/CareerLineCard.tsx');
  assert.doesNotMatch(card, /from '@\/components\/ui\/card'/);
});

test('DESIGN names You first-paint career card is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /You first-paint career card is house leftover/);
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
