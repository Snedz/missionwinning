import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateFuelPlan } from '@/lib/fuelCoach/planEngine';
import { buildFuelContext, trainingLoadForDay } from '@/lib/fuelCoach/contextBuilder';
import { recipesFromCatalog } from '@/lib/fuelCoach/mealSelector';
import type { CompletedWorkoutLog } from '@/types';

const RECIPES = recipesFromCatalog([
  { name: 'Oats Bowl', protein: 20, cals: 450, carbs: 70, fat: 8 },
  { name: 'Chicken Rice', protein: 52, cals: 620, carbs: 58, fat: 12 },
  { name: 'Salmon Plate', protein: 35, cals: 480, carbs: 22, fat: 28 },
  { name: 'Yogurt Parfait', protein: 38, cals: 340, carbs: 32, fat: 8 },
  { name: 'Beef Scramble', protein: 48, cals: 580, carbs: 12, fat: 32 },
  { name: 'Tuna Salad', protein: 35, cals: 380, carbs: 20, fat: 18 },
]);

describe('fuelCoach planEngine', () => {
  it('generates a 7-day plan with macro totals', () => {
    const ctx = buildFuelContext({ history: [], goal: 'maintain', seedId: 'test-fuel' });
    const plan = generateFuelPlan(ctx, RECIPES, '2026-07-06');
    assert.equal(plan.days.length, 7);
    assert.ok(plan.days[0]!.totals.protein > 0);
    assert.equal(plan.contextHash.length > 0, true);
  });

  it('adapts heavy-day targets when volume is high', () => {
    const heavy: CompletedWorkoutLog = {
      id: '1',
      workoutName: 'Legs',
      startedAt: '2026-07-06T10:00:00.000Z',
      completedAt: '2026-07-06T11:00:00.000Z',
      durationSeconds: 3600,
      totalVolume: 6000,
      exercises: [],
    };
    const load = trainingLoadForDay([heavy], '2026-07-06', 0);
    assert.equal(load, 'heavy');
    const ctx = buildFuelContext({ history: [heavy], seedId: 'heavy-day' });
    const plan = generateFuelPlan(ctx, RECIPES, '2026-07-06');
    assert.equal(plan.days[0]!.trainingLoad, 'heavy');
    assert.ok(plan.days[0]!.targets.carbs > plan.baseTargets.carbs);
  });

  it('is deterministic for same seed and week', () => {
    const ctx = buildFuelContext({ history: [], seedId: 'det-fuel' });
    const a = generateFuelPlan(ctx, RECIPES, '2026-07-06');
    const b = generateFuelPlan(ctx, RECIPES, '2026-07-06');
    assert.deepEqual(
      a.days.map((d) => d.meals.map((m) => m.recipeId)),
      b.days.map((d) => d.meals.map((m) => m.recipeId))
    );
  });
});
