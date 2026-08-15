/**
 * AC1 — FuelTodayLogCard first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const card = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/nutrition/FuelTodayLogCard.tsx'),
  'utf8',
);

test('Fuel log card first-paints Load from Cloud', () => {
  assert.match(card, /defaultValue: 'Load from Cloud'/);
  assert.doesNotMatch(card, /defaultValue: 'Load from cloud'/);
});

test('Fuel log card empty first-paints the pack', () => {
  assert.match(card, /always review macros before logging/);
  assert.doesNotMatch(card, /open Log food for a full entry/);
});
