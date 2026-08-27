/**
 * WEEK must be findable on Today without becoming a dashboard.
 *
 * Lean hid Coach in Show all. The door is a link to /coach — not
 * the week strip, not a second Start, not a feed.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const DOOR = 'src/components/today/TodayWeekDoor.tsx';
const LEAN = 'src/page-components/HomeTodayLean.tsx';

test('Lean first paint mounts the Week door, not the week strip', () => {
  const lean = read(LEAN);
  assert.match(lean, /<TodayWeekDoor\s*\/>/, 'WEEK door belongs on first paint');
  assert.doesNotMatch(lean, /TodayCoachWeekStrip/, 'the strip stays the house, not the desk');
  assert.doesNotMatch(lean, /HomeTodayDashboard/, 'do not remount the dashboard tour');
  assert.match(lean, /dock="start"/, 'one Start stays in the dock');
});

test('Week door is a /coach link, not a second Start', () => {
  assert.ok(existsSync(path.join(root, DOOR)), 'TodayWeekDoor.tsx is the WEEK door');
  const src = read(DOOR);
  assert.match(src, /href=["']\/coach["']/, 'door must open /coach');
  assert.match(src, /data-testid="today-week-door"/);
  assert.doesNotMatch(src, /JourneyHero|runTodayPrimaryAction|startWorkout/);
  assert.doesNotMatch(src, /TodayCoachWeekStrip|WeekStrip|CoachTodayCard/);
  assert.doesNotMatch(
    src,
    /from ['"]@\/lib\/social|from ['"]@\/components\/social|ChatWindow|missionServer/
  );
});
