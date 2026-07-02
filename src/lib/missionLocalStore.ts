/** IndexedDB local-first store — workouts backup, assessments, sync outbox. */

const DB_NAME = 'mission-winning-local';
const DB_VERSION = 1;
const KV_STORE = 'kv';
const OUTBOX_STORE = 'outbox';

export type OutboxKind = 'workout_log';

export interface OutboxEntry {
  id?: number;
  kind: OutboxKind;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
}

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('indexedDB unavailable'));
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE);
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('idb open failed'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('idb tx failed'));
  });
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(KV_STORE, 'readwrite');
  tx.objectStore(KV_STORE).put(value, key);
  await txDone(tx);
  db.close();
}

export async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb();
  const tx = db.transaction(KV_STORE, 'readonly');
  const req = tx.objectStore(KV_STORE).get(key);
  const value = await new Promise<T | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
  await txDone(tx);
  db.close();
  return value ?? null;
}

export async function outboxAdd(entry: Omit<OutboxEntry, 'id' | 'attempts' | 'createdAt'> & { createdAt?: string; attempts?: number }): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(OUTBOX_STORE, 'readwrite');
  tx.objectStore(OUTBOX_STORE).add({
    kind: entry.kind,
    payload: entry.payload,
    createdAt: entry.createdAt ?? new Date().toISOString(),
    attempts: entry.attempts ?? 0,
  });
  await txDone(tx);
  db.close();
}

export async function outboxList(): Promise<OutboxEntry[]> {
  const db = await openDb();
  const tx = db.transaction(OUTBOX_STORE, 'readonly');
  const store = tx.objectStore(OUTBOX_STORE);
  const entries = await new Promise<OutboxEntry[]>((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as OutboxEntry[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  await txDone(tx);
  db.close();
  return entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function outboxRemove(id: number): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(OUTBOX_STORE, 'readwrite');
  tx.objectStore(OUTBOX_STORE).delete(id);
  await txDone(tx);
  db.close();
}

export async function outboxIncrementAttempts(id: number): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(OUTBOX_STORE, 'readwrite');
  const store = tx.objectStore(OUTBOX_STORE);
  const entry = await new Promise<OutboxEntry | undefined>((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as OutboxEntry | undefined);
    req.onerror = () => reject(req.error);
  });
  if (entry) {
    store.put({ ...entry, attempts: (entry.attempts ?? 0) + 1 });
  }
  await txDone(tx);
  db.close();
}

const WORKOUT_STORAGE_KEY = 'workout-tracker-storage';
const MIGRATION_FLAG = 'mw_idb_migrated_v1';

/** One-time copy of zustand localStorage snapshot into IndexedDB. */
export async function migrateLocalStorageToIdb(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const done = localStorage.getItem(MIGRATION_FLAG);
    if (done === '1') return false;
    const raw = localStorage.getItem(WORKOUT_STORAGE_KEY);
    if (raw) {
      await idbSet('workout-zustand-backup', raw);
    }
    const assessment = localStorage.getItem('mw_last_assessment');
    if (assessment) {
      await idbSet('assessment-backup', assessment);
    }
    localStorage.setItem(MIGRATION_FLAG, '1');
    return Boolean(raw || assessment);
  } catch {
    return false;
  }
}

export async function backupWorkoutZustandSnapshot(json: string): Promise<void> {
  await idbSet('workout-zustand-backup', json);
}

export async function backupAssessmentJson(json: string): Promise<void> {
  await idbSet('assessment-backup', json);
}
