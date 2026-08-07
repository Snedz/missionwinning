import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FREE_RECIPES } from '@/data/recipes/freeRecipes';
import { FREE_RECIPE_COUNT } from '@/data/recipes/catalogMeta';
import { CONTENT_FLOORS, getContentInventory } from '@/lib/contentInventory';

test('D2 free recipe floor is 48 and counts stay in sync', () => {
  assert.equal(CONTENT_FLOORS.recipesFree, 48);
  assert.equal(FREE_RECIPE_COUNT, 48);
  assert.equal(FREE_RECIPES.length, 48);
  assert.equal(getContentInventory().recipes.free, 48);
});

test('new free recipes have macros and unique names', () => {
  const names = FREE_RECIPES.map((r) => r.name);
  assert.equal(new Set(names).size, names.length);
  const d2 = [
    'Tuna Rice Packet Bowl',
    'Lentil Egg Skillet',
    'Greek Chicken Wrap Cold',
    'Shrimp Garlic Pasta Light',
    'Black Bean Sweet Potato Hash',
    'Whey Rice Cake Stack',
    'Turkey Apple Cheese Plate',
    'Tofu Scramble Toast',
  ];
  for (const name of d2) {
    const r = FREE_RECIPES.find((x) => x.name === name);
    assert.ok(r, name);
    assert.ok(r!.protein >= 20, name);
    assert.ok(r!.cals > 0 && r!.ingredients.length > 10, name);
  }
});
