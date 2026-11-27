import type { ActiveWorkout, CompletedWorkoutLog, SavedWorkout } from '@/types';

export function isUsableActiveWorkout(value: unknown): boolean {
  if (value === null || value === undefined) return true; // no session is fine
  if (typeof value !== 'object') return false;
  const w = value as { exercises?: unknown };
  if (!Array.isArray(w.exercises)) return false;
  return w.exercises.every(
    (ex) => !!ex && typeof ex === 'object' && Array.isArray((ex as { sets?: unknown }).sets)
  );
}

/** Live compose the logger can paint — a session with at least one lift. */
export function hasComposeExercises(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (!isUsableActiveWorkout(value)) return false;
  const w = value as { exercises?: unknown };
  return Array.isArray(w.exercises) && w.exercises.length > 0;
}

export type WorkoutPersistSlice = {
  savedWorkouts?: SavedWorkout[];
  workoutHistory?: CompletedWorkoutLog[];
  activeWorkout?: ActiveWorkout | null;
};

/**
 * Persist rehydrate must not wipe a Just Go compose minted this tick.
 * Logged work on disk still wins. Empty / unusable persisted sessions do not.
 */
export function mergePersistedWorkoutState(
  persisted: unknown,
  current: WorkoutPersistSlice
): WorkoutPersistSlice {
  const p =
    persisted && typeof persisted === 'object'
      ? (persisted as WorkoutPersistSlice)
      : {};
  const persistedLive = hasComposeExercises(p.activeWorkout) ? p.activeWorkout : null;
  const currentLive = hasComposeExercises(current.activeWorkout)
    ? current.activeWorkout
    : null;

  let active: ActiveWorkout | null | undefined;
  if (hasLoggedWork(current.activeWorkout) && !hasLoggedWork(p.activeWorkout)) {
    active = current.activeWorkout;
  } else if (hasLoggedWork(p.activeWorkout)) {
    active = p.activeWorkout;
  } else if (currentLive && !persistedLive) {
    active = currentLive;
  } else if (persistedLive) {
    active = persistedLive;
  } else {
    active = currentLive ?? null;
  }

  return {
    savedWorkouts: p.savedWorkouts ?? current.savedWorkouts,
    workoutHistory: p.workoutHistory ?? current.workoutHistory,
    activeWorkout: active ?? null,
  };
}

/**
 * Has the athlete actually put work into this session?
 *
 * `.204` — `startWorkout` overwrites `activeWorkout` unconditionally. I-Day
 * finish no longer calls it (F-004 lands on Today), but any other auto-start
 * path still can. `/` renders the marketing landing for anyone past the gate
 * with no "you have journey state, go to /log" branch, so a returning tester
 * opening the site from history can re-enter onboarding — protect logged work.
 *
 * A session that exists is not the same as a session worth protecting: one
 * started and abandoned without a single logged set is noise, and refusing to
 * replace it would strand the athlete on a stale screen. A **completed set** is
 * the line, because that is the first moment the app holds something the
 * athlete cannot reproduce from memory.
 */
export function hasLoggedWork(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const w = value as { exercises?: unknown };
  if (!Array.isArray(w.exercises)) return false;
  return w.exercises.some((ex) => {
    const sets = (ex as { sets?: unknown } | null)?.sets;
    return Array.isArray(sets) && sets.some((s) => !!(s as { completed?: unknown })?.completed);
  });
}
