import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
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

describe('mergeTodayIntoNutritionLog', () => {
  // Pin the clock: the 90-day prune runs against new Date(), so fixture dates must not age out.
  beforeEach(() => {
    mock.timers.enable({ apis: ['Date'], now: new Date('2026-07-24T12:00:00Z') });
  });
  afterEach(() => {
    mock.timers.reset();
  });

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

  it('keeps the days before the day being merged, however long ago that day was', () => {
    // The retention window follows the day being MERGED, not the wall clock.
    // This is the property the July fixture above was silently relying on, and
    // it is why that test went off as a time bomb in October.
    const prev: NutritionLogRow[] = [
      { name: 'Older', protein: 1, cals: 10, date: '2020-01-01' },
      { name: 'Stale today', protein: 2, cals: 20, date: '2020-01-05' },
    ];
    const next = mergeTodayIntoNutritionLog(
      prev,
      [{ name: 'Eggs', protein: 12, cals: 140, meal: 'breakfast' }],
      '2020-01-05'
    );
    assert.ok(next.some((r) => r.name === 'Older'), 'the days before the merged day are kept');
    assert.ok(!next.some((r) => r.name === 'Stale today'));
    assert.ok(next.some((r) => r.name === 'Eggs'));
  });

  it('still prunes rows older than the retention window before the merged day', () => {
    // The window still prunes -- it just prunes relative to the merged day.
    const prev: NutritionLogRow[] = [
      { name: 'Ancient', protein: 1, cals: 10, date: '2019-01-01' },
    ];
    const next = mergeTodayIntoNutritionLog(
      prev,
      [{ name: 'Eggs', protein: 12, cals: 140, meal: 'breakfast' }],
      '2020-01-05'
    );
    assert.ok(!next.some((r) => r.name === 'Ancient'),
      'a row far outside the window is still pruned');
    assert.ok(next.some((r) => r.name === 'Eggs'));
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
