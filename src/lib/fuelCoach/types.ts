import type { MacroTargets } from '@/lib/macroTargets';
import type { CompletedWorkoutLog } from '@/types';

export type FuelGoal = 'cut' | 'maintain' | 'bulk';
export type TrainingLoad = 'rest' | 'light' | 'moderate' | 'heavy';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FuelRecipe {
  id: string;
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
}

export interface PlannedMeal {
  slot: MealSlot;
  recipeId: string;
  recipeName: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
}

export interface DayMacroTotals {
  cals: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FuelPlanDay {
  dayKey: string;
  label: string;
  dayOffset: number;
  meals: PlannedMeal[];
  targets: DayMacroTotals;
  totals: DayMacroTotals;
  trainingLoad: TrainingLoad;
  adaptedNote?: string;
}

export interface FuelPlan {
  revision: number;
  weekStart: string;
  goal: FuelGoal;
  baseTargets: DayMacroTotals;
  days: FuelPlanDay[];
  generatedAt: string;
  contextHash: string;
  seedId: string;
}

export interface FuelContext {
  goal: FuelGoal;
  baseTargets: DayMacroTotals;
  history: CompletedWorkoutLog[];
  seedId: string;
  units: 'metric' | 'imperial';
  bodyweightKg: number;
}

export type { MacroTargets };
