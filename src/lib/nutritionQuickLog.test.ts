import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  averageNutritionOverLoggedDays,
  getRecentFoods,
  mergeTodayIntoNutritionLog,
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

describe('averageNutritionOverLoggedDays', () => {
  it('divides by logged days only, never the full window', () => {
    const logs: NutritionLogRow[] = [
      { name: 'Eggs', protein: 12, cals: 140, date: '2026-07-24' },
      { name: 'Rice', protein: 4, cals: 200, date: '2026-07-24' },
      { name: 'Oats', protein: 10, cals: 300, date: '2026-07-22' },
    ];
    const days = summarizeNutritionDays(logs, '2026-07-24', 7);
    const avg = averageNutritionOverLoggedDays(days);
    assert.ok(avg);
    // Two logged days out of seven: (340 + 300) / 2, (16 + 10) / 2.
    assert.equal(avg.loggedDays, 2);
    assert.equal(avg.avgCals, 320);
    assert.equal(avg.avgProtein, 13);
  });

  it('every logged day participates in the average', () => {
    const logs: NutritionLogRow[] = [
      { name: 'A', protein: 10, cals: 100, date: '2026-07-24' },
      { name: 'B', protein: 30, cals: 700, date: '2026-07-23' },
      { name: 'C', protein: 20, cals: 400, date: '2026-07-21' },
    ];
    const days = summarizeNutritionDays(logs, '2026-07-24', 7);
    const avg = averageNutritionOverLoggedDays(days);
    assert.ok(avg);
    assert.equal(avg.loggedDays, 3);
    assert.equal(avg.avgCals, 400);
    assert.equal(avg.avgProtein, 20);
  });

  it('returns null when nothing is logged', () => {
    const days = summarizeNutritionDays([], '2026-07-24', 7);
    assert.equal(averageNutritionOverLoggedDays(days), null);
    assert.equal(averageNutritionOverLoggedDays([]), null);
  });
});

describe('mergeTodayIntoNutritionLog', () => {
  it('replaces today and keeps older days', () => {
    const prev: NutritionLogRow[] = [
      { name: 'Old', protein: 1, cals: 10, date: '2026-07-20' },
      { name: 'Stale today', protein: 2, cals: 20, date: '2026-07-24' },
    ];
    const next = mergeTodayIntoNutritionLog(
      prev,
      [{ name: 'Eggs', protein: 12, cals: 140, meal: 'breakfast' }],
      '2026-07-24'
    );
    assert.equal(next.filter((r) => r.date === '2026-07-24').length, 1);
    assert.equal(next.find((r) => r.date === '2026-07-24')?.name, 'Eggs');
    assert.ok(next.some((r) => r.name === 'Old'));
    assert.ok(!next.some((r) => r.name === 'Stale today'));
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
