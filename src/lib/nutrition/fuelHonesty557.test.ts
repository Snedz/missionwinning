import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('Fuel empty state links to fuel-log with plain copy', () => {
  const card = readFileSync(
    join(root, 'src/components/nutrition/FuelTodayLogCard.tsx'),
    'utf8'
  );
  assert.match(card, /fuel-log/);
  assert.match(card, /fuelEmptyCta|Log food/);
  assert.doesNotMatch(card, /always review macros before logging/);
  assert.match(card, /h-11 w-11 tap-target/);

  const page = readFileSync(join(root, 'src/page-components/NutritionPage.tsx'), 'utf8');
  assert.match(page, /fuel-log/);
});

test('Food search results use muted hover not accent wash', () => {
  const src = readFileSync(
    join(root, 'src/components/nutrition/FoodSearchBar.tsx'),
    'utf8'
  );
  assert.match(src, /hover:bg-muted/);
  assert.doesNotMatch(src, /hover:bg-accent-100/);
  assert.match(src, /role=.status/);
});

test('Fuel recipe Use button is 44px tap target', () => {
  const src = readFileSync(
    join(root, 'src/components/nutrition/FuelRecipesPanel.tsx'),
    'utf8'
  );
  assert.match(src, /min-h-\[44px\]/);
  assert.match(src, /tap-target/);
});
