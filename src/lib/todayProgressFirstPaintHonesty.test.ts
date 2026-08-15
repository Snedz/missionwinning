/**
 * AE1 — Today progress first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const src = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/today/TodayProgressSection.tsx'),
  'utf8',
);

test('Today progress CTAs first-paint the pack arrows', () => {
  assert.match(src, /Build a custom session →/);
  assert.match(src, /Go to Builder \/ Choose Template →/);
  assert.match(src, /Take free Readiness Assessment →/);
  assert.match(src, /See full in Nutrition →/);
  assert.match(src, /View Leaderboard →/);
  assert.match(src, /View full history →/);
});

test('Today wins chrome first-paints the pack', () => {
  assert.match(src, /Your Wins & Streaks/);
  assert.match(src, /Proof you are taking massive action/);
  assert.match(src, /Full cross-pillar challenges in updates/);
});
