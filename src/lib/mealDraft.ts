/**
 * Pure draft helpers for Fuel photo / DB meal logging.
 * UI (PhotoMealLogger) maps estimate source → chip labels; decisions live here.
 */

import type { FoodSearchItem } from '@/lib/foodSearch';
import type { MealEstimate } from '@/lib/estimateMealFromPhoto';

export type MealDraftFields = {
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
};

/** UI chip lane for an editable draft (not the estimate's raw `source`). */
export type MealDraftSource = 'vision' | 'heuristic' | 'database';

export function foodToDraft(item: FoodSearchItem): MealDraftFields {
  return {
    name: item.brand ? `${item.name} (${item.brand})` : item.name,
    protein: item.protein,
    cals: item.calories,
    carbs: item.carbs,
    fat: item.fat,
  };
}

export function estimateToDraft(
  e: Pick<MealEstimate, 'name' | 'protein' | 'cals' | 'carbs' | 'fat'>
): MealDraftFields {
  return {
    name: e.name,
    protein: e.protein,
    cals: e.cals,
    carbs: e.carbs,
    fat: e.fat,
  };
}

/**
 * Map MealEstimate.source → draft chip lane.
 * Open Food Facts / DB picks log as `api` and must surface as **database**,
 * never reset to heuristic via a useEffect (Kaizen K2 / Loop 2 L3).
 */
export function draftSourceFromEstimate(
  source: MealEstimate['source']
): MealDraftSource {
  if (source === 'vision') return 'vision';
  if (source === 'api') return 'database';
  return 'heuristic';
}
