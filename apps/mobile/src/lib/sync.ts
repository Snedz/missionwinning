import type { CoachPlan } from '@missionwinning/mw-core';
import { isSupabaseConfigured, supabase, WEB_APP_URL } from './supabase';
import {
  appendWorkoutLog,
  loadCoachPlan,
  loadWorkoutHistory,
  mergeAndSaveCoachPlan,
  type LocalWorkoutLog,
} from './storage';

/**
 * Pull coach_plan from journey/profile if present; merge with local by revision.
 * Soft-fail when not signed in or table missing.
 */
export async function syncCoachPlanFromCloud(userId: string): Promise<CoachPlan | null> {
  if (!isSupabaseConfigured) return loadCoachPlan();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('coach_plan')
      .eq('id', userId)
      .maybeSingle();
    if (error) return loadCoachPlan();
    const remote = (data?.coach_plan as CoachPlan | null) ?? null;
    return mergeAndSaveCoachPlan(remote);
  } catch {
    return loadCoachPlan();
  }
}

export async function pushCoachPlanToCloud(userId: string, plan: CoachPlan): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('profiles').upsert(
      {
        id: userId,
        coach_plan: plan,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch {
    // offline / schema drift — local remains source of truth
  }
}

export async function pushWorkoutLogToCloud(
  userId: string,
  log: LocalWorkoutLog
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const started = new Date(new Date(log.completedAt).getTime() - log.durationSeconds * 1000);
    await supabase.from('workout_logs').insert({
      user_id: userId,
      workout_name: log.workoutName,
      started_at: started.toISOString(),
      completed_at: log.completedAt,
      duration_seconds: log.durationSeconds,
      total_volume: log.totalVolume,
      exercises: [
        {
          exerciseId: 'native-session',
          sets: Array.from({ length: Math.max(1, log.setCount) }, () => ({
            reps: 10,
            weight: 0,
          })),
        },
      ],
    });
  } catch {
    // keep local history
  }
}

export async function finishWorkoutAndPersist(opts: {
  userId: string | null;
  workoutName: string;
  durationSeconds: number;
  setCount: number;
  totalVolume: number;
  sessionId?: string;
}): Promise<LocalWorkoutLog[]> {
  const log: LocalWorkoutLog = {
    id: `w-${Date.now()}`,
    workoutName: opts.workoutName,
    completedAt: new Date().toISOString(),
    durationSeconds: opts.durationSeconds,
    setCount: opts.setCount,
    totalVolume: opts.totalVolume,
    sessionId: opts.sessionId,
  };
  const history = await appendWorkoutLog(log);
  if (opts.userId) await pushWorkoutLogToCloud(opts.userId, log);
  return history;
}

/** Open Super Bundle Stripe Checkout on the web (mobile-friendly browser). */
export function bundleCheckoutUrl(): string {
  return `${WEB_APP_URL}/bundle?utm_source=native_app`;
}

export async function getLocalWorkoutCount(): Promise<number> {
  return (await loadWorkoutHistory()).length;
}
