import type { CoachPlan } from '@/lib/coach/types';

export const COACH_PLAN_KEY = 'mw_coach_plan';
export const COACH_TASTER_KEY = 'mw_coach_taster_used';
export const DEVICE_ID_KEY = 'mw_device_id';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getOrCreateDeviceId(): string {
  if (!isBrowser()) return 'server';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function loadPlan(): CoachPlan | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(COACH_PLAN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CoachPlan;
  } catch {
    return null;
  }
}

export function savePlan(plan: CoachPlan): void {
  if (!isBrowser()) return;
  localStorage.setItem(COACH_PLAN_KEY, JSON.stringify(plan));
  window.dispatchEvent(new CustomEvent('mw-coach-plan-changed'));
}

export function clearPlan(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(COACH_PLAN_KEY);
  window.dispatchEvent(new CustomEvent('mw-coach-plan-changed'));
}

export function isTasterUsed(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(COACH_TASTER_KEY) === '1';
}

export function markTasterUsed(): void {
  if (!isBrowser()) return;
  localStorage.setItem(COACH_TASTER_KEY, '1');
}

export function mergePlans(a: CoachPlan | null, b: CoachPlan | null): CoachPlan | null {
  if (!a) return b;
  if (!b) return a;
  return a.revision >= b.revision ? a : b;
}
