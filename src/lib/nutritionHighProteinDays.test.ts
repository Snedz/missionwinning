import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { countHighProteinDaysFromNutritionLog } from './nutritionHighProteinDays.ts';

describe('countHighProteinDaysFromNutritionLog', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    (globalThis as { window?: unknown }).window = globalThis;
    (globalThis as { localStorage?: Storage }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    };
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  it('returns 0 when empty', () => {
    assert.equal(countHighProteinDaysFromNutritionLog(), 0);
  });

  it('sums protein per day and counts days at threshold', () => {
    store.set(
      'mw_nutrition_log',
      JSON.stringify([
        { date: '2026-07-01', protein: 80 },
        { date: '2026-07-01', protein: 80 },
        { date: '2026-07-02', protein: 100 },
        { date: '2026-07-03', protein: 150 },
      ])
    );
    // day1=160, day2=100, day3=150 → 2 days ≥150
    assert.equal(countHighProteinDaysFromNutritionLog(), 2);
  });

  it('honors custom threshold', () => {
    store.set(
      'mw_nutrition_log',
      JSON.stringify([{ date: '2026-07-01', protein: 120 }])
    );
    assert.equal(countHighProteinDaysFromNutritionLog(100), 1);
    assert.equal(countHighProteinDaysFromNutritionLog(150), 0);
  });
});
