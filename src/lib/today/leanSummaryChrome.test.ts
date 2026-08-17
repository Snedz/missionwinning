/**
 * Lean Today is Summary: date, pins, one sentence, one Start.
 * Tour chrome is deleted, not hidden.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const lean = () =>
  readFileSync(path.join(root, 'src/page-components/HomeTodayLean.tsx'), 'utf8');

test('lean Today is date + pins + highlights + docked Start', () => {
  const src = lean();
  assert.match(src, /<TodayPageHeader\b/);
  assert.match(src, /showJourneyStrip=\{false\}/);
  assert.match(src, /<TodaySummaryPins\b/);
  assert.match(src, /todayHighlightsFromLogs\(/);
  assert.match(src, /<ScreenDock>[\s\S]*?<JourneyHero/);
  assert.match(src, /resolveSummaryPins\(/);
});

test('lean Today deletes tour blocks instead of hiding them', () => {
  const src = lean();
  assert.doesNotMatch(src, /TodayRewardsCard/);
  assert.doesNotMatch(src, /ContinuityStrip/);
  assert.doesNotMatch(src, /TodayDayReviewCard/);
  assert.doesNotMatch(src, /<FirstStepsCard\b/);
  assert.doesNotMatch(src, /todayBasicEncouragement/);
  assert.doesNotMatch(src, /todayCoachInviteMayMount/);
  assert.doesNotMatch(src, /buildContinuitySuggestions/);
});
