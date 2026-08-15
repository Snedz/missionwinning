/**
 * AJ1 — Coach insight card first-paints the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const card = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/metrics/CoachInsightCard.tsx'),
  'utf8',
);

test('Coach insight first-paints the pack title', () => {
  assert.match(card, /defaultValue: 'Coach insight'/);
  assert.doesNotMatch(card, /defaultValue: 'Coach note'/);
});

test('Coach insight first-paints the pack desc', () => {
  assert.match(card, /Based on your readiness, strain, and recovery/);
  assert.doesNotMatch(card, /From your recent training load and recovery/);
});
