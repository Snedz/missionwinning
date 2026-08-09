/**
 * Web storage for Athlete Page config (table + kit).
 */

import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';

let originalLocalStorage: Storage | undefined;
let hadWindow = false;

beforeEach(() => {
  const store = new Map<string, string>();
  const memStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  } as Storage;
  hadWindow = typeof globalThis.window !== 'undefined';
  if (!hadWindow) {
    (globalThis as unknown as { window: unknown }).window = Object.assign(
      Object.create(globalThis),
      { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} }
    );
  }
  originalLocalStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: memStorage,
  });
});

afterEach(() => {
  if (originalLocalStorage !== undefined) {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: originalLocalStorage,
    });
  }
  if (!hadWindow) delete (globalThis as unknown as { window?: unknown }).window;
});

test('save and load round-trip through the clamp', async () => {
  const {
    loadAthletePageConfig,
    saveAthletePageConfig,
    resolveStoredAthletePage,
  } = await import('@/lib/identity/athleteProfile');

  saveAthletePageConfig({
    kitId: 'default',
    table: { trainingStyle: 'hybrid', homeGym: 'bands' },
  });
  const loaded = loadAthletePageConfig();
  assert.equal(loaded.table.trainingStyle, 'hybrid');
  const resolved = resolveStoredAthletePage(1);
  assert.equal(resolved.kitId, 'default');
  assert.equal(resolved.table.homeGym, 'bands');
});

test('forged kit id is clamped on resolve', async () => {
  const { saveAthletePageConfig, resolveStoredAthletePage } = await import(
    '@/lib/identity/athleteProfile'
  );
  saveAthletePageConfig({
    kitId: 'not-real',
    table: { trainingStyle: 'strength' },
  });
  assert.equal(resolveStoredAthletePage(4).kitId, 'default');
});
