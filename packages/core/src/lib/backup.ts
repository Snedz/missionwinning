import type { ActiveWorkout, CompletedWorkoutLog, SavedWorkout } from '@/types';
import { mergeWorkoutHistoriesDetailed } from '@/lib/workout/workoutMerge';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { readDurableSnapshot, remove, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

/**
 * Full-device backup for users without an account (their only safety net)
 * and a migration path between devices. Bundles the zustand workout store
 * plus every app-owned localStorage key (mw_*).
 */

export const WORKOUT_STORE_KEY = 'workout-tracker-storage';
export const BACKUP_VERSION = 1;

function backupStorage(namespace: string) {
  const workoutKey = namespace + WORKOUT_STORE_KEY;
  const snapshot = readDurableSnapshot(namespace + 'mw_', workoutKey);
  if (!snapshot) return null;
  return {
    workoutKey,
    extra: snapshot.extra,
    entries: Object.fromEntries(Object.entries(snapshot.entries).map(([key, value]) =>
      [key.slice(namespace.length), value])),
  };
}

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
    activeWorkout?: ActiveWorkout | null;
    savedWorkouts?: SavedWorkout[];
    workoutHistory?: CompletedWorkoutLog[];
    [k: string]: unknown;
  };
  version?: number;
  [k: string]: unknown;
}

export function isMwBackup(value: unknown): value is MwBackup {
  if (!isRecord(value) || value.app !== 'mission-winning' || value.version !== BACKUP_VERSION ||
      typeof value.exportedAt !== 'string' || !isRecord(value.localKeys) ||
      !Object.values(value.localKeys).every((entry) => typeof entry === 'string')) return false;
  if (value.workoutStore === null) return true;
  if (!isRecord(value.workoutStore)) return false;
  const state = value.workoutStore.state;
  if (state === undefined) return true;
  if (!isRecord(state)) return false;
  const active = state.activeWorkout;
  return (active == null || (isWorkout(active) && active.exercises.every((exercise) =>
    exercise.sets.every((set) => typeof set.id === 'string' && typeof set.completed === 'boolean')))) &&
    optionalArray(state.workoutHistory, (log) => isWorkout(log) && typeof log.id === 'string' &&
      isDate(log.completedAt) && typeof log.durationSeconds === 'number' && typeof log.totalVolume === 'number') &&
    optionalArray(state.savedWorkouts, (template) => isRecord(template) && typeof template.id === 'string' &&
      typeof template.name === 'string' && validExercises(template.exercises));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalArray(value: unknown, validate: (entry: unknown) => boolean) {
  return value === undefined || (Array.isArray(value) && value.every(validate));
}

function isDate(value: unknown) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function validExercises(value: unknown): value is { sets: Record<string, unknown>[] }[] {
  return Array.isArray(value) && value.every((exercise) => isRecord(exercise) &&
    typeof exercise.exerciseId === 'string' && Array.isArray(exercise.sets) &&
    exercise.sets.every((set) => isRecord(set) && typeof set.reps === 'number' && typeof set.weight === 'number'));
}

function isWorkout(value: unknown): value is Record<string, unknown> & { exercises: { sets: Record<string, unknown>[] }[] } {
  return isRecord(value) && typeof value.workoutName === 'string' &&
    isDate(value.startedAt) && validExercises(value.exercises);
}
/** Pure core: merge a backup into the current storage snapshot. */
export function mergeBackup(
  backup: MwBackup,
  currentStoreJson: string | null,
  currentKeys: Record<string, string>,
  historyCap = Infinity,
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
  const importedUnit: CompletedWorkoutLog['weightUnit'] = backup.localKeys[STORAGE_KEYS.units] === 'imperial' ? 'lb'
    : backup.localKeys[STORAGE_KEYS.units] === 'metric' ? 'kg' : undefined;
  const incomingHistory = (incoming.state?.workoutHistory ?? []).map((log) =>
    log && !log.weightUnit && importedUnit ? { ...log, weightUnit: importedUnit } : log);
  const incomingActive = incoming.state?.activeWorkout;
  const incomingState = incomingActive && !incomingActive.weightUnit && importedUnit
    ? { ...incoming.state, activeWorkout: { ...incomingActive, weightUnit: importedUnit } }
    : incoming.state;
  const { logs: mergedHistory } = mergeWorkoutHistoriesDetailed(currentHistory, incomingHistory, historyCap);

  const currentSaved = current.state?.savedWorkouts ?? [];
  const seen = new Set(currentSaved.map((w) => w.id));
  const addedSaved = (incoming.state?.savedWorkouts ?? []).filter((w) => {
    if (!w?.id || seen.has(w.id)) return false;
    seen.add(w.id);
    return true;
  });

  const nextState: PersistedWorkoutState = {
    ...current,
    version: current.version ?? incoming.version ?? 0,
    state: {
      ...incomingState,
      ...current.state,
      activeWorkout: current.state?.activeWorkout ?? incomingState?.activeWorkout,
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
export function buildBackup(namespace = ''): BackupResult<MwBackup> {
  const snapshot = backupStorage(namespace);
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

export function downloadBackup(namespace = ''): BackupResult {
  const built = buildBackup(namespace);
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

export function restoreBackupFromJson(json: string, namespace = ''): {
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

  const snapshot = backupStorage(namespace);
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
  const attemptedKeys: string[] = [];
  try {
    const result = mergeBackup(parsed, snapshot.extra, snapshot.entries);
    for (const [k, v] of Object.entries(result.keysToSet)) {
      const key = namespace + k;
      attemptedKeys.push(key);
      if (!writeRaw(key, v)) throw new Error();
    }
    if (!writeRaw(snapshot.workoutKey, result.nextStoreJson)) throw new Error();
    return {
      ok: true,
      workoutsMerged: result.workoutsMerged,
      savedWorkoutsAdded: result.savedWorkoutsAdded,
      keysRestored: result.keysRestored,
    };
  } catch {
    for (const key of attemptedKeys) remove(key);
    return {
      ok: false,
      error:
        'This device refused part of the restore. Clear some storage space, then import the backup again.',
    };
  }
}
