import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISES } from '@/data/exercises';
import { equipmentMatches } from '@/lib/coach/equipment';

describe('equipmentMatches', () => {
  it('bodyweight profile never yields Barbell/Machine/Cable', () => {
    const bad = EXERCISES.filter(
      (ex) =>
        equipmentMatches(ex, 'bodyweight') &&
        /barbell|machine|cable/i.test(ex.equipment ?? '')
    );
    assert.equal(bad.length, 0);
  });

  it('full-gym includes barbell exercises', () => {
    const bench = EXERCISES.find((e) => e.id === 'bench-press');
    assert.ok(bench);
    assert.equal(equipmentMatches(bench!, 'full-gym'), true);
  });

  it('dumbbells profile includes dumbbells and bands', () => {
    const curl = EXERCISES.find((e) => e.id === 'bicep-curl');
    const band = EXERCISES.find((e) => e.id === 'band-pull-apart');
    assert.ok(curl && band);
    assert.equal(equipmentMatches(curl!, 'dumbbells'), true);
    assert.equal(equipmentMatches(band!, 'dumbbells'), true);
  });

  it('sled/tire only for full-gym', () => {
    const sled = { id: 'sled-push', name: 'Sled', muscleGroups: ['Legs'] as const, equipment: 'Sled' };
    assert.equal(equipmentMatches(sled as never, 'bodyweight'), false);
    assert.equal(equipmentMatches(sled as never, 'dumbbells'), false);
    assert.equal(equipmentMatches(sled as never, 'full-gym'), true);
  });
});
