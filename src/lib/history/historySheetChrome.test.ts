/**
 * History first paint is the log. Calendar, charts, journal, glance live in Show all.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = () =>
  readFileSync(
    path.join(import.meta.dirname, '..', '..', 'page-components', 'HistoryPage.tsx'),
    'utf8'
  );

test('the history house is behind Show all, not on first paint', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  const open = jsx.split('<details')[0];
  for (const name of [
    'HistoryCalendar',
    'JournalTimeline',
    'HistoryVolumeChart',
    'History1RMChart',
    'AnatomyHeatMap',
    'MuscleHeatmap',
  ]) {
    assert.doesNotMatch(open, new RegExp(`<${name}\\b`), `${name} is on first paint`);
  }
  assert.doesNotMatch(open, /historyMissionStory/, 'glance card is on first paint');
  assert.doesNotMatch(open, /historyPillarWins/, 'pillar wins are on first paint');
  assert.doesNotMatch(open, /<SegmentedControl/, 'tabs are on first paint');
  assert.match(jsx, /<details/);
  assert.match(jsx, /data-testid="history-show-all"/);
  assert.match(jsx, /<HistoryCalendar\b/);
  assert.match(jsx, /<JournalTimeline\b/);
  assert.match(jsx, /<HistoryVolumeChart\b/);
});

test('first paint is the session list, or the empty invitation', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  const open = jsx.split('<details')[0];
  assert.match(open, /session-history-list/);
  assert.match(open, /session-history-empty/);
  assert.match(open, /session-history-row/);
  assert.match(open, /type="search"/);
});
