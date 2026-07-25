/**
 * Goal → daily macro targets for Fuel (Mifflin-St Jeor + activity).
 * lose/maintain/gain map to cut/maintain/bulk calorie adjustments.
 */

import {
  ACTIVITY_LEVELS,
  defaultCalcInputs,
  macroTargetsFromStats,
  mifflinBmr,
  type CalcSex,
  type MacroGoal,
} from '@/lib/calcHelpers';
import type { UnitsPref } from '@/lib/units';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export type FuelGoalChoice = 'lose' | 'maintain' | 'gain';

export const FUEL_GOAL_STORAGE_KEY = STORAGE_KEYS.fuelGoal;

export type FuelGoalInputs = {
  goal: FuelGoalChoice;
  bodyweight: number;
  height?: number;
  age?: number;
  sex?: CalcSex;
  activity?: number;
  units?: UnitsPref;
};

export type FuelGoalTargets = {
  cals: number;
  protein: number;
  carbs: number;
  fat: number;
  tdee: number;
  bmr: number;
  goal: MacroGoal;
};

export function goalChoiceToMacro(goal: FuelGoalChoice): MacroGoal {
  if (goal === 'lose') return 'cut';
  if (goal === 'gain') return 'bulk';
  return 'maintain';
}

export function macroToGoalChoice(goal: MacroGoal): FuelGoalChoice {
  if (goal === 'cut') return 'lose';
  if (goal === 'bulk') return 'gain';
  return 'maintain';
}

/** User-facing labels for goal chips. */
export function goalChoiceLabel(goal: FuelGoalChoice): string {
  if (goal === 'lose') return 'Lose';
  if (goal === 'gain') return 'Gain';
  return 'Maintain';
}

export function activityLevelsList() {
  return ACTIVITY_LEVELS.map((a) => ({ value: a.value, key: a.key }));
}

/**
 * Compute daily targets from body stats + goal.
 * Cut ≈ 85% TDEE, bulk ≈ 110% TDEE, maintain = TDEE.
 */
export function computeGoalTargets(params: FuelGoalInputs): FuelGoalTargets {
  const units = params.units ?? 'metric';
  const defaults = defaultCalcInputs(units);
  const bw =
    Number.isFinite(params.bodyweight) && params.bodyweight > 0
      ? params.bodyweight
      : defaults.bw;
  const height = params.height ?? defaults.height;
  const age = params.age ?? 28;
  const sex = params.sex ?? 'male';
  const activity = params.activity ?? 1.55;
  const macroGoal = goalChoiceToMacro(params.goal);

  const targets = macroTargetsFromStats({
    bw,
    height,
    age,
    sex,
    activity,
    goal: macroGoal,
    units,
  });

  const bmr = mifflinBmr(bw, height, age, units, sex);
  const tdee = Math.round(bmr * activity);

  return {
    ...targets,
    tdee,
    bmr,
    goal: macroGoal,
  };
}

export function loadFuelGoalChoice(): FuelGoalChoice | null {
  const raw = readRaw(FUEL_GOAL_STORAGE_KEY);
  if (raw === 'lose' || raw === 'maintain' || raw === 'gain') return raw;
  // Legacy vocabulary from the fuelCoach goal names.
  if (raw === 'cut') return 'lose';
  if (raw === 'bulk') return 'gain';
  return null;
}

export function saveFuelGoalChoice(goal: FuelGoalChoice): void {
  writeRaw(FUEL_GOAL_STORAGE_KEY, goal);
}

/** Suggested starting bodyweight from latest body metrics or unit defaults. */
export function defaultBodyweightForWizard(
  units: UnitsPref,
  latestWeightKg?: number | null
): number {
  if (latestWeightKg != null && Number.isFinite(latestWeightKg) && latestWeightKg > 0) {
    if (units === 'imperial') {
      return Math.round(latestWeightKg * 2.2046226218 * 10) / 10;
    }
    return Math.round(latestWeightKg * 10) / 10;
  }
  return defaultCalcInputs(units).bw;
}
