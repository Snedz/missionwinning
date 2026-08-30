/**
 * First-rooms History navigates from first paint.
 * href="/history" must survive without JS. Lock until a finish stays.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 420): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

test('first-rooms History is href=/history — click is not a JS-only button', () => {
  const card = read('src/components/house/HouseFirstRoomsCard.tsx');
  const rooms = read('src/components/house/houseFirstRooms.ts');
  assert.match(rooms, /key: 'open-history'/);
  assert.match(rooms, /href: '\/history'/);
  const row = sliceFromTestId(card, 'today-first-history');
  assert.match(row, /href=["']\/history["']/);
  assert.doesNotMatch(row, /house-btn-primary/);
  assert.match(card, /row\.kind === 'navigate'/);
  assert.match(card, /if \(row\.locked\) event\.preventDefault\(\)/);
});

test('DESIGN names First-rooms History navigates from first paint', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /First-rooms History navigates from first paint/);
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
