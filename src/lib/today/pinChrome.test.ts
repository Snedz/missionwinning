/**
 * Pins are doors. Paper, not a second red Start. Edit persists.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const pins = () =>
  readFileSync(path.join(root, 'src/components/today/TodaySummaryPins.tsx'), 'utf8');
const lean = () =>
  readFileSync(path.join(root, 'src/page-components/HomeTodayLean.tsx'), 'utf8');
const keys = () =>
  readFileSync(path.join(root, 'src/lib/storage/keys.ts'), 'utf8');

test('the session pin is a tap, not a dead card', () => {
  const src = pins();
  assert.match(src, /data-testid="today-summary-pin"/);
  assert.match(src, /onSessionPin/);
  assert.doesNotMatch(src, /primary-action/);
});

test('lean Today wires pin tap to the same Start as the dock', () => {
  const src = lean();
  assert.match(src, /onSessionPin=\{handleJourneyPrimary\}/);
  assert.match(src, /todayHighlightsFromLogs\(/);
  assert.match(src, /parseSummaryPinIds\(/);
});

test('pin ids persist under a named storage key', () => {
  assert.match(keys(), /summaryPins:\s*'mw_summary_pins'/);
});
