import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getRecentFoods,
  scaleMealMacros,
  summarizeNutritionDays,
  type NutritionLogRow,
} from '@/lib/nutritionQuickLog';

describe('summarizeNutritionDays', () => {
  it('returns 7 days including empty days', () => {
    const logs: NutritionLogRow[] = [
      { name: 'Eggs', protein: 12, cals: 140, date: '2026-07-24' },
      { name: 'Rice', protein: 4, cals: 200, date: '2026-07-22' },
    ];
    const days = summarizeNutritionDays(logs, '2026-07-24', 7);
    assert.equal(days.length, 7);
    assert.equal(days[6].date, '2026-07-24');
    assert.equal(days[6].cals, 140);
    assert.equal(days[6].protein, 12);
    const jul22 = days.find((d) => d.date === '2026-07-22');
    assert.ok(jul22);
    assert.equal(jul22.cals, 200);
    assert.equal(days[0].entries, 0);
  });
});

describe('getRecentFoods', () => {
  it('returns unique newest-first from today and yesterday', () => {
    const logs: NutritionLogRow[] = [
      { name: 'Oats', protein: 10, cals: 300, date: '2026-07-23' },
      { name: 'Eggs', protein: 12, cals: 140, date: '2026-07-24' },
      { name: 'Eggs', protein: 12, cals: 140, date: '2026-07-24' },
      { name: 'Chicken', protein: 35, cals: 220, date: '2026-07-24' },
      { name: 'Old', protein: 1, cals: 1, date: '2026-07-20' },
    ];
    const recent = getRecentFoods(logs, '2026-07-24', 6);
    assert.equal(recent[0][0], 'Chicken');
    assert.equal(recent[1][0], 'Eggs');
    assert.ok(recent.some((r) => r[0] === 'Oats'));
    assert.ok(!recent.some((r) => r[0] === 'Old'));
  });
});

describe('scaleMealMacros', () => {
  it('scales half and double', () => {
    const base = { protein: 20, cals: 200, carbs: 10, fat: 8 };
    assert.deepEqual(scaleMealMacros(base, 0.5), {
      protein: 10,
      cals: 100,
      carbs: 5,
      fat: 4,
    });
    assert.deepEqual(scaleMealMacros(base, 2), {
      protein: 40,
      cals: 400,
      carbs: 20,
      fat: 16,
    });
  });
});
