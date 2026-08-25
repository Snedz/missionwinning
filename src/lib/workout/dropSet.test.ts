import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  DROP_LOAD_FRACTION,
  canStartDrop,
  composeDropRest,
  planStartDrop,
  restActionAfterCompose,
  shouldStopRestOnDropTag,
  suggestDropFromPrior,
  suggestDropLoad,
} from '@/lib/workout/dropSet';
import type { DropSetSnapshot } from '@/lib/workout/dropSet';
import { resolveStartRestSeconds } from '@/lib/workout/restTimer';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function set(
  partial: Partial<DropSetSnapshot> & Pick<DropSetSnapshot, 'completed'>
): DropSetSnapshot {
  return {
    reps: 8,
    weight: 100,
    kind: 'normal',
    ...partial,
  };
}

describe('suggestDropLoad (−20% to unit step, always below when load > 0)', () => {
  it('100 kg → 80; 225 lb → 180', () => {
    assert.equal(DROP_LOAD_FRACTION, 0.8, 'named fraction — a 0.9 mutant must fail');
    assert.equal(suggestDropLoad(100, 'metric'), 80);
    assert.equal(suggestDropLoad(225, 'imperial'), 180);
  });

  it('bodyweight stays 0', () => {
    assert.equal(suggestDropLoad(0, 'metric'), 0);
    assert.equal(suggestDropLoad(-1, 'imperial'), 0);
  });

  it('one-step load drops to 0 rather than rounding back to the parent', () => {
    assert.equal(suggestDropLoad(2.5, 'metric'), 0);
    assert.equal(suggestDropLoad(5, 'imperial'), 0);
  });

  it('non-finite parent is 0', () => {
    assert.equal(suggestDropLoad(Number.NaN, 'metric'), 0);
  });
});

describe('canStartDrop / planStartDrop', () => {
  it('false with no completed set or warmup-only', () => {
    assert.equal(canStartDrop([]), false);
    assert.equal(
      canStartDrop([set({ completed: false }), set({ completed: false, weight: 40 })]),
      false
    );
    assert.equal(canStartDrop([set({ completed: true, kind: 'warmup', weight: 40 })]), false);
    assert.equal(planStartDrop([set({ completed: true, kind: 'warmup', weight: 40 })], 'metric'), null);
  });

  it('true after a working set; targets the next incomplete', () => {
    const sets = [
      set({ completed: true, reps: 8, weight: 100 }),
      set({ completed: false, reps: 8, weight: 100 }),
    ];
    assert.equal(canStartDrop(sets), true);
    assert.deepEqual(planStartDrop(sets, 'metric'), {
      parentSetIdx: 0,
      targetSetIdx: 1,
      addSet: false,
      kind: 'drop',
      weight: 80,
      reps: 8,
    });
  });

  it('adds a set when the last row is already complete', () => {
    const sets = [set({ completed: true, reps: 6, weight: 100 })];
    assert.deepEqual(planStartDrop(sets, 'metric'), {
      parentSetIdx: 0,
      targetSetIdx: 1,
      addSet: true,
      kind: 'drop',
      weight: 80,
      reps: 6,
    });
  });

  it('chains off a completed drop', () => {
    const sets = [
      set({ completed: true, kind: 'normal', weight: 100, reps: 8 }),
      set({ completed: true, kind: 'drop', weight: 80, reps: 8 }),
    ];
    assert.equal(canStartDrop(sets), true);
    const plan = planStartDrop(sets, 'metric');
    assert.equal(plan?.parentSetIdx, 1);
    assert.equal(plan?.addSet, true);
    assert.equal(plan?.weight, 65);
    assert.equal(plan?.reps, 8);
  });

  it('kind-chip prefill reads the prior volume set, not a warmup', () => {
    const sets = [
      set({ completed: true, kind: 'normal', weight: 100, reps: 8 }),
      set({ completed: true, kind: 'warmup', weight: 40, reps: 8 }),
      set({ completed: false, weight: 100, reps: 8 }),
    ];
    assert.deepEqual(suggestDropFromPrior(sets, 2, 'metric'), { weight: 80, reps: 8 });
    assert.equal(suggestDropFromPrior(sets, 0, 'metric'), null);
  });
});

describe('composeDropRest (#508 compose — do not edit last-rest)', () => {
  it('skips rest on drop; leaves a work-set plan untouched', () => {
    const work = { takeRest: true, restSeconds: 150 };
    assert.deepEqual(composeDropRest(work, 'normal'), work);
    assert.deepEqual(composeDropRest(work, 'warmup'), work);
    assert.deepEqual(composeDropRest(work, 'failure'), work);
    assert.deepEqual(composeDropRest(work, undefined), work);
    assert.deepEqual(composeDropRest(work, 'drop'), { takeRest: false, restSeconds: 0 });
  });
});

describe('restActionAfterCompose (.986 stay at zero)', () => {
  it('starts rest on work / warmup / failure; stops on drop', () => {
    const work = { takeRest: true, restSeconds: 120 };
    assert.equal(restActionAfterCompose(composeDropRest(work, 'normal'), 'normal'), 'start');
    assert.equal(restActionAfterCompose(composeDropRest(work, 'warmup'), 'warmup'), 'start');
    assert.equal(restActionAfterCompose(composeDropRest(work, 'failure'), 'failure'), 'start');
    assert.equal(restActionAfterCompose(composeDropRest(work, undefined), undefined), 'start');
    assert.equal(restActionAfterCompose(composeDropRest(work, 'drop'), 'drop'), 'stop');
  });

  it('session-complete work holds; drop still stops a running timer', () => {
    const done = { takeRest: false, restSeconds: 90 };
    assert.equal(restActionAfterCompose(done, 'normal'), 'hold');
    assert.equal(restActionAfterCompose(composeDropRest(done, 'drop'), 'drop'), 'stop');
  });

  it('never starts after a drop — startRestTimer(0) would invent last rest / 90s', () => {
    const work = { takeRest: true, restSeconds: 150 };
    const drop = composeDropRest(work, 'drop');
    assert.equal(drop.takeRest, false);
    assert.equal(drop.restSeconds, 0);
    assert.equal(restActionAfterCompose(drop, 'drop'), 'stop');
    assert.notEqual(resolveStartRestSeconds(0), 0);
    assert.ok(resolveStartRestSeconds(0) >= 60);
  });

  it('tagging an incomplete drop stops rest; completed / warmup do not', () => {
    assert.equal(shouldStopRestOnDropTag('drop', false), true);
    assert.equal(shouldStopRestOnDropTag('drop', undefined), true);
    assert.equal(shouldStopRestOnDropTag('drop', true), false);
    assert.equal(shouldStopRestOnDropTag('warmup', false), false);
    assert.equal(shouldStopRestOnDropTag('normal', false), false);
    assert.equal(shouldStopRestOnDropTag('failure', false), false);
  });
});

describe('drop rest-zero wiring', () => {
  it('handleLogSet starts work rest and zeros drop rest; never startRestTimer(0)', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    const fn = page.match(
      /const handleLogSet[\s\S]*?startRestTimer\(rest\.restSeconds,\s*(?:rest\.rememberExerciseId\s*\?\?\s*)?exerciseId\);[\s\S]*?\n {2}\};/
    );
    assert.ok(fn, 'handleLogSet rest block missing');
    const body = fn[0];
    assert.match(body, /composeDropRest/);
    assert.match(body, /restActionAfterCompose/);
    assert.match(body, /restAction === 'start'/);
    assert.match(body, /restAction === 'stop'/);
    assert.match(body, /stopRestTimer\(\)/);
    assert.doesNotMatch(body, /startRestTimer\(\s*0/);
    assert.doesNotMatch(body, /\bawait\b/);
  });

  it('tag path stops rest on incomplete drop; Start drop still zeros', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    const tag = page.match(
      /const handleSetKindChange[\s\S]*?shouldStopRestOnDropTag[\s\S]*?stopRestTimer\(\);[\s\S]*?\n {2}\};/
    );
    assert.ok(tag, 'handleSetKindChange must stop rest on an incomplete drop tag');
    assert.match(page, /handleStartDrop[\s\S]*?stopRestTimer\(\)/);
    assert.doesNotMatch(tag[0], /startRestTimer/);
  });

  it('Today / door do not grow drop theater or warmup chrome', () => {
    const surfaces = [
      'src/page-components/HomePage.tsx',
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'app/private/PrivateTeaserClient.tsx',
    ];
    for (const rel of surfaces) {
      const src = read(rel);
      assert.doesNotMatch(src, /composeDropRest|restActionAfterCompose|planStartDrop/, rel);
      assert.doesNotMatch(src, /planWarmupBatch|shouldShowAddWarmups/, rel);
      assert.doesNotMatch(src, /CinematicWww|Discord\.com/, rel);
    }
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
  });

  it('drop rest path never consults premium / Health / Feed', () => {
    const files = [
      'src/lib/workout/dropSet.ts',
      'src/page-components/ActiveWorkoutPage.tsx',
    ];
    for (const rel of files) {
      const src = read(rel);
      assert.doesNotMatch(src, /premiumServer|isPremium|UnlockButton|\/bundle/, rel);
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/rewards/, rel);
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/social/, rel);
      assert.doesNotMatch(src, /injury|pregnan|physical therapist/i, rel);
    }
  });
});
