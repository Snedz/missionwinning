import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('NutritionPage merges via mergeTodayIntoNutritionLog', () => {
  const src = readFileSync(join(root, 'src', 'page-components', 'NutritionPage.tsx'), 'utf8');
  assert.match(src, /mergeTodayIntoNutritionLog/);
  assert.doesNotMatch(src, /const older = prev\.filter/);
});

test('Fuel surfaces label days via formatLocalDateKey', () => {
  for (const rel of [
    'src/components/nutrition/FuelWeekGlance.tsx',
    'src/components/nutrition/FuelPastDaysCard.tsx',
    'src/components/nutrition/FuelWeightStrip.tsx',
  ]) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.match(src, /formatLocalDateKey/, rel);
    assert.doesNotMatch(src, /T12:00:00`\)\.toLocaleDateString/, rel);
  }
});
