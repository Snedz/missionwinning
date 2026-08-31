/**
 * X1 — Mind first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/page-components/MindPage.tsx'),
  'utf8',
);

test('Mind title first-paints Mind & Recovery', () => {
  assert.match(page, /mindTitle[\s\S]{0,40}defaultValue: 'Mind & Recovery'/);
  assert.doesNotMatch(page, /mindTitle[\s\S]{0,40}defaultValue: 'Mind'/);
});

test('Mind first paint is the check-in, not a sessions tour', () => {
  assert.match(page, /<DailyCheckIn\b/);
  assert.doesNotMatch(page, /defaultValue: 'Recent Mind Wins'/);
  assert.doesNotMatch(page, /No mind sessions logged yet/);
  assert.doesNotMatch(page, /breathing timer — your first win shows here/);
});
