import type { FuelPlan } from '@/lib/fuelCoach/types';

export const FUEL_PLAN_KEY = 'mw_fuel_plan';

export { getOrCreateDeviceId } from '@/lib/coach/storage';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function loadFuelPlan(): FuelPlan | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(FUEL_PLAN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FuelPlan;
  } catch {
    return null;
  }
}

export function saveFuelPlan(plan: FuelPlan): void {
  if (!isBrowser()) return;
  localStorage.setItem(FUEL_PLAN_KEY, JSON.stringify(plan));
  window.dispatchEvent(new CustomEvent('mw-fuel-plan-changed'));
}

export function clearFuelPlan(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(FUEL_PLAN_KEY);
  window.dispatchEvent(new CustomEvent('mw-fuel-plan-changed'));
}

export function mergeFuelPlans(a: FuelPlan | null, b: FuelPlan | null): FuelPlan | null {
  if (!a) return b;
  if (!b) return a;
  return a.revision >= b.revision ? a : b;
}
