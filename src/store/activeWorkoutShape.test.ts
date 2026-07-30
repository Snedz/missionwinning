import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isUsableActiveWorkout } from '@/store/workoutStore';

/**
 * What comes back from device storage is not what `partialize` wrote.
 *
 * It is whatever is on the device: an older build's shape, a half-written
 * record, a value someone edited by hand, a quota-truncated string. Every
 * consumer then did `activeWorkout.exercises[i].sets[j]`, so a non-object or a
 * missing array threw on the render path — and with no nested `error.tsx`
 * boundary, that blanked `/active` entirely. Verified end to end by the
 * `Logger resilience @gate` cases: `42` and `{ id: 'x' }` both produced the
 * global error screen before `.201`.
 */
describe('isUsableActiveWorkout', () => {
  it('accepts no session at all', () => {
    assert.equal(isUsableActiveWorkout(null), true);
    assert.equal(isUsableActiveWorkout(undefined), true);
  });

  it('accepts a real session', () => {
    assert.equal(
      isUsableActiveWorkout({ id: 'w1', exercises: [{ exerciseId: 'push-ups', sets: [] }] }),
      true
    );
    // No exercises yet is a legitimate freshly-started session.
    assert.equal(isUsableActiveWorkout({ id: 'w1', exercises: [] }), true);
  });

  it('rejects anything that is not an object', () => {
    for (const bad of [42, 'workout', true, Symbol('x')]) {
      assert.equal(isUsableActiveWorkout(bad), false, String(bad));
    }
  });

  it('rejects a session with no exercises array', () => {
    assert.equal(isUsableActiveWorkout({ id: 'x' }), false);
    assert.equal(isUsableActiveWorkout({ id: 'x', exercises: null }), false);
    assert.equal(isUsableActiveWorkout({ id: 'x', exercises: 'push-ups' }), false);
  });

  /** The screens index `exercises[i].sets[j]`, so each exercise needs its sets. */
  it('rejects an exercise with no sets array', () => {
    assert.equal(isUsableActiveWorkout({ exercises: [{ exerciseId: 'a' }] }), false);
    assert.equal(isUsableActiveWorkout({ exercises: [null] }), false);
    assert.equal(isUsableActiveWorkout({ exercises: [{ exerciseId: 'a', sets: {} }] }), false);
  });

  /**
   * One bad exercise condemns the session rather than being filtered out. A
   * half-restored session that silently loses sets is worse than a clean empty
   * state — the athlete can start again in one tap, but they cannot recover
   * data the app quietly dropped.
   */
  it('rejects the whole session when any exercise is unusable', () => {
    assert.equal(
      isUsableActiveWorkout({
        exercises: [{ exerciseId: 'a', sets: [] }, { exerciseId: 'b' }],
      }),
      false
    );
  });
});
