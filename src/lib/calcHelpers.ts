/** TDEE / 1RM calculator helpers — unit-aware. */

import type { UnitsPref } from '@/hooks/useUnits';

export type CalcSex = 'male' | 'female';

export const ACTIVITY_LEVELS = [
  { value: 1.2, key: 'sedentary' },
  { value: 1.375, key: 'light' },
  { value: 1.55, key: 'moderate' },
  { value: 1.725, key: 'active' },
] as const;

export function epley1rm(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30));
}

/** Brzycki formula — secondary 1RM estimate. */
export function brzycki1rm(weight: number, reps: number): number {
  if (reps <= 0 || reps >= 37) return epley1rm(weight, reps);
  return Math.round(weight * (36 / (37 - reps)));
}

/** Mifflin-St Jeor BMR with sex offset (+5 male / -161 female). */
export function mifflinBmr(
  bodyweight: number,
  height: number,
  age: number,
  units: UnitsPref,
  sex: CalcSex = 'male'
): number {
  const sexOffset = sex === 'male' ? 5 : -161;
  if (units === 'metric') {
    return Math.round(10 * bodyweight + 6.25 * height - 5 * age + sexOffset);
  }
  return Math.round(10 * bodyweight * 0.453592 + 6.25 * height * 2.54 - 5 * age + sexOffset);
}

export function proteinTargetGrams(bodyweight: number, units: UnitsPref): number {
  if (units === 'metric') return Math.round(bodyweight * 1.6);
  return Math.round(bodyweight * 1.0);
}

/**
 * Seed inputs for calculators / demos.
 * When sex is female, use female-typical bodyweight and example lift loads so
 * empty states are not male-as-default. Pure helpers still accept any sex.
 */
export function defaultCalcInputs(
  units: UnitsPref,
  sex: CalcSex | null | undefined = undefined
) {
  if (sex === 'female') {
    if (units === 'metric') {
      return { weight: 60, bw: 65, height: 165 };
    }
    return { weight: 135, bw: 145, height: 65 };
  }
  if (units === 'metric') {
    return { weight: 100, bw: 82, height: 178 };
  }
  return { weight: 225, bw: 180, height: 70 };
}

/** Public strength-standards demo set (bodyweight + lift) by sex. */
export function defaultStrengthDemo(sex: CalcSex | null | undefined): {
  bodyweightKg: number;
  weightKg: number;
  reps: number;
} {
  if (sex === 'female') {
    return { bodyweightKg: 65, weightKg: 60, reps: 5 };
  }
  return { bodyweightKg: 78, weightKg: 100, reps: 5 };
}

export type MacroGoal = 'cut' | 'maintain' | 'bulk';

/** TDEE-based macro targets — shared by MacroCalculator and Fuel Coach. */
export function macroTargetsFromStats(params: {
  bw: number;
  height?: number;
  age?: number;
  sex?: CalcSex;
  activity?: number;
  goal?: MacroGoal;
  units?: UnitsPref;
}): { cals: number; protein: number; carbs: number; fat: number } {
  const units = params.units ?? 'metric';
  const height = params.height ?? defaultCalcInputs(units).height;
  const age = params.age ?? 28;
  const activity = params.activity ?? 1.55;
  const goal = params.goal ?? 'maintain';
  const bmr = mifflinBmr(params.bw, height, age, units, params.sex ?? 'male');
  const tdee = Math.round(bmr * activity);
  const cals =
    goal === 'cut' ? Math.round(tdee * 0.85) : goal === 'bulk' ? Math.round(tdee * 1.1) : tdee;
  const protein = proteinTargetGrams(params.bw, units);
  const fat = Math.round((cals * 0.25) / 9);
  const carbs = Math.max(0, Math.round((cals - protein * 4 - fat * 9) / 4));
  return { cals, protein, carbs, fat };
}
