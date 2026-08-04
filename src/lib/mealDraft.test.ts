import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  draftSourceFromEstimate,
  estimateToDraft,
  foodToDraft,
} from '@/lib/mealDraft';

describe('mealDraft', () => {
  it('foodToDraft includes brand when present', () => {
    assert.deepEqual(
      foodToDraft({
        id: '1',
        name: 'Oats',
        brand: 'Quaker',
        calories: 150,
        protein: 5,
        carbs: 27,
        fat: 3,
        servingLabel: '40g',
      }),
      { name: 'Oats (Quaker)', protein: 5, cals: 150, carbs: 27, fat: 3 }
    );
  });

  it('estimateToDraft copies macros without inventing confidence', () => {
    assert.deepEqual(
      estimateToDraft({
        name: 'Plate',
        protein: 30,
        cals: 400,
        carbs: 40,
        fat: 12,
      }),
      { name: 'Plate', protein: 30, cals: 400, carbs: 40, fat: 12 }
    );
  });

  it('maps api → database so DB picks do not look like heuristics', () => {
    assert.equal(draftSourceFromEstimate('api'), 'database');
    assert.equal(draftSourceFromEstimate('vision'), 'vision');
    assert.equal(draftSourceFromEstimate('heuristic'), 'heuristic');
  });

  it('PhotoMealLogger uses shared draft helpers (not local copies)', () => {
    const src = readFileSync(
      path.join(
        import.meta.dirname,
        '..',
        'components',
        'nutrition',
        'PhotoMealLogger.tsx'
      ),
      'utf8'
    );
    assert.match(src, /foodToDraft|estimateToDraft|draftSourceFromEstimate/);
    assert.match(src, /from '@\/lib\/mealDraft'/);
    assert.doesNotMatch(
      src,
      /function foodToDraft/,
      'foodToDraft must live in mealDraft.ts — one definition'
    );
    assert.doesNotMatch(src, /function estimateToDraft/);
  });
});
