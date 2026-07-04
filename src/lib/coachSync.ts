import { supabase, getUser } from '@/lib/supabase';
import { loadPlan, COACH_TASTER_KEY } from '@/lib/coach/storage';
import type { CoachPlan } from '@/lib/coach/types';

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export async function pushCoachToCloud(): Promise<boolean> {
  const user = await getUser();
  if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL) return false;

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

export function scheduleCoachPush(delayMs = 1500): void {
  if (typeof window === 'undefined') return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushCoachToCloud();
  }, delayMs);
}

export function mergeCoachPlans(a: CoachPlan | null, b: CoachPlan | null): CoachPlan | null {
  if (!a) return b;
  if (!b) return a;
  return a.revision >= b.revision ? a : b;
}
