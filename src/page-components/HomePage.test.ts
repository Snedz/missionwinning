import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Today first paint is the house desk, not Lean or the #885 rail', () => {
  const home = readFileSync('src/page-components/HomePage.tsx', 'utf8');
  assert.match(home, /<TodayDesk\s*\/>/);
  assert.doesNotMatch(home, /HomeTodayLean/);
  const desk = readFileSync('src/page-components/TodayDesk.tsx', 'utf8');
  assert.match(desk, /runTodayPrimaryAction\(/);
  assert.match(desk, /includeColdStart:\s*true/);
  assert.doesNotMatch(desk, /from '@\/components\/today\/TodaySummaryPins'/);
  assert.doesNotMatch(desk, /from '@\/components\/today\/TodayQuietWeekStrip'/);
  assert.doesNotMatch(desk, /from '@\/page-components\/HomeTodayLean'/);
});
