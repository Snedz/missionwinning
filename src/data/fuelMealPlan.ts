/**
 * 7-day high-protein meal outline.
 * Free slice: day 1. Premium: full week.
 * Meals may reference recipe ids (slug from recipe name) for macro totals.
 */

export type MealPlanItem = {
  label: string;
  /** Optional link into free/premium recipe catalogs. */
  recipeId?: string;
};

export type MealPlanDay = {
  dayKey: string;
  label: string;
  /** @deprecated prefer mealsStructured — kept for string adapters */
  meals: string[];
  mealsStructured?: MealPlanItem[];
};

function day(
  dayKey: string,
  label: string,
  items: MealPlanItem[]
): MealPlanDay {
  return {
    dayKey,
    label,
    meals: items.map((m) => m.label),
    mealsStructured: items,
  };
}

/** Static 7-day high-protein outline — premium shows full week; free shows day 1. */
export const FUEL_MEAL_PLAN: MealPlanDay[] = [
  day('mon', 'Monday', [
    { label: 'Breakfast: Elite Chicken Rice Power Bowl side of eggs optional', recipeId: 'elite-chicken-rice-power-bowl' },
    { label: 'Lunch: Mediterranean Salmon Plate', recipeId: 'mediterranean-salmon-plate-dash-principles' },
    { label: 'Dinner: Beef & Egg Scramble for Growth', recipeId: 'beef-egg-scramble-for-growth' },
  ]),
  day('tue', 'Tuesday', [
    { label: 'Breakfast: Eggs, whole-grain toast, fruit' },
    { label: 'Lunch: Tuna salad wrap' },
    { label: 'Dinner: Lean beef stir-fry + rice' },
  ]),
  day('wed', 'Wednesday', [
    { label: 'Breakfast: Greek yogurt, berries, oats' },
    { label: 'Lunch: Chicken rice bowl + greens' },
    { label: 'Dinner: White fish, potatoes, salad' },
  ]),
  day('thu', 'Thursday', [
    { label: 'Breakfast: Protein oats + banana' },
    { label: 'Lunch: Turkey sandwich + fruit' },
    { label: 'Dinner: Bean chili + side salad' },
  ]),
  day('fri', 'Friday', [
    { label: 'Breakfast: Eggs + leftover rice' },
    { label: 'Lunch: Salmon rice bowl' },
    { label: 'Dinner: Chicken stir-fry + veg' },
  ]),
  day('sat', 'Saturday', [
    { label: 'Breakfast: High-protein pancakes or eggs' },
    { label: 'Lunch: Beef rice bowl' },
    { label: 'Dinner: Flexible — hit protein target' },
  ]),
  day('sun', 'Sunday', [
    { label: 'Breakfast: Yogurt parfait + whey optional' },
    { label: 'Lunch: Batch chicken + veg' },
    { label: 'Dinner: Light fish or eggs + salad' },
  ]),
];

export function mealPlanDayLabels(dayPlan: MealPlanDay): string[] {
  return dayPlan.mealsStructured?.map((m) => m.label) ?? dayPlan.meals;
}
