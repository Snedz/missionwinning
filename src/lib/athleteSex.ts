/**
 * Shared biological sex preference for scoring tools.
 *
 * Used by Fuel BMR/macros, strength standards, and fitness-test bands.
 * Unset is intentional — never silently default to male for user-facing scores.
 * Pure helpers may still require an explicit sex argument.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export type BiologicalSex = 'male' | 'female';

export const ATHLETE_SEX_KEY = STORAGE_KEYS.athleteSex;

export function isBiologicalSex(value: unknown): value is BiologicalSex {
  return value === 'male' || value === 'female';
}

/** Returns saved sex, or null when the athlete has not chosen yet. */
export function getAthleteSex(): BiologicalSex | null {
  const raw = readRaw(ATHLETE_SEX_KEY);
  return isBiologicalSex(raw) ? raw : null;
}

/** Persist sex for calculators / PFT / Profile. Returns false if storage failed. */
export function setAthleteSex(sex: BiologicalSex): boolean {
  if (!isBiologicalSex(sex)) return false;
  return writeRaw(ATHLETE_SEX_KEY, sex);
}
