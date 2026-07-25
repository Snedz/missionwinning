/**
 * The only place the app is allowed to touch localStorage.
 *
 * Why this exists: a bare `localStorage.setItem` throws in Safari private mode and
 * on quota exhaustion. Several call sites sat inside render/effect paths with no
 * try/catch, so a full disk could blank a page — on a product whose promise is
 * offline-first logging without an account.
 *
 * Guarantees:
 * - Never throws. Writes return `false` when they did not land.
 * - Server-safe: no-ops during SSR instead of exploding.
 * - Falls back to an in-memory map when the browser denies storage entirely, so a
 *   session still works for the length of the tab.
 * - Reports failures through `onStorageFailure` so the UI can be honest about it,
 *   without this module importing any UI.
 *
 * The backend is resolved per call (not at module load) so tests can install a stub.
 */

export type StorageFailureReason = 'quota' | 'denied' | 'unknown';

export interface StorageFailure {
  reason: StorageFailureReason;
  key: string;
  /** True once reads/writes are being served from memory only. */
  usingMemoryFallback: boolean;
}

type FailureListener = (failure: StorageFailure) => void;

const memory = new Map<string, string>();
const listeners = new Set<FailureListener>();

let memoryFallbackActive = false;
/** Quota is reported once per session — a full disk should not spam toasts. */
let quotaReported = false;

function rawStorage(): Storage | null {
  try {
    if (typeof globalThis === 'undefined') return null;
    const candidate = (globalThis as { localStorage?: Storage }).localStorage;
    return candidate ?? null;
  } catch {
    // Accessing the property itself throws in some locked-down embeddings.
    return null;
  }
}

function classify(error: unknown): StorageFailureReason {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    if (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22
    ) {
      return 'quota';
    }
    if (error.name === 'SecurityError' || error.name === 'NotAllowedError') return 'denied';
  }
  const name = (error as { name?: string } | null)?.name;
  if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') return 'quota';
  if (name === 'SecurityError' || name === 'NotAllowedError') return 'denied';
  return 'unknown';
}

function report(reason: StorageFailureReason, key: string): void {
  if (reason === 'quota') {
    if (quotaReported) return;
    quotaReported = true;
  }
  const failure: StorageFailure = {
    reason,
    key,
    usingMemoryFallback: memoryFallbackActive,
  };
  for (const listener of listeners) {
    try {
      listener(failure);
    } catch {
      /* a broken listener must not break a write */
    }
  }
}

/** Subscribe to storage failures (quota full, storage denied). Returns an unsubscribe. */
export function onStorageFailure(listener: FailureListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True when the browser gave us real persistence. False during SSR or when denied. */
export function isPersistent(): boolean {
  return !memoryFallbackActive && rawStorage() !== null;
}

export function readRaw(key: string): string | null {
  const store = rawStorage();
  if (!store || memoryFallbackActive) {
    return memory.has(key) ? (memory.get(key) ?? null) : null;
  }
  try {
    const value = store.getItem(key);
    // A key written to memory before the fallback cleared still wins if present.
    return value ?? (memory.has(key) ? (memory.get(key) ?? null) : null);
  } catch (error) {
    const reason = classify(error);
    if (reason === 'denied') memoryFallbackActive = true;
    report(reason, key);
    return memory.has(key) ? (memory.get(key) ?? null) : null;
  }
}

/** Returns true when the value is durably stored, false when only in memory / dropped. */
export function writeRaw(key: string, value: string): boolean {
  const store = rawStorage();
  if (!store || memoryFallbackActive) {
    memory.set(key, value);
    return false;
  }
  try {
    store.setItem(key, value);
    return true;
  } catch (error) {
    const reason = classify(error);
    if (reason === 'denied') memoryFallbackActive = true;
    memory.set(key, value);
    report(reason, key);
    return false;
  }
}

export function remove(key: string): void {
  memory.delete(key);
  const store = rawStorage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch (error) {
    report(classify(error), key);
  }
}

/** Parse JSON at `key`, returning `fallback` on missing or corrupt data. */
export function readJson<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (raw === null || raw === '') return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    // Corrupt payloads are treated as absent rather than crashing the caller.
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return false;
  }
  return writeRaw(key, serialized);
}

/**
 * Every stored key starting with `prefix`, deduped across the real backend and the
 * memory fallback.
 *
 * Only for the handful of places that must discover runtime-suffixed keys they never
 * wrote (`mw_event_*`, `mw_teacher_pin_*`). Anything with a fixed key should read it
 * from `STORAGE_KEYS` instead — enumeration is the slow path and it hides typos.
 */
export function keysWithPrefix(prefix: string): string[] {
  const found = new Set<string>();
  for (const key of memory.keys()) {
    if (key.startsWith(prefix)) found.add(key);
  }
  const store = rawStorage();
  if (store && !memoryFallbackActive) {
    try {
      for (let i = 0; i < store.length; i += 1) {
        const key = store.key(i);
        if (key !== null && key.startsWith(prefix)) found.add(key);
      }
    } catch (error) {
      report(classify(error), prefix);
    }
  }
  return [...found];
}

/** Test-only: clear memory fallback state between cases. */
export function __resetForTests(): void {
  memory.clear();
  memoryFallbackActive = false;
  quotaReported = false;
  listeners.clear();
}
