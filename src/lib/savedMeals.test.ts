import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { listMealPresets, saveMealPreset, removeMealPreset } from '@/lib/savedMeals';

describe('savedMeals', () => {
  it('saves and lists presets in memory via localStorage mock', () => {
    const store = new Map<string, string>();
    const ls = {
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
    Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });
    Object.defineProperty(globalThis, 'window', { value: globalThis, configurable: true });

    store.clear();
    const after = saveMealPreset({ name: 'Chicken rice', protein: 42, cals: 555, carbs: 62, fat: 8 });
    assert.equal(after.length, 1);
    assert.equal(listMealPresets()[0].name, 'Chicken rice');
    const removed = removeMealPreset(after[0].id);
    assert.equal(removed.length, 0);
  });
});
