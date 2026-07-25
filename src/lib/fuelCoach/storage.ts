import type { FuelPlan } from '@/lib/fuelCoach/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, remove, writeJson } from '@/lib/storage/safeStorage';

export const FUEL_PLAN_KEY = STORAGE_KEYS.fuelPlan;

export { getOrCreateDeviceId } from '@/lib/coach/storage';

export function loadFuelPlan(): FuelPlan | null {
  return readJson<FuelPlan | null>(FUEL_PLAN_KEY, null);
}

export function saveFuelPlan(plan: FuelPlan): void {
  writeJson(FUEL_PLAN_KEY, plan);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mw-fuel-plan-changed'));
  }
}

export function clearFuelPlan(): void {
  remove(FUEL_PLAN_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mw-fuel-plan-changed'));
  }
}

export function mergeFuelPlans(a: FuelPlan | null, b: FuelPlan | null): FuelPlan | null {
  if (!a) return b;
  if (!b) return a;
  return a.revision >= b.revision ? a : b;
}
