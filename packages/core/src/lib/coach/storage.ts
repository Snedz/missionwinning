import type { CoachPlan } from '@/lib/coach/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, readRaw, remove, writeJson, writeRaw } from '@/lib/storage/safeStorage';

export const COACH_PLAN_KEY = STORAGE_KEYS.coachPlan;
export const COACH_TASTER_KEY = STORAGE_KEYS.coachTasterUsed;
export const DEVICE_ID_KEY = STORAGE_KEYS.deviceId;

export function getOrCreateDeviceId(): string {
  // The sentinel matters: minting a real id during SSR would hand every request a
  // fresh "device", so the server must never look like one.
  if (typeof window === 'undefined') return 'server';
  const existing = readRaw(DEVICE_ID_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  writeRaw(DEVICE_ID_KEY, id);
  return id;
}

export function loadPlan(): CoachPlan | null {
  return readJson<CoachPlan | null>(COACH_PLAN_KEY, null);
}

export function savePlan(plan: CoachPlan): void {
  writeJson(COACH_PLAN_KEY, plan);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mw-coach-plan-changed'));
  }
}

export function clearPlan(): void {
  remove(COACH_PLAN_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mw-coach-plan-changed'));
  }
}

export function isTasterUsed(): boolean {
  return readRaw(COACH_TASTER_KEY) === '1';
}

export function markTasterUsed(): void {
  writeRaw(COACH_TASTER_KEY, '1');
}

export function mergePlans(a: CoachPlan | null, b: CoachPlan | null): CoachPlan | null {
  if (!a) return b;
  if (!b) return a;
  return a.revision >= b.revision ? a : b;
}
