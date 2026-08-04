import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { resolveActiveTableSetControls } from './activeTableSetControls.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');

describe('resolveActiveTableSetControls', () => {
  const sets = [
    { reps: 5, weight: 100, kind: 'warmup' as const },
    { reps: 5, weight: 120, kind: 'normal' as const },
  ];
  const resolveInput = (
    _e: number,
    s: number,
    dR: number,
    dW: number
  ) => ({ reps: dR + s, weight: dW });

  it('projects dial + kind when this card owns next set', () => {
    const out = resolveActiveTableSetControls({
      nextSet: { exIdx: 0, setIdx: 1 },
      exIdx: 0,
      sets,
      resolveInput,
    });
    assert.equal(out.canEdit, true);
    assert.deepEqual(out.setInput, { reps: 6, weight: 120 });
    assert.equal(out.activeSetKind, 'normal');
  });

  it('idle when next set is another exercise', () => {
    const out = resolveActiveTableSetControls({
      nextSet: { exIdx: 1, setIdx: 0 },
      exIdx: 0,
      sets,
      resolveInput,
    });
    assert.equal(out.canEdit, false);
    assert.deepEqual(out.setInput, { reps: 0, weight: 0 });
    assert.equal(out.activeSetKind, 'normal');
  });

  it('idle when no next set', () => {
    const out = resolveActiveTableSetControls({
      nextSet: null,
      exIdx: 0,
      sets,
      resolveInput,
    });
    assert.equal(out.canEdit, false);
  });

  it('defaults kind to normal when unset', () => {
    const out = resolveActiveTableSetControls({
      nextSet: { exIdx: 0, setIdx: 0 },
      exIdx: 0,
      sets: [{ reps: 8, weight: 40 }],
      resolveInput: (_e, _s, r, w) => ({ reps: r, weight: w }),
    });
    assert.equal(out.activeSetKind, 'normal');
    assert.equal(out.canEdit, true);
  });
});

describe('Active wiring (.408)', () => {
  it('ActiveExerciseList uses resolveActiveTableSetControls', () => {
    // Peels: table dial lives with the exercise-card list (.439), not the page shell.
    const src = readFileSync(
      path.join(root, 'src/components/workout/ActiveExerciseList.tsx'),
      'utf8'
    );
    assert.match(src, /resolveActiveTableSetControls\(/);
  });
});
