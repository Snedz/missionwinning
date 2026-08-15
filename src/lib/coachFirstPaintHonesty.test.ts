/**
 * Z1 — Coach first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/page-components/CoachPage.tsx'),
  'utf8',
);

test('Coach subtitle first-paints the pack', () => {
  assert.match(page, /Weekly plans from your workout logs alone/);
  assert.doesNotMatch(page, /A week of training built from your logs/);
});

test('Coach empty title first-paints No plan this week', () => {
  assert.match(page, /defaultValue: 'No plan this week'/);
  assert.doesNotMatch(page, /Ready for a new week\?/);
});

test('Coach free-core note first-paints the pack', () => {
  assert.match(page, /premium funds the mission/);
  assert.doesNotMatch(page, /stay free forever/);
});
