import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('ExercisePicker selected row is muted with primary edge', () => {
  const src = readFileSync(
    join(root, 'src/components/library/ExercisePicker.tsx'),
    'utf8'
  );
  assert.match(src, /bg-muted text-primary border-s-\[3px\]/);
  assert.doesNotMatch(src, /bg-accent-100 text-primary/);
  assert.match(src, /tap-target/);
});

test('Fuel goal/adapt and track metric chips drop accent wash', () => {
  for (const rel of [
    'src/components/nutrition/FuelGoalWizard.tsx',
    'src/components/nutrition/FuelAdaptBanner.tsx',
    'src/components/track/BodyMetricsCard.tsx',
    'src/components/track/ProgressPhotosCard.tsx',
    'src/components/nutrition/MealEstimateDraft.tsx',
    'src/components/nutrition/FuelLogSheet.tsx',
  ]) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.doesNotMatch(src, /bg-accent-100/, rel);
  }
});
