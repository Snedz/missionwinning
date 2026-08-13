import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { EXERCISES } from '@/data/exercises';
import { equipmentMatches } from '@/lib/coach/equipment';
import { parseHomeGymKit } from '@/lib/workout/homeGymKit';

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

  it('null kit keeps the three-profile rules', () => {
    const press = EXERCISES.find((e) => e.id === 'leg-press');
    assert.ok(press);
    assert.equal(equipmentMatches(press!, 'full-gym', null), true);
    assert.equal(equipmentMatches(press!, 'bodyweight', null), false);
  });

  it('kit overlay filters substitutions and does not rank', () => {
    const garage = parseHomeGymKit(['barbell', 'rack', 'plates', 'floor']);
    const squat = EXERCISES.find((e) => e.id === 'squats');
    const press = EXERCISES.find((e) => e.id === 'leg-press');
    assert.ok(squat && press);
    assert.equal(equipmentMatches(squat!, 'full-gym', garage), true);
    assert.equal(equipmentMatches(press!, 'full-gym', garage), false);
  });
});

describe('selector kit is filter-only', () => {
  it('rankExercises is not passed the kit', () => {
    const src = readFileSync(path.join(import.meta.dirname, 'selector.ts'), 'utf8');
    const rank = /function rankExercises\([\s\S]*?\n\}/;
    const block = rank.exec(src)?.[0] ?? '';
    assert.ok(block.includes('familiar'), 'rankExercises missing');
    assert.doesNotMatch(block, /homeGymKit|kitMatches/);
    assert.match(src, /equipmentMatches\(ex, ctx\.equipment, ctx\.homeGymKit\)/);
  });

  it('coach never imports identity (kit is emit-only the other way)', () => {
    const dir = import.meta.dirname;
    const files = readdirSync(dir).filter((n) => n.endsWith('.ts') && !n.endsWith('.test.ts'));
    assert.ok(files.includes('equipment.ts') && files.includes('selector.ts'));
    for (const name of files) {
      const src = readFileSync(path.join(dir, name), 'utf8');
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/identity/, name);
    }
  });
});
