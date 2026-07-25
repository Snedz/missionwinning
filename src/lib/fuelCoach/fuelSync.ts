import { getUser } from '@/lib/supabase';
import { loadFuelPlan, saveFuelPlan, mergeFuelPlans } from '@/lib/fuelCoach/storage';
import type { FuelPlan } from '@/lib/fuelCoach/types';

let pushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * NOTE: despite the name this does not reach a cloud — it writes a per-user key in
 * device storage. There is no network call, so there is nothing for the sync outbox
 * to retry and `fuel.plan` was deliberately removed from `OutboxKind`. Put it on the
 * outbox when a real endpoint exists.
 */
export async function pushFuelPlanToCloud(): Promise<boolean> {
  const user = await getUser();
  if (!user || typeof localStorage === 'undefined') return false;

  const plan = loadFuelPlan();
  if (!plan) return false;

  try {
    localStorage.setItem(
      `mw_fuel_plan_sync_${user.id}`,
      JSON.stringify({ plan, updatedAt: new Date().toISOString() })
    );
    return true;
  } catch {
    return false;
  }
}

export function pullFuelPlanFromCloud(userId: string): FuelPlan | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`mw_fuel_plan_sync_${userId}`);
    if (!raw) return null;
    const data = JSON.parse(raw) as { plan?: FuelPlan };
    return data.plan ?? null;
  } catch {
    return null;
  }
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
