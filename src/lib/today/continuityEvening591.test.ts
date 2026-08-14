import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_FLOORS, getContentInventory } from '@/lib/contentInventory';
import { PREMIUM_RECIPE_COUNT } from '@/data/recipes/catalogMeta';

const root = join(import.meta.dirname, '..', '..', '..');

test('D2 fuel premium floor tracks catalogMeta (110 floor raised by Super Bundle wave)', () => {
  assert.equal(CONTENT_FLOORS.recipesPremium, PREMIUM_RECIPE_COUNT);
  assert.equal(getContentInventory().recipes.premium, PREMIUM_RECIPE_COUNT);
  const src = readFileSync(join(root, 'src/data/recipes/premiumRecipes.ts'), 'utf8');
  const names = [...src.matchAll(/"name":\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(names.length, PREMIUM_RECIPE_COUNT);
  assert.ok(PREMIUM_RECIPE_COUNT >= 140);
  assert.ok(names.includes('Casein Berry Night Bowl'));
  assert.ok(names.includes('Post-Sleep-Week Protein Bowl'));
});

test('HomeToday passes localHour into continuity', () => {
  const src = readFileSync(
    join(root, 'src/page-components/HomeTodayDashboard.tsx'),
    'utf8'
  );
  assert.match(src, /localHour:\s*new Date\(\)\.getHours\(\)/);
});
