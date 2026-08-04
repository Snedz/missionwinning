import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  patchesForApplyTargets,
  patchesForPlateWeight,
  patchesForUseNext,
  plateCalcInitialWeight,
  resolveAddExerciseId,
} from './activeSetInputPatches.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');

describe('patchesForUseNext / plate / apply', () => {
  it('Use next writes reps then weight', () => {
    assert.deepEqual(patchesForUseNext({ reps: 9, weight: 60 }), [
      { field: 'reps', value: 9 },
      { field: 'weight', value: 60 },
    ]);
  });

  it('plate weight is a single field patch', () => {
    assert.deepEqual(patchesForPlateWeight(82.5), [{ field: 'weight', value: 82.5 }]);
  });

  it('apply-targets expands per set', () => {
    const out = patchesForApplyTargets([
      { setIdx: 0, reps: 5, weight: 100 },
      { setIdx: 2, reps: 5, weight: 95 },
    ]);
    assert.equal(out.length, 2);
    assert.equal(out[0]!.setIdx, 0);
    assert.deepEqual(out[0]!.patches, patchesForUseNext({ reps: 5, weight: 100 }));
    assert.equal(out[1]!.setIdx, 2);
  });
});

describe('plateCalcInitialWeight', () => {
  it('returns dial weight for next set', () => {
    const w = plateCalcInitialWeight({
      nextSet: { exIdx: 0, setIdx: 1 },
      exercises: [
        {
          sets: [
            { reps: 5, weight: 100 },
            { reps: 5, weight: 105 },
          ],
        },
      ],
      resolveInput: (_e, _s, _r, dW) => ({ weight: dW }),
    });
    assert.equal(w, 105);
  });

  it('returns undefined without next set', () => {
    assert.equal(
      plateCalcInitialWeight({
        nextSet: null,
        exercises: [],
        resolveInput: () => ({ weight: 0 }),
      }),
      undefined
    );
  });
});

describe('resolveAddExerciseId', () => {
  it('trims and rejects empty', () => {
    assert.equal(resolveAddExerciseId('  bench-press  '), 'bench-press');
    assert.equal(resolveAddExerciseId(''), null);
    assert.equal(resolveAddExerciseId('   '), null);
  });
});

describe('Active wiring (.407/.434)', () => {
  it('patch helpers live with their owners after peels', () => {
    const page = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    const dock = readFileSync(
      path.join(root, 'src/components/workout/ActiveSessionDock.tsx'),
      'utf8'
    );
    const sheets = readFileSync(
      path.join(root, 'src/components/workout/ActiveWorkoutSheets.tsx'),
      'utf8'
    );
    const inline = readFileSync(
      path.join(root, 'src/components/workout/ActiveInlineAddExercise.tsx'),
      'utf8'
    );
    // Use-next rides the dock console (.440)
    assert.match(dock, /patchesForUseNext\(/);
    // Apply-targets + plate fill stay on the page (session handlers)
    assert.match(page, /patchesForPlateWeight\(/);
    assert.match(page, /patchesForApplyTargets\(/);
    // Plate sheet + add-exercise id resolve on the sheets cluster (.450)
    assert.match(sheets, /plateCalcInitialWeight\(/);
    assert.match(sheets, /resolveAddExerciseId\(/);
    assert.match(page, /ActiveInlineAddExercise/);
    assert.match(inline, /resolveAddExerciseId\(/);
  });
});
