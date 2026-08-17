import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('HomeTodayLean does not mount the continuity strip', () => {
  const src = readFileSync(
    join(root, 'src/page-components/HomeTodayLean.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /buildContinuitySuggestions/);
  assert.doesNotMatch(src, /ContinuityStrip/);
});

test('Fuel page subtitle uses content inventory depth counts', () => {
  const src = readFileSync(
    join(root, 'src/page-components/NutritionPage.tsx'),
    'utf8'
  );
  assert.match(src, /getContentInventory/);
  assert.match(src, /fuelSubtitleDepth/);
  assert.match(src, /inv\.recipes\.free/);
  assert.match(src, /inv\.recipes\.premium/);
});
