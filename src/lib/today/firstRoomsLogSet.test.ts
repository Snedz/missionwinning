/**
 * First-rooms Log a set navigates from first paint.
 * href="/active" must survive without JS. Write compose on click.
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

function logSetRowSlice(src: string): string {
  const start = src.indexOf("data-house-step={row.key}");
  assert.ok(start >= 0, 'missing data-house-step row');
  return src.slice(start, start + 900);
}

test('first-rooms Log a set is href=/active — click is not a JS-only button', () => {
  const card = read('src/components/house/HouseFirstRoomsCard.tsx');
  const rooms = read('src/components/house/houseFirstRooms.ts');
  assert.match(rooms, /key: 'log-set'/);
  assert.match(rooms, /href: '\/active'/);
  const row = logSetRowSlice(card);
  assert.match(row, /data-testid="today-first-log-set"/);
  assert.match(row, /href=["']\/active["']/);
  assert.match(card, /writeTodayComposeSession\(\)/);
  assert.doesNotMatch(row, /preventDefault/);
  assert.doesNotMatch(row, /house-btn-primary/);
});

test('DESIGN names First-rooms Log a set navigates from first paint', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /First-rooms Log a set navigates from first paint/);
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
