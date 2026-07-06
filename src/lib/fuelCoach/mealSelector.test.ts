import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pickMealsForDay, recipesFromCatalog, sumMealTotals } from '@/lib/fuelCoach/mealSelector';
import { mulberry32 } from '@/lib/fuelCoach/rng';

const RECIPES = recipesFromCatalog([
  { name: 'Oats Bowl', protein: 20, cals: 450, carbs: 70, fat: 8 },
  { name: 'Chicken Rice', protein: 52, cals: 620, carbs: 58, fat: 12 },
  { name: 'Salmon Plate', protein: 35, cals: 480, carbs: 22, fat: 28 },
  { name: 'Yogurt Parfait', protein: 38, cals: 340, carbs: 32, fat: 8 },
  { name: 'Beef Scramble', protein: 48, cals: 580, carbs: 12, fat: 32 },
]);

describe('fuelCoach mealSelector', () => {
  it('picks four meals per day', () => {
    const meals = pickMealsForDay(
      { cals: 2200, protein: 160, carbs: 200, fat: 70 },
      RECIPES,
      mulberry32(99)
    );
    assert.equal(meals.length, 4);
    assert.ok(meals.every((m) => m.recipeName));
  });

  it('is deterministic for same seed', () => {
    const targets = { cals: 2200, protein: 160, carbs: 200, fat: 70 };
    const a = pickMealsForDay(targets, RECIPES, mulberry32(42));
    const b = pickMealsForDay(targets, RECIPES, mulberry32(42));
    assert.deepEqual(a.map((m) => m.recipeId), b.map((m) => m.recipeId));
  });

  it('sums meal macros', () => {
    const meals = pickMealsForDay(
      { cals: 2200, protein: 160, carbs: 200, fat: 70 },
      RECIPES,
      mulberry32(1)
    );
    const totals = sumMealTotals(meals);
    assert.ok(totals.cals > 0);
    assert.ok(totals.protein > 0);
  });
});
