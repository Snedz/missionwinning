import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { EXERCISES, ensureFullExerciseCatalog } from '@/data/exercises';
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

  it('dumbbells allows dumbbells and gear-free bodyweight, even with a saved kit', () => {
    const curl = EXERCISES.find((e) => e.id === 'bicep-curl');
    const push = EXERCISES.find((e) => e.id === 'push-ups');
    assert.ok(curl && push);
    for (const kit of [null, parseHomeGymKit(['dumbbells', 'floor', 'pull-up-bar'])]) {
      assert.equal(equipmentMatches(curl, 'dumbbells', kit), true);
      assert.equal(equipmentMatches(push, 'dumbbells', kit), true);
      for (const id of ['band-pull-apart', 'kettlebell-swing', 'wall-ball', 'step-ups', 'pull-ups', 'pre-exhaust-fly', 'decline-pushup', 'dumbbell-fly', 'dumbbell-press']) {
        const exercise = EXERCISES.find((e) => e.id === id);
        assert.ok(exercise, id);
        assert.equal(equipmentMatches(exercise, 'dumbbells', kit), false, id);
      }
    }
    assert.equal(equipmentMatches(curl, 'dumbbells', parseHomeGymKit(['floor'])), false);
  });

  it('sled/tire only for full-gym', () => {
    const sled = { id: 'sled-push', name: 'Sled', muscleGroups: ['Legs'] as const, equipment: 'Sled' };
    assert.equal(equipmentMatches(sled as never, 'bodyweight'), false);
    assert.equal(equipmentMatches(sled as never, 'dumbbells'), false);
    assert.equal(equipmentMatches(sled as never, 'full-gym'), true);
  });

  it('excludes catalog moves whose setup requires extra gear despite their equipment label', async () => {
    await ensureFullExerciseCatalog();
    for (const id of ['incline-dumbbell-press', 'bulgarian-split-squat', 'nordic-curl-reg', 'fedb-dumbbell-bench-press', 'fedb-dumbbell-step-ups']) {
      const exercise = EXERCISES.find((e) => e.id === id);
      assert.ok(exercise, id);
      assert.equal(equipmentMatches(exercise, 'dumbbells'), false, id);
    }
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
