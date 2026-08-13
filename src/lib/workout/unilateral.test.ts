import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  completedLoggedSet,
  isUnilateralExercise,
  parseSetSide,
  persistableSetSide,
  shouldOfferSetSide,
  suggestNextSide,
} from './unilateral.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');

describe('isUnilateralExercise', () => {
  it('is true for lunges, DB row, Bulgarian split squat', () => {
    assert.equal(isUnilateralExercise({ id: 'lunges', name: 'Lunges' }), true);
    assert.equal(isUnilateralExercise({ id: 'dumbbell-row', name: 'Dumbbell Row' }), true);
    assert.equal(
      isUnilateralExercise({ id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat' }),
      true
    );
  });

  it('skips bilateral squat, bench, barbell row', () => {
    assert.equal(isUnilateralExercise({ id: 'squat', name: 'Squat' }), false);
    assert.equal(isUnilateralExercise({ id: 'bench-press', name: 'Bench Press' }), false);
    assert.equal(isUnilateralExercise({ id: 'barbell-row', name: 'Barbell Row' }), false);
    assert.equal(shouldOfferSetSide({ id: 'squat', name: 'Squat' }), false);
  });
});

describe('parseSetSide + persist', () => {
  it('round-trips L / R / alt and drops unknown', () => {
    assert.equal(parseSetSide('L'), 'L');
    assert.equal(parseSetSide('R'), 'R');
    assert.equal(parseSetSide('alt'), 'alt');
    assert.equal(parseSetSide('left'), undefined);
    assert.equal(parseSetSide('normal'), undefined);
    assert.equal(parseSetSide(undefined), undefined);
  });

  it('complete-map keeps side on a lunge and strips it on squat', () => {
    const lunge = completedLoggedSet(
      { reps: 8, weight: 20, kind: 'normal', side: 'L' },
      'lunges'
    );
    assert.equal(lunge.side, 'L');
    assert.equal(lunge.reps, 8);

    const alt = completedLoggedSet(
      { reps: 12, weight: 0, side: 'alt' },
      'walking-lunge'
    );
    assert.equal(alt.side, 'alt');

    const squat = completedLoggedSet(
      { reps: 5, weight: 100, side: 'L' },
      'squat'
    );
    assert.equal(squat.side, undefined, 'mutant that stores side on squat must go red');
    assert.equal(persistableSetSide('R', { id: 'bench-press', name: 'Bench Press' }), undefined);
  });
});

describe('suggestNextSide', () => {
  it('alternates L↔R, copies alt, leaves unset alone', () => {
    assert.equal(suggestNextSide('L'), 'R');
    assert.equal(suggestNextSide('R'), 'L');
    assert.equal(suggestNextSide('alt'), 'alt');
    assert.equal(suggestNextSide(undefined), undefined);
  });
});

describe('speech never owns side', () => {
  it('speech modules do not import unilateral.ts', () => {
    const dir = path.join(root, 'src/lib/speech');
    const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));
    assert.ok(files.length > 0, 'speech dir should exist');
    for (const f of files) {
      const src = readFileSync(path.join(dir, f), 'utf8');
      assert.doesNotMatch(
        src,
        /workout\/unilateral/,
        `${f} must not import the set-side module`
      );
    }
  });
});
