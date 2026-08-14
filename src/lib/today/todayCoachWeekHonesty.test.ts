/**
 * G6 — Coach week on Coach and Today must show dose + adapt.
 * JourneyHero owns the red. The week strip is evidence, not a second CTA.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('Today week strip shows dose and compact adapt, never a second red', () => {
  const src = read('src/components/coach/TodayCoachWeekStrip.tsx');
  assert.match(src, /summarizeWeekDose/);
  assert.match(src, /today-coach-week-dose/);
  assert.match(src, /<CoachAdaptBanner/);
  assert.match(src, /compact/);
  assert.doesNotMatch(src, /primary-action/);
});

test('Coach page still shows week dose and adapt', () => {
  const src = read('src/page-components/CoachPage.tsx');
  assert.match(src, /summarizeWeekDose/);
  assert.match(src, /coach-week-dose/);
  assert.match(src, /<CoachAdaptBanner/);
});

test('Dashboard mounts the week strip; Lean does not pull Coach onto first paint', () => {
  const dash = read('src/page-components/HomeTodayDashboard.tsx');
  const lean = read('src/page-components/HomeTodayLean.tsx');
  assert.match(dash, /TodayCoachWeekStrip/);
  assert.match(dash, /'coach-week'/);
  assert.doesNotMatch(lean, /TodayCoachWeekStrip/);
});
