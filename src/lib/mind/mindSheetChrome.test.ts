/**
 * Mind first paint is check-in + breathe. Sessions and extras live in Show all.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = () =>
  readFileSync(
    path.join(import.meta.dirname, '..', '..', 'page-components', 'MindPage.tsx'),
    'utf8'
  );

test('the mind house is behind Show all, not on first paint', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  const open = jsx.split('<details')[0];
  assert.doesNotMatch(open, /<GuidedMindSessionRunner\b/, 'session cards are on first paint');
  assert.doesNotMatch(open, /<MindLockedPreview\b/, 'locked preview is on first paint');
  assert.doesNotMatch(open, /MIND_COLLECTIONS/, 'collection rail is on first paint');
  assert.doesNotMatch(open, /mindRecentWins/, 'wins are on first paint');
  assert.doesNotMatch(open, /mindEmptyTitle/, 'empty wall is on first paint');
  assert.match(jsx, /<details/);
  assert.match(jsx, /data-testid="mind-show-all"/);
  assert.match(jsx, /<GuidedMindSessionRunner\b/);
  assert.match(jsx, /<MindLockedPreview\b/);
});

test('first paint is check-in and the breathing timer', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  const open = jsx.split('<details')[0];
  assert.match(open, /<DailyCheckIn\b/);
  assert.match(open, /<BreathingTimer\b/);
});
