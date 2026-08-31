import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('FuelRecipesPanel uses EmptyState + ErrorState for empty/error paths', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'nutrition', 'FuelRecipesPanel.tsx'),
    'utf8'
  );
  assert.match(src, /EmptyState/);
  assert.match(src, /ErrorState/);
  assert.match(src, /freeRecipes\.length === 0/);
  assert.match(src, /onRetryPremium/);
});

test('NutritionPage does not leftover premium recipe retry', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'page-components', 'NutritionPage.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /onRetryPremium/);
  assert.doesNotMatch(src, /premiumRetry/);
  assert.match(src, /FuelLogSheet/);
});
