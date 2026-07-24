import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeNutritionDays, type NutritionLogRow } from '@/lib/nutritionQuickLog';

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
