/**
 * Tiny active-workout flag for nav pulse — keeps MobileNav/Sidebar free of workoutStore.
 */

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
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('workout-tracker-storage');
    if (!raw) {
      setActiveWorkoutFlag(false);
      return false;
    }
    const parsed = JSON.parse(raw) as { state?: { activeWorkout?: unknown } };
    const on = Boolean(parsed.state?.activeWorkout);
    setActiveWorkoutFlag(on);
    return on;
  } catch {
    setActiveWorkoutFlag(false);
    return false;
  }
}

export function subscribeActiveWorkoutFlag(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
