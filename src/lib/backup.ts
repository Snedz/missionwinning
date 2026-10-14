import type { CompletedWorkoutLog, SavedWorkout } from '@/types';
import { mergeWorkoutHistories } from '@/lib/workout/workoutMerge';
import { localDateKeyFromIso } from '@/lib/time/localDate';

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

export type BackupResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { value: T }))
  | { ok: false; error: string };

const STORAGE_UNREADABLE =
  "This browser won't let the app read its storage — private browsing does this. A backup can't be built until it can.";

/**
 * Every `mw_` key currently on the device, read defensively.
 *
 * This module talks to `localStorage` directly rather than through `safeStorage`,
 * which is its own problem — noted on `buildBackup` — but the reason it can be
 * fixed later rather than today is this function: a read that throws is reported,
 * not propagated.
 *
 * It must never return an empty map on failure. A backup that silently contains
 * none of the athlete's data is the worst possible output here: it looks like a
 * successful export, it downloads, and it restores to an empty app.
 */
function readLocalKeys(): BackupResult<Record<string, string>> {
  const localKeys: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mw_')) {
        const val = localStorage.getItem(key);
        if (val !== null) localKeys[key] = val;
      }
    }
  } catch {
    return { ok: false, error: STORAGE_UNREADABLE };
  }
  return { ok: true, value: localKeys };
}

/**
 * Assemble the backup payload.
 *
 * Returns a result rather than a payload because this is the user's only safety
 * net for a device that refuses to persist: `ProfileBackupCard` used to call this
 * from a click handler with nothing catching, so a throwing read meant no file,
 * no message, and `track('backup_exported')` firing anyway — analytics recording a
 * successful export that never happened.
 */
export function buildBackup(): BackupResult<MwBackup> {
  const keys = readLocalKeys();
  if (!keys.ok) return keys;

  let storeRaw: string | null = null;
  try {
    storeRaw = localStorage.getItem(WORKOUT_STORE_KEY);
  } catch {
    return { ok: false, error: STORAGE_UNREADABLE };
  }

  return {
    ok: true,
    value: {
      app: 'mission-winning',
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      workoutStore: safeParse(storeRaw ?? '') ?? {},
      localKeys: keys.value,
    },
  };
}

export function downloadBackup(): BackupResult {
  const built = buildBackup();
  if (!built.ok) return built;

  const blob = new Blob([JSON.stringify(built.value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mission-winning-backup-${localDateKeyFromIso(built.value.exportedAt)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return { ok: true };
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
  /*
   * Guarded, and it reports failure rather than propagating.
   *
   * The previous version threw straight out of the click handler on a denied
   * write, so the user saw nothing at all about the restore that did not happen.
   * Worse, it could throw *part way* through the loop below — store written,
   * keys half-written — which is the one state a restore must never report as a
   * clean success.
   */
  try {
    localStorage.setItem(WORKOUT_STORE_KEY, result.nextStoreJson);
    for (const [k, v] of Object.entries(result.keysToSet)) {
      localStorage.setItem(k, v);
    }
  } catch {
    return {
      ok: false,
      error:
        'This device refused part of the restore. Clear some storage space, then import the backup again.',
    };
  }
  return {
    ok: true,
    workoutsMerged: result.workoutsMerged,
    savedWorkoutsAdded: result.savedWorkoutsAdded,
    keysRestored: result.keysRestored,
  };
}
