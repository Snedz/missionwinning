import { supabase, getUser } from '@/lib/supabase';
import { loadPlan, COACH_TASTER_KEY } from '@/lib/coach/storage';
import type { CoachPlan } from '@/lib/coach/types';
import { enqueue, registerHandler } from '@/lib/sync/outbox';

export async function pushCoachToCloud(): Promise<boolean> {
  const user = await getUser();
  // Signed out or no cloud configured is not a failure — the plan lives locally and
  // is re-queued on sign-in. Returning false here would spin the outbox backoff.
  if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL) return true;

  const plan = loadPlan();
  const tasterUsed = localStorage.getItem(COACH_TASTER_KEY) === '1';

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      coach_plan: plan,
      coach_taster_used: tasterUsed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('pushCoachToCloud error', error);
    return false;
  }
  return true;
}

/**
 * Queue the coach plan for the cloud. Latest-state: one dedupe key for the whole
 * kind, so ten edits in a minute collapse to one push. `delayMs` is accepted for
 * call-site compatibility and ignored — the outbox owns timing now.
 */
export function scheduleCoachPush(_delayMs = 1500): void {
  if (typeof window === 'undefined') return;
  // Empty payload: the handler re-reads storage at flush time, so a queued op can
  // never carry a stale plan.
  enqueue('coach.plan', 'plan', null);
}

let registered = false;

/** Idempotent. Called from useOutboxDrain. */
export function registerCoachSyncHandler(): void {
  if (registered) return;
  registered = true;
  registerHandler('coach.plan', () => pushCoachToCloud());
}

export function mergeCoachPlans(a: CoachPlan | null, b: CoachPlan | null): CoachPlan | null {
  if (!a) return b;
  if (!b) return a;
  return a.revision >= b.revision ? a : b;
}
