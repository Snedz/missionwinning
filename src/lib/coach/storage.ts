import type { CoachPlan } from '@/lib/coach/types';
import type { CoachWeekChange } from '@/lib/coach/weekChange';
import { applyPlannedMissSkip, applyPlannedMissSlide } from '@/lib/coach/plannedMiss';
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

type StoredWeekChange = { generatedAt: string; contextHash: string; revision: number; change: CoachWeekChange };

export function loadCoachWeekChange(plan: CoachPlan): CoachWeekChange | null {
  const receipt = readJson<StoredWeekChange | null>(STORAGE_KEYS.coachWeekChange, null);
  if (!receipt?.change || receipt.generatedAt !== plan.generatedAt || receipt.contextHash !== plan.contextHash ||
      receipt.change.weekStart !== plan.weekStart || receipt.revision !== plan.revision) return null;
  return receipt.change;
}

export function savePlan(plan: CoachPlan, change?: CoachWeekChange | null): void {
  const previous = loadPlan();
  const unchanged = change === undefined && JSON.stringify(previous) === JSON.stringify(plan);
  if (change?.source === 'adapt' && !change.loads.length && change.schedule.every((row) => row.kind === 'completed') &&
      previous && previous.contextHash === plan.contextHash && previous.generatedAt === plan.generatedAt) {
    const rebuild = loadCoachWeekChange(previous);
    if (rebuild?.source === 'rebuild') change = rebuild;
  }
  if (writeJson(COACH_PLAN_KEY, plan)) {
    if (change) {
      if (!writeJson(STORAGE_KEYS.coachWeekChange, { generatedAt: plan.generatedAt, contextHash: plan.contextHash, revision: plan.revision, change })) {
        remove(STORAGE_KEYS.coachWeekChange);
      }
    } else if (!unchanged) {
      remove(STORAGE_KEYS.coachWeekChange);
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mw-coach-plan-changed'));
  }
}

export function clearPlan(): void {
  remove(COACH_PLAN_KEY);
  remove(STORAGE_KEYS.coachWeekChange);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mw-coach-plan-changed'));
  }
}

export function savePlannedMissEdit(weekStart: string, sessionId: string, action: 'skip' | { slideFrom: number }): void {
  const plan = loadPlan();
  if (!plan || plan.weekStart !== weekStart) return;
  const original = plan.sessions.find((s) => s.id === sessionId && s.status !== 'done');
  if (!original) return;
  const next = action === 'skip'
    ? applyPlannedMissSkip(plan, sessionId)
    : applyPlannedMissSlide(plan, sessionId, action.slideFrom);
  if (next === plan) return;
  const { name, kind, focusGroups, dayOffset } = original;
  const before = { name, kind, focusGroups, dayOffset };
  const moved = next.sessions.find((s) => s.id === sessionId);
  savePlan(next, {
    source: 'adapt', weekStart, beforeRevision: plan.revision, afterRevision: next.revision,
    units: readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric',
    schedule: moved
      ? [{ kind: 'moved', before, after: { ...before, dayOffset: moved.dayOffset } }]
      : [{ kind: 'dropped', before, missed: false }],
    loads: [],
  });
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
