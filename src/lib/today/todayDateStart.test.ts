/**
 * Today is date + session + one Start — not a tour of first rooms / week / Generate.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Today does not mount first rooms or a week strip', () => {
  const src = stripComments(read('src/page-components/TodayDesk.tsx'));
  assert.doesNotMatch(src, /HouseFirstRoomsCard/);
  assert.doesNotMatch(src, /id="today-week"/);
  assert.doesNotMatch(src, /from ['"]@\/components\/house\/HouseFirstRoomsCard['"]/);
});

test('Today does not offer Generate this week', () => {
  const src = stripComments(read('src/page-components/TodayDesk.tsx'));
  assert.doesNotMatch(src, /data-house-week-writer/);
  assert.doesNotMatch(src, /coachGenerateWeek/);
  assert.doesNotMatch(src, /\bgenerateWeek\s*\(/);
});

test('Today Start still writes then /active', () => {
  const src = stripComments(read('src/page-components/TodayDesk.tsx'));
  assert.match(src, /writeTodayComposeSession\(\);\s*router\.push\('\/active'\)/);
  const primaries = [...src.matchAll(/house-btn-primary/g)];
  assert.equal(primaries.length, 1, 'Start is the only filled action on Today');
});
