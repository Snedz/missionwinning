import { getUser } from '@/lib/supabase';
import { loadFuelPlan, saveFuelPlan, mergeFuelPlans } from '@/lib/fuelCoach/storage';
import type { FuelPlan } from '@/lib/fuelCoach/types';
import { STORAGE_KEY_PREFIXES } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

let pushTimer: ReturnType<typeof setTimeout> | null = null;

function syncKey(userId: string): string {
  return `${STORAGE_KEY_PREFIXES.fuelPlanSync}${userId}`;
}

/**
 * NOTE: despite the name this does not reach a cloud — it writes a per-user key in
 * device storage. There is no network call, so there is nothing for the sync outbox
 * to retry and `fuel.plan` was deliberately removed from `OutboxKind`. Put it on the
 * outbox when a real endpoint exists.
 */
export async function pushFuelPlanToCloud(): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;

  const plan = loadFuelPlan();
  if (!plan) return false;

  // The return value is the write's durability: a memory-only write survives the tab
  // and no longer, which for a "sync" record is a failure worth reporting as one.
  return writeJson(syncKey(user.id), { plan, updatedAt: new Date().toISOString() });
}

export function pullFuelPlanFromCloud(userId: string): FuelPlan | null {
  const data = readJson<{ plan?: FuelPlan } | null>(syncKey(userId), null);
  return data?.plan ?? null;
}

export function scheduleFuelPlanPush(delayMs = 1500): void {
  if (typeof window === 'undefined') return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushFuelPlanToCloud();
  }, delayMs);
}

export function mergeAndSaveFuelPlan(local: FuelPlan | null, remote: FuelPlan | null): FuelPlan | null {
  const merged = mergeFuelPlans(local, remote);
  if (merged) saveFuelPlan(merged);
  return merged;
}

export { mergeFuelPlans };
