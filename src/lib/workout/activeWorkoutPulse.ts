/**
 * Tiny active-workout flag for nav pulse — keeps MobileNav/Sidebar free of workoutStore.
 */

import { WORKOUT_STORE_KEY } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';

type Listener = () => void;

let active = false;
const listeners = new Set<Listener>();

export function setActiveWorkoutFlag(isActive: boolean): void {
  if (active === isActive) return;
  active = isActive;
  listeners.forEach((l) => l());
}

export function getActiveWorkoutFlag(): boolean {
  return active;
}

/** Hydrate from persisted zustand blob (no store import). */
export function hydrateActiveWorkoutFlagFromStorage(): boolean {
  const parsed = readJson<{ state?: { activeWorkout?: unknown } } | null>(WORKOUT_STORE_KEY, null);
  const on = Boolean(parsed?.state?.activeWorkout);
  setActiveWorkoutFlag(on);
  return on;
}

export function subscribeActiveWorkoutFlag(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
