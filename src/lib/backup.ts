import type { CompletedWorkoutLog, SavedWorkout } from '@/types';
import { mergeWorkoutHistories } from '@/lib/workoutMerge';

/**
 * Full-device backup for users without an account (their only safety net)
 * and a migration path between devices. Bundles the zustand workout store
 * plus every app-owned localStorage key (mw_*).
 */

export const WORKOUT_STORE_KEY = 'workout-tracker-storage';
export const BACKUP_VERSION = 1;

export interface MwBackup {
  app: 'mission-winning';
  version: number;
  exportedAt: string;
  /** Parsed zustand persist payload (state.savedWorkouts / state.workoutHistory). */
  workoutStore: unknown;
  /** All localStorage keys beginning with mw_ (journey, nutrition, prefs…). */
  localKeys: Record<string, string>;
}

interface PersistedWorkoutState {
  state?: {
    savedWorkouts?: SavedWorkout[];
    workoutHistory?: CompletedWorkoutLog[];
    [k: string]: unknown;
  };
  version?: number;
  [k: string]: unknown;
}

export function isMwBackup(value: unknown): value is MwBackup {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.app === 'mission-winning' &&
    typeof v.version === 'number' &&
    typeof v.localKeys === 'object' &&
    v.localKeys !== null
  );
}

/** Pure core: merge a backup into the current storage snapshot. */
export function mergeBackup(
  backup: MwBackup,
  currentStoreJson: string | null,
  currentKeys: Record<string, string>
): {
  nextStoreJson: string;
  keysToSet: Record<string, string>;
  workoutsMerged: number;
  savedWorkoutsAdded: number;
  keysRestored: number;
} {
  const current: PersistedWorkoutState = currentStoreJson
    ? safeParse(currentStoreJson) ?? {}
    : {};
  const incoming: PersistedWorkoutState =
    (typeof backup.workoutStore === 'object' && backup.workoutStore !== null
      ? (backup.workoutStore as PersistedWorkoutState)
      : {}) ?? {};

  const currentHistory = current.state?.workoutHistory ?? [];
  const incomingHistory = incoming.state?.workoutHistory ?? [];
  const mergedHistory = mergeWorkoutHistories(currentHistory, incomingHistory);

  const currentSaved = current.state?.savedWorkouts ?? [];
  const seen = new Set(currentSaved.map((w) => w.id));
  const addedSaved = (incoming.state?.savedWorkouts ?? []).filter((w) => w?.id && !seen.has(w.id));

  const nextState: PersistedWorkoutState = {
    ...current,
    version: current.version ?? incoming.version ?? 0,
    state: {
      ...incoming.state,
      ...current.state,
      savedWorkouts: [...currentSaved, ...addedSaved],
      workoutHistory: mergedHistory,
    },
  };

  // Restore mw_* keys only where the device has no value — current device wins.
  const keysToSet: Record<string, string> = {};
  for (const [k, v] of Object.entries(backup.localKeys)) {
    if (!k.startsWith('mw_')) continue;
    if (currentKeys[k] === undefined) keysToSet[k] = v;
  }

  return {
    nextStoreJson: JSON.stringify(nextState),
    keysToSet,
    workoutsMerged: mergedHistory.length - currentHistory.length,
    savedWorkoutsAdded: addedSaved.length,
    keysRestored: Object.keys(keysToSet).length,
  };
}

function safeParse(json: string): PersistedWorkoutState | null {
  try {
    return JSON.parse(json) as PersistedWorkoutState;
  } catch {
    return null;
  }
}

// ── Browser wrappers ────────────────────────────────────────────────

export function buildBackup(): MwBackup {
  const localKeys: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('mw_')) {
      const val = localStorage.getItem(key);
      if (val !== null) localKeys[key] = val;
    }
  }
  return {
    app: 'mission-winning',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    workoutStore: safeParse(localStorage.getItem(WORKOUT_STORE_KEY) ?? '') ?? {},
    localKeys,
  };
}

export function downloadBackup(): void {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mission-winning-backup-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function restoreBackupFromJson(json: string): {
  ok: boolean;
  error?: string;
  workoutsMerged?: number;
  savedWorkoutsAdded?: number;
  keysRestored?: number;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Not a valid JSON file.' };
  }
  if (!isMwBackup(parsed)) {
    return { ok: false, error: 'Not a Mission Winning backup file.' };
  }

  const currentKeys: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('mw_')) {
      const val = localStorage.getItem(key);
      if (val !== null) currentKeys[key] = val;
    }
  }

  const result = mergeBackup(parsed, localStorage.getItem(WORKOUT_STORE_KEY), currentKeys);
  localStorage.setItem(WORKOUT_STORE_KEY, result.nextStoreJson);
  for (const [k, v] of Object.entries(result.keysToSet)) {
    localStorage.setItem(k, v);
  }
  return {
    ok: true,
    workoutsMerged: result.workoutsMerged,
    savedWorkoutsAdded: result.savedWorkoutsAdded,
    keysRestored: result.keysRestored,
  };
}
