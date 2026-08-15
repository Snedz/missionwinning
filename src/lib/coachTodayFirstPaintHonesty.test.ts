/**
 * AA1 — Today Coach card first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const card = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/coach/CoachTodayCard.tsx'),
  'utf8',
);

test('Today Coach mission first-paints the pack', () => {
  assert.match(card, /Mission Coach · adapts from logs/);
  assert.doesNotMatch(card, /Built from your logs — no wearable required/);
});

test('Today Coach locked chrome first-paints the pack', () => {
  assert.match(card, /load runs high \(≥70\)/);
  assert.match(card, /View last week & unlock/);
  assert.doesNotMatch(card, /defaultValue: 'View last week'/);
});
