/**
 * Nutrition outbox — Fuel cloud inserts must survive the tab closing.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { enqueueNutritionUpsert } from '@/lib/sync/nutritionSync';
import {
  __resetForTests,
  __setClockForTests,
  __setJitterForTests,
  flush,
  getState,
  registerHandler,
} from '@/lib/sync/outbox';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function installStorage(): () => void {
  const map = new Map<string, string>();
  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return () => {
    if (prev === undefined) delete g.localStorage;
    else g.localStorage = prev;
  };
}

test('nutritionSync enqueues unique ops and delivers', async () => {
  const uninstall = installStorage();
  try {
    resetStorage();
    __resetForTests();
    __setClockForTests(() => 1_000_000);
    __setJitterForTests(() => 0.5);

    const seen: unknown[] = [];
    registerHandler('nutrition.upsert', async (payload) => {
      seen.push(payload);
      return true;
    });

    enqueueNutritionUpsert({ date: '2099-01-01', name: 'Eggs', protein: 12, cals: 140 });
    enqueueNutritionUpsert({ date: '2099-01-01', name: 'Eggs', protein: 12, cals: 140 });
    assert.equal(getState().pending, 2, 'edits must not collapse — insert-only API');

    const done = await flush();
    assert.equal(done, 2);
    assert.equal(seen.length, 2);
    assert.equal(getState().pending, 0);
  } finally {
    uninstall();
  }
});

test('NutritionPage and AssessmentsPage do not fire-and-forget saveNutritionEntry', () => {
  const root = path.join(import.meta.dirname, '..', '..', '..');
  for (const rel of [
    'src/page-components/NutritionPage.tsx',
    'src/page-components/AssessmentsPage.tsx',
  ]) {
    const src = readFileSync(path.join(root, rel), 'utf8');
    assert.doesNotMatch(
      src,
      /saveNutritionEntry\(/,
      `${rel} must enqueue, not call saveNutritionEntry directly`
    );
    assert.match(src, /enqueueNutritionUpsert/);
  }
});
