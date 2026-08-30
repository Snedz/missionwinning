/**
 * Compact hero Start navigates from first paint.
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

function heroStartSlice(src: string): string {
  const startAt = src.indexOf('id="today-start"');
  assert.ok(startAt >= 0, 'missing #today-start');
  const roomsAt = src.indexOf('<HouseFirstRoomsCard', startAt);
  assert.ok(roomsAt > startAt, 'hero must sit before first rooms');
  return src.slice(startAt, roomsAt);
}

test('compact hero Start is href=/active — click is not a JS-only button', () => {
  const hero = heroStartSlice(read('src/page-components/TodayDesk.tsx'));
  assert.match(hero, /data-testid="today-start-cta"/);
  assert.match(hero, /href=["']\/active["']/);
  assert.match(hero, /writeTodayComposeSession\(\)/);
  assert.doesNotMatch(hero, /preventDefault/);
  assert.doesNotMatch(
    hero,
    /<button[\s\S]*house-btn-primary/,
    'hero Start must be a Link so compact survives without hydrate'
  );
});

test('DESIGN names Compact hero Start navigates from first paint', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Compact hero Start navigates from first paint/);
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
