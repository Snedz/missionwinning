/**
 * AB1 — Fuel page title first-paints the merged EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/page-components/NutritionPage.tsx'),
  'utf8',
);

test('Fuel title first-paints Nutrition', () => {
  assert.match(page, /fuelTitle[\s\S]{0,40}defaultValue: 'Nutrition'/);
  assert.doesNotMatch(page, /fuelTitle[\s\S]{0,40}defaultValue: 'What you ate'/);
});
