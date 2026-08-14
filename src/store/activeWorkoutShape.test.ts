import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isUsableActiveWorkout, hasLoggedWork } from '@/store/workoutStore';

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

/**
 * `.204` — onboarding must not take a session away.
 *
 * `startWorkout` replaces `activeWorkout` outright, which is correct when the
 * athlete taps Start. I-Day finish no longer auto-starts a preview (F-004 /
 * Hevy): it lands on Today. `hasLoggedWork` still decides whether finish
 * resumes an in-progress Active session instead of Today.
 *
 * The line is a **completed set**, not the existence of a session. A session
 * started and abandoned with nothing logged is noise; a completed set is the
 * first thing the app holds that the athlete cannot reproduce from memory.
 */
describe('hasLoggedWork', () => {
  const set = (completed: boolean) => ({ id: 's1', reps: 5, weight: 100, completed });

  it('is false for nothing at all', () => {
    assert.equal(hasLoggedWork(null), false);
    assert.equal(hasLoggedWork(undefined), false);
    assert.equal(hasLoggedWork(42), false);
  });

  it('is false for a session nobody has logged into yet', () => {
    assert.equal(hasLoggedWork({ exercises: [] }), false);
    assert.equal(hasLoggedWork({ exercises: [{ exerciseId: 'a', sets: [] }] }), false);
    assert.equal(hasLoggedWork({ exercises: [{ exerciseId: 'a', sets: [set(false)] }] }), false);
  });

  it('is true as soon as one set anywhere is completed', () => {
    assert.equal(hasLoggedWork({ exercises: [{ exerciseId: 'a', sets: [set(true)] }] }), true);
    // Deep in the session, not just the first exercise or the first set.
    assert.equal(
      hasLoggedWork({
        exercises: [
          { exerciseId: 'a', sets: [set(false)] },
          { exerciseId: 'b', sets: [set(false), set(true)] },
        ],
      }),
      true
    );
  });

  it('survives the same malformed storage isUsableActiveWorkout defends against', () => {
    assert.equal(hasLoggedWork({ exercises: 'nope' }), false);
    assert.equal(hasLoggedWork({ exercises: [null] }), false);
    assert.equal(hasLoggedWork({ exercises: [{ sets: [null] }] }), false);
  });
});

/**
 * And the predicate has to be consulted where the damage happened. A pure
 * function nobody calls is `.195` again — this is the fourth wave in which a
 * correct decision shipped with no caller.
 */
describe('the onboarding call site', () => {
  it('F-004: I-Day finish lands on Today — does not auto-start a preview session', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', 'page-components', 'WelcomePage.tsx'),
      'utf8'
    );
    const finish = src.slice(src.indexOf('const finish ='), src.indexOf('const handleBegin'));
    assert.ok(
      finish.includes('hasLoggedWork'),
      'WelcomePage.finish() must ask whether there is work to resume on /active'
    );
    assert.ok(
      finish.includes('idayFinishPath'),
      'default I-Day finish delegates to idayFinishPath — Today after flip, Train while gated'
    );
    assert.ok(
      !finish.includes('startWorkout('),
      'finish must not auto-start a preview session — Start lives on JourneyHero'
    );
  });
});
