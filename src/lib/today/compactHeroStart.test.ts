/**
 * Compact hero Start navigates from first paint.
 * Clear state is a real Link to /active that writes the session.
 * A safety withhold is the same Link to /move and does not compose.
 * It is not a JS-only button, and it does not preventDefault.
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
  const endAt = src.indexOf('</section>', startAt);
  assert.ok(endAt > startAt, 'the session section closes');
  return src.slice(startAt, endAt);
}

test('compact hero Start is a Link — clear goes to /active, a safety withhold goes to /move', () => {
  const hero = heroStartSlice(read('src/page-components/TodayDesk.tsx'));
  assert.match(hero, /data-testid="today-start-cta"/);
  assert.match(hero, /href=\{withholdHero \? '\/move' : '\/active'\}/);
  assert.match(hero, /if \(withholdHero\) return/);
  assert.match(hero, /writeTodayComposeSession\(\)/);
  assert.doesNotMatch(hero, /preventDefault/);
  assert.doesNotMatch(
    hero,
    /<button[\s\S]*house-btn-primary/,
    'hero Start must be a Link so compact survives without hydrate'
  );
});

test('safety hero prints the stop line once', () => {
  const src = read('src/page-components/TodayDesk.tsx');
  const titleAt = src.indexOf('const sessionTitle');
  const ledeAt = src.indexOf('const sessionLede');
  const kickerAt = src.indexOf('const sessionKicker');
  assert.ok(titleAt >= 0 && ledeAt > titleAt && kickerAt > ledeAt);
  const kicker = src.slice(kickerAt, src.indexOf('const startLabel'));
  assert.match(kicker, /safetyLine\s*\?\s*null/);
  assert.doesNotMatch(kicker, /safety\.copy/);
  const lede = src.slice(ledeAt, kickerAt);
  assert.match(lede, /sessionTitle === safetyLine/);
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
