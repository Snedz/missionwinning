import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  isMwBackup,
  mergeBackup,
  buildBackup,
  restoreBackupFromJson,
  type MwBackup,
} from '@/lib/backup';
import type { CompletedWorkoutLog } from '@/types';

function log(id: string, name: string, completedAt: string, volume: number): CompletedWorkoutLog {
  return {
    id,
    workoutName: name,
    startedAt: completedAt,
    completedAt,
    durationSeconds: 1800,
    exercises: [{ exerciseId: 'squat', sets: [{ reps: 5, weight: 100 }] }],
    totalVolume: volume,
  };
}

function backupWith(history: CompletedWorkoutLog[], localKeys: Record<string, string> = {}): MwBackup {
  return {
    app: 'mission-winning',
    version: 1,
    exportedAt: '2026-07-02T00:00:00.000Z',
    workoutStore: { state: { workoutHistory: history, savedWorkouts: [] }, version: 0 },
    localKeys,
  };
}

describe('backup', () => {
  it('rejects non-backup payloads', () => {
    assert.equal(isMwBackup(null), false);
    assert.equal(isMwBackup({}), false);
    assert.equal(isMwBackup({ app: 'other', version: 1, localKeys: {} }), false);
    assert.equal(isMwBackup(backupWith([])), true);
  });

  it('restores history onto an empty device', () => {
    const b = backupWith([log('a', 'Push Day', '2026-06-01T10:00:00Z', 5000)]);
    const result = mergeBackup(b, null, {});
    const next = JSON.parse(result.nextStoreJson);
    assert.equal(next.state.workoutHistory.length, 1);
    assert.equal(result.workoutsMerged, 1);
  });

  it('merges without duplicating identical workouts', () => {
    const shared = log('a', 'Push Day', '2026-06-01T10:00:00Z', 5000);
    const localOnly = log('b', 'Pull Day', '2026-06-02T10:00:00Z', 6000);
    const importedOnly = log('c', 'Leg Day', '2026-06-03T10:00:00Z', 7000);
    const current = JSON.stringify({
      state: { workoutHistory: [shared, localOnly], savedWorkouts: [] },
      version: 0,
    });
    const result = mergeBackup(backupWith([shared, importedOnly]), current, {});
    const next = JSON.parse(result.nextStoreJson);
    assert.equal(next.state.workoutHistory.length, 3);
    assert.equal(result.workoutsMerged, 1);
  });

  it('current device wins on mw_* keys; missing keys restore', () => {
    const b = backupWith([], { mw_experience: 'advanced', mw_equipment: 'full-gym' });
    const result = mergeBackup(b, null, { mw_experience: 'beginner' });
    assert.equal(result.keysToSet.mw_experience, undefined);
    assert.equal(result.keysToSet.mw_equipment, 'full-gym');
    assert.equal(result.keysRestored, 1);
  });

  it('ignores non-mw_ keys smuggled into a backup file', () => {
    const b = backupWith([], { 'supabase.auth.token': 'evil', mw_units: 'kg' });
    const result = mergeBackup(b, null, {});
    assert.deepEqual(Object.keys(result.keysToSet), ['mw_units']);
  });
});

/*
 * The recovery path has to work when the thing it recovers from is broken.
 *
 * This card is the safety net for an athlete with no account, and the warning it
 * sits next to says so: *"This device is out of storage space. Export a backup,
 * then clear some space so new sessions save."* That advice points straight at
 * these functions.
 *
 * They were not guarded. `buildBackup()` iterated `localStorage` from a click
 * handler with nothing catching, so on a browser that refuses storage the user got
 * no file, no message — and `track('backup_exported')` fired anyway. A recorded
 * export that never happened is worse than a missing one: it is the number that
 * makes a broken feature look like a working one.
 */

let originalLocalStorage: Storage | undefined;

function stubStorage(value: unknown): void {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value,
  });
}

function memStorage(overrides: Partial<Storage> = {}): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    ...overrides,
  } as Storage;
}

afterEach(() => {
  if (originalLocalStorage !== undefined) stubStorage(originalLocalStorage);
});

describe('backup survives a device that will not cooperate', () => {
  it('a readable device still exports normally', () => {
    const store = memStorage();
    store.setItem('mw_journey', '{"a":1}');
    stubStorage(store);
    originalLocalStorage = store;

    const result = buildBackup();
    assert.equal(result.ok, true);
    assert.ok(result.ok && result.value.localKeys['mw_journey'] === '{"a":1}');
  });

  it('a device that refuses to be read does NOT produce an empty backup', () => {
    /*
     * The dangerous failure mode is the subtle one: an empty `localKeys` map is a
     * *valid* backup shape. It downloads, it restores, and it wipes everything the
     * athlete had. So this asserts the refusal, not just the absence of a throw.
     */
    stubStorage(
      new Proxy(
        {},
        {
          get() {
            throw new DOMException('denied', 'SecurityError');
          },
        }
      )
    );
    originalLocalStorage = undefined;

    const result = buildBackup();
    assert.equal(result.ok, false);
    assert.ok(!result.ok && /private browsing/.test(result.error));
  });

  it('a denied write during restore reports failure instead of half-restoring', () => {
    let written = 0;
    stubStorage(
      memStorage({
        setItem: () => {
          // Refuse partway through, the way a full disk does.
          if (written++ > 0) throw new DOMException('quota', 'QuotaExceededError');
        },
      })
    );
    originalLocalStorage = undefined;

    const payload = backupWith([log('r-1', 'Legs', '2026-10-01T10:00:00Z', 3000)], {
      mw_prefs: '{"units":"kg"}',
    });
    const result = restoreBackupFromJson(JSON.stringify(payload));

    assert.equal(result.ok, false);
    assert.match(result.error ?? '', /clear some storage space/i);
  });
});
