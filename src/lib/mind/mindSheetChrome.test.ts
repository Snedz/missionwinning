/**
 * Mind first paint is the check-in. Sessions stay off the page.
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

test('the mind house stays off /mind', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  assert.doesNotMatch(jsx, /<GuidedMindSessionRunner\b/);
  assert.doesNotMatch(jsx, /<MindLockedPreview\b/);
  assert.doesNotMatch(jsx, /MIND_COLLECTIONS/);
  assert.doesNotMatch(jsx, /mindRecentWins/);
  assert.doesNotMatch(jsx, /<details\b/);
  assert.doesNotMatch(jsx, /data-testid="mind-show-all"/);
});

test('first paint is the check-in, not breathe', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  assert.match(jsx, /<DailyCheckIn\b/);
  assert.doesNotMatch(jsx, /<BreathingTimer\b/);
});
