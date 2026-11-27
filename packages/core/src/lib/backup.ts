import type { CompletedWorkoutLog, SavedWorkout } from '@/types';
import { mergeWorkoutHistories } from '@/lib/workout/workoutMerge';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { readDurableSnapshot, writeRaw } from '@/lib/storage/safeStorage';

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
 * Assemble the backup payload.
 *
 * Returns a result rather than a payload because this is the user's only safety
 * net for a device that refuses to persist: `ProfileBackupCard` used to call this
 * from a click handler with nothing catching, so a throwing read meant no file,
 * no message, and `track('backup_exported')` firing anyway — analytics recording a
 * successful export that never happened.
 */
export function buildBackup(): BackupResult<MwBackup> {
  const snapshot = readDurableSnapshot('mw_', WORKOUT_STORE_KEY);
  if (!snapshot) return { ok: false, error: STORAGE_UNREADABLE };

  return {
    ok: true,
    value: {
      app: 'mission-winning',
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      workoutStore: safeParse(snapshot.extra ?? '') ?? {},
      localKeys: snapshot.entries,
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

  const snapshot = readDurableSnapshot('mw_', WORKOUT_STORE_KEY);
  if (!snapshot) return { ok: false, error: STORAGE_UNREADABLE };
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
    const result = mergeBackup(parsed, snapshot.extra, snapshot.entries);
    if (!writeRaw(WORKOUT_STORE_KEY, result.nextStoreJson)) throw new Error();
    for (const [k, v] of Object.entries(result.keysToSet)) {
      if (!writeRaw(k, v)) throw new Error();
    }
    return {
      ok: true,
      workoutsMerged: result.workoutsMerged,
      savedWorkoutsAdded: result.savedWorkoutsAdded,
      keysRestored: result.keysRestored,
    };
  } catch {
    return {
      ok: false,
      error:
        'This device refused part of the restore. Clear some storage space, then import the backup again.',
    };
  }
}
