import type { DayMacroTotals, FuelRecipe, MealSlot, PlannedMeal } from '@/lib/fuelCoach/types';

const SLOT_SHARE: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.35,
  snack: 0.1,
};

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function slotTargets(dayTargets: DayMacroTotals, slot: MealSlot): DayMacroTotals {
  const share = SLOT_SHARE[slot];
  return {
    cals: Math.round(dayTargets.cals * share),
    protein: Math.round(dayTargets.protein * share),
    carbs: Math.round(dayTargets.carbs * share),
    fat: Math.round(dayTargets.fat * share),
  };
}

function recipeCost(recipe: FuelRecipe, target: DayMacroTotals): number {
  return (
    Math.abs(recipe.cals - target.cals) +
    Math.abs(recipe.protein - target.protein) * 3 +
    Math.abs(recipe.carbs - target.carbs) * 0.5 +
    Math.abs(recipe.fat - target.fat) * 0.5
  );
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function pickMealsForDay(
  dayTargets: DayMacroTotals,
  recipes: FuelRecipe[],
  rand: () => number
): PlannedMeal[] {
  if (!recipes.length) return [];
  const pool = shuffle(recipes, rand);
  const meals: PlannedMeal[] = [];

  for (const slot of SLOTS) {
    const target = slotTargets(dayTargets, slot);
    let best = pool[0]!;
    let bestCost = recipeCost(best, target);
    for (const recipe of pool) {
      const cost = recipeCost(recipe, target);
      if (cost < bestCost) {
        best = recipe;
        bestCost = cost;
      }
    }
    meals.push({
      slot,
      recipeId: best.id,
      recipeName: best.name,
      protein: best.protein,
      cals: best.cals,
      carbs: best.carbs,
      fat: best.fat,
    });
  }

  return meals;
}

export function sumMealTotals(meals: PlannedMeal[]): DayMacroTotals {
  return meals.reduce(
    (acc, m) => ({
      cals: acc.cals + m.cals,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { cals: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function recipesFromCatalog(
  items: { name: string; protein: number; cals: number; carbs: number; fat: number }[]
): FuelRecipe[] {
  return items.map((r, i) => ({
    id: `recipe-${i}-${r.name.slice(0, 24).replace(/\s+/g, '-').toLowerCase()}`,
    name: r.name,
    protein: r.protein,
    cals: r.cals,
    carbs: r.carbs,
    fat: r.fat,
  }));
}
