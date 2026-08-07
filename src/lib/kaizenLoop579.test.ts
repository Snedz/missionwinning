import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Today progress starter buttons are 44px', () => {
  const src = readFileSync(
    join(root, 'src/components/today/TodayProgressSection.tsx'),
    'utf8'
  );
  assert.match(src, /onStartStarter[\s\S]{0,80}min-h-\[44px\]|min-h-\[44px\][\s\S]{0,80}onStartStarter/);
});

test('Fuel surface CTAs are 44px (quick log, weight, meal plan, photo, adapt)', () => {
  for (const rel of [
    'src/components/nutrition/FuelQuickLogPanel.tsx',
    'src/components/nutrition/FuelWeightStrip.tsx',
    'src/components/nutrition/FuelMealPlanCard.tsx',
    'src/components/nutrition/PhotoMealLogger.tsx',
    'src/components/nutrition/FuelAdaptBanner.tsx',
    'src/components/nutrition/FuelTodayLogCard.tsx',
  ]) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.match(src, /min-h-\[44px\]/, rel);
  }
  const adapt = readFileSync(
    join(root, 'src/components/nutrition/FuelAdaptBanner.tsx'),
    'utf8'
  );
  assert.doesNotMatch(adapt, /className="h-7/);
  assert.doesNotMatch(adapt, /className=.*className=/);
});

test('DayReviewOptIn has single className per button', () => {
  const src = readFileSync(
    join(root, 'src/components/today/DayReviewOptIn.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /className="[^"]*"\s+className="/);
  assert.match(src, /min-h-\[44px\] tap-target/);
});
