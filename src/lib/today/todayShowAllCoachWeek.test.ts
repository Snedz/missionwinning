/**
 * After Summary, Coach week is unreachable on /log.
 * Recover it in Show all. Not on first paint. Not the dashboard tour.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const SHOW = 'src/components/today/TodayShowAll.tsx';
const LEAN = 'src/page-components/HomeTodayLean.tsx';

test('Lean first paint does not pull the week strip', () => {
  const lean = read(LEAN);
  assert.doesNotMatch(lean, /TodayCoachWeekStrip/, 'the strip stays the house, not the desk');
  assert.match(lean, /<TodayWeekDoor\s*\/>/, 'WEEK is a door on first paint');
  assert.match(lean, /<TodayShowAll\b/, 'the house door is a child, not a second Today');
});

test('Show all houses Coach week, not the dashboard tour', () => {
  assert.ok(existsSync(path.join(root, SHOW)), 'TodayShowAll.tsx is the Lean house');
  const src = read(SHOW);
  assert.match(src, /TodayCoachWeekStrip/);
  assert.match(src, /todayShowAll/);
  assert.match(src, /defaultValue: 'Show all'/);
  assert.doesNotMatch(src, /fuelShowMore/, 'Fuel pack says Search, barcode & recipes');
  assert.match(src, /data-testid="today-show-all"/);
  assert.doesNotMatch(src, /TodayRewardsCard/);
  assert.doesNotMatch(src, /ContinuityStrip/);
  assert.doesNotMatch(src, /TodayDayReviewCard/);
  assert.doesNotMatch(src, /<FirstStepsCard\b/);
  assert.doesNotMatch(src, /TodayDashboardHeader/);
  assert.doesNotMatch(src, /HomeTodayDashboard/);
});
