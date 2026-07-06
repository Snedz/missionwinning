import { currentWeekStart } from '@/lib/coach/splitPlanner';
import { fuelDayLabels, trainingLoadForDay } from '@/lib/fuelCoach/contextBuilder';
import { adaptDailyTargets } from '@/lib/fuelCoach/adapt';
import { hashString, mulberry32 } from '@/lib/fuelCoach/rng';
import { pickMealsForDay, sumMealTotals } from '@/lib/fuelCoach/mealSelector';
import type { FuelContext, FuelPlan, FuelRecipe } from '@/lib/fuelCoach/types';

export function computeFuelContextHash(ctx: FuelContext): string {
  const payload = JSON.stringify({
    goal: ctx.goal,
    targets: ctx.baseTargets,
    seed: ctx.seedId,
  });
  return String(hashString(payload));
}

export function generateFuelPlan(
  ctx: FuelContext,
  recipes: FuelRecipe[],
  weekStart: string = currentWeekStart(),
  revision = 1
): FuelPlan {
  const labels = fuelDayLabels();
  const rand = mulberry32(hashString(`${ctx.seedId}-${weekStart}-fuel-${revision}`));
  const days = labels.map((meta, dayOffset) => {
    const load = trainingLoadForDay(ctx.history, weekStart, dayOffset);
    const { targets, note } = adaptDailyTargets(ctx.baseTargets, load);
    const meals = pickMealsForDay(targets, recipes, rand);
    return {
      dayKey: meta.dayKey,
      label: meta.label,
      dayOffset,
      meals,
      targets,
      totals: sumMealTotals(meals),
      trainingLoad: load,
      adaptedNote: note,
    };
  });

  return {
    revision,
    weekStart,
    goal: ctx.goal,
    baseTargets: { ...ctx.baseTargets },
    days,
    generatedAt: new Date().toISOString(),
    contextHash: computeFuelContextHash(ctx),
    seedId: ctx.seedId,
  };
}

export function regenerateFuelPlan(plan: FuelPlan, ctx: FuelContext, recipes: FuelRecipe[]): FuelPlan {
  return generateFuelPlan(ctx, recipes, plan.weekStart, plan.revision + 1);
}
