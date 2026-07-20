import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  COACH_PLAN_KEY,
  DEVICE_ID_KEY,
  IDAY_DONE_KEY,
  WORKOUT_HISTORY_KEY,
  type CoachPlan,
  createSeedCoachPlan,
  mergePlans,
} from '@missionwinning/mw-core';

export type LocalWorkoutLog = {
  id: string;
  workoutName: string;
  completedAt: string;
  durationSeconds: number;
  setCount: number;
  totalVolume: number;
  sessionId?: string;
};

async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function setJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getOrCreateDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `mw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export async function isIdayDone(): Promise<boolean> {
  return (await AsyncStorage.getItem(IDAY_DONE_KEY)) === '1';
}

export async function markIdayDone(): Promise<void> {
  await AsyncStorage.setItem(IDAY_DONE_KEY, '1');
}

export async function loadCoachPlan(): Promise<CoachPlan | null> {
  return getJson<CoachPlan>(COACH_PLAN_KEY);
}

export async function saveCoachPlan(plan: CoachPlan): Promise<void> {
  await setJson(COACH_PLAN_KEY, plan);
}

export async function ensureCoachPlan(seedAdaptDemo = false): Promise<CoachPlan> {
  const existing = await loadCoachPlan();
  if (existing) return existing;
  const plan = createSeedCoachPlan({
    withAdaptDemo: seedAdaptDemo,
    revision: seedAdaptDemo ? 2 : 1,
  });
  await saveCoachPlan(plan);
  return plan;
}

export async function mergeAndSaveCoachPlan(remote: CoachPlan | null): Promise<CoachPlan | null> {
  const local = await loadCoachPlan();
  const merged = mergePlans(local, remote);
  if (merged) await saveCoachPlan(merged);
  return merged;
}

export async function loadWorkoutHistory(): Promise<LocalWorkoutLog[]> {
  return (await getJson<LocalWorkoutLog[]>(WORKOUT_HISTORY_KEY)) ?? [];
}

export async function appendWorkoutLog(log: LocalWorkoutLog): Promise<LocalWorkoutLog[]> {
  const prev = await loadWorkoutHistory();
  const next = [log, ...prev].slice(0, 200);
  await setJson(WORKOUT_HISTORY_KEY, next);
  return next;
}
