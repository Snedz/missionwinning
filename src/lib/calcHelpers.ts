/** TDEE / 1RM calculator helpers — unit-aware. */

import type { UnitsPref } from '@/hooks/useUnits';

export function epley1rm(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30));
}

/** Mifflin-St Jeor BMR (male approximation). */
export function mifflinBmr(
  bodyweight: number,
  height: number,
  age: number,
  units: UnitsPref
): number {
  if (units === 'metric') {
    return Math.round(10 * bodyweight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * bodyweight * 0.453592 + 6.25 * height * 2.54 - 5 * age + 5);
}

export function proteinTargetGrams(bodyweight: number, units: UnitsPref): number {
  if (units === 'metric') return Math.round(bodyweight * 1.6);
  return Math.round(bodyweight * 1.0);
}

export function defaultCalcInputs(units: UnitsPref) {
  if (units === 'metric') {
    return { weight: 100, bw: 82, height: 178 };
  }
  return { weight: 225, bw: 180, height: 70 };
}
