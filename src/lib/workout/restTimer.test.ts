import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FALLBACK_REST_SECONDS,
  formatRestClock,
  getSuggestedRestSeconds,
  isRestFinalSeconds,
  LAST_REST_MAX_EXERCISES,
  recallLastRest,
  rememberLastRest,
  rememberedRestAfterAdjust,
  resolveRestForNextSet,
  resolveRestSeconds,
  restSecondsForExercise,
  resolveStartRestSeconds,
  restProgress,
  REST_FINAL_SECONDS,
  shouldRememberRestOnSkip,
  shouldScrollAfterRestEnds,
  shouldShowRestPresets,
} from '@/lib/workout/restTimer';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('restTimer', () => {
  it('suggests longer rest for compounds', () => {
    assert.equal(getSuggestedRestSeconds('Barbell Back Squat'), 180);
    assert.equal(getSuggestedRestSeconds('Hammer Curl'), 60);
    assert.equal(getSuggestedRestSeconds('Lat Pulldown'), FALLBACK_REST_SECONDS);
  });

  it('formats rest clock', () => {
    assert.equal(formatRestClock(45), '45s');
    assert.equal(formatRestClock(90), '1:30');
  });

  it('computes progress ratio', () => {
    assert.equal(restProgress(90, 45), 0.5);
    assert.equal(restProgress(90, 0), 0);
  });

  it('flags final outdoor seconds for accent glance', () => {
    assert.equal(isRestFinalSeconds(REST_FINAL_SECONDS), true);
    assert.equal(isRestFinalSeconds(1), true);
    assert.equal(isRestFinalSeconds(REST_FINAL_SECONDS + 1), false);
    assert.equal(isRestFinalSeconds(0), false);
    assert.equal(isRestFinalSeconds(-1), false);
  });

  it('scrolls next set only when rest transitions active → idle', () => {
    assert.equal(shouldScrollAfterRestEnds(true, false), true);
    assert.equal(shouldScrollAfterRestEnds(false, false), false);
    assert.equal(shouldScrollAfterRestEnds(true, true), false);
    assert.equal(shouldScrollAfterRestEnds(false, true), false);
  });

  it('hides rest presets in final seconds so Skip owns the thumb', () => {
    assert.equal(shouldShowRestPresets(90), true);
    assert.equal(shouldShowRestPresets(REST_FINAL_SECONDS), false);
    assert.equal(shouldShowRestPresets(1), false);
  });

  it('resolveRestSeconds uses max of suggested and default', () => {
    const rest = resolveRestSeconds('Hammer Curl');
    assert.ok(rest >= 60);
  });

  it('resolveStartRestSeconds prefers explicit duration, else shared default', () => {
    assert.equal(resolveStartRestSeconds(120), 120);
    assert.equal(resolveStartRestSeconds(45), 45);
    // 0 / missing → saved default or FALLBACK_REST_SECONDS (never the old 30).
    assert.ok(resolveStartRestSeconds(0) >= 60);
    assert.ok(resolveStartRestSeconds(undefined) >= 60);
  });
});

describe('rest timer single source of truth (.292)', () => {
  it('the store does not hardcode a 30s default', () => {
    const root = path.join(import.meta.dirname, '..', '..', '..');
    const src = readFileSync(path.join(root, 'src/store/workoutStore.ts'), 'utf8');
    assert.doesNotMatch(
      src,
      /DEFAULT_REST_SECONDS\s*=\s*30/,
      'store must not invent 30s rest — use resolveStartRestSeconds / FALLBACK_REST_SECONDS'
    );
    assert.match(src, /resolveStartRestSeconds/, 'startRestTimer must delegate duration');
  });
});

describe('restSecondsForExercise', () => {
  it('falls back when the exercise name is missing', () => {
    assert.equal(restSecondsForExercise(undefined), 90);
  });

  it('restSecondsForExercise is used via planLogSetRest, not inlined on Active (.405)', () => {
    const page = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    const finish = readFileSync(
      path.join(import.meta.dirname, 'activeSessionFinish.ts'),
      'utf8'
    );
    assert.match(page, /planLogSetRest\(/);
    assert.doesNotMatch(
      page,
      /restSecondsForExercise\(/,
      'page must not call restSecondsForExercise — planLogSetRest owns rest duration'
    );
    assert.match(finish, /resolveRestForNextSet\(/);
    assert.doesNotMatch(finish, /resolveRestSeconds\(exercise\.name\)\s*:\s*90/);
  });
});

describe('last-rest recall (.715)', () => {
  it('remembers last rest per exercise and leaves others on the heuristic', () => {
    resetStorage();
    rememberLastRest('squats', 150);
    assert.equal(recallLastRest('squats'), 150);
    assert.equal(recallLastRest('hammer-curl'), null);
    assert.equal(
      resolveRestForNextSet({ exerciseId: 'squats', exerciseName: 'Barbell Back Squat' }),
      150
    );
    assert.equal(
      resolveRestForNextSet({ exerciseId: 'hammer-curl', exerciseName: 'Hammer Curl' }),
      60
    );
  });

  it('skip never writes last rest — leftover seconds must not become next rest', () => {
    resetStorage();
    rememberLastRest('bench-press', 180);
    assert.equal(shouldRememberRestOnSkip(), false);
    // A skip at 12s remaining must not overwrite 180.
    if (shouldRememberRestOnSkip()) {
      rememberLastRest('bench-press', 12);
    }
    assert.equal(recallLastRest('bench-press'), 180);
  });

  it('+15s that grows the initial is remembered; mid-countdown +15s is not', () => {
    assert.equal(
      rememberedRestAfterAdjust({ previousInitial: 90, nextRemaining: 105 }),
      105
    );
    assert.equal(
      rememberedRestAfterAdjust({ previousInitial: 90, nextRemaining: 55 }),
      null
    );
    assert.equal(
      rememberedRestAfterAdjust({ previousInitial: 90, nextRemaining: 90 }),
      null
    );
  });

  it('empty id and non-finite seconds no-op; out-of-range clamps to 15–600', () => {
    resetStorage();
    rememberLastRest('', 90);
    rememberLastRest('   ', 90);
    rememberLastRest('squats', Number.NaN);
    assert.equal(recallLastRest('squats'), null);
    rememberLastRest('squats', 5);
    assert.equal(recallLastRest('squats'), 15);
    rememberLastRest('squats', 900);
    assert.equal(recallLastRest('squats'), 600);
  });

  it('caps the last-rest map so it cannot grow without bound', () => {
    resetStorage();
    for (let i = 0; i < LAST_REST_MAX_EXERCISES + 5; i += 1) {
      rememberLastRest(`ex-${i}`, 90);
    }
    assert.equal(recallLastRest('ex-0'), null);
    assert.equal(recallLastRest(`ex-${LAST_REST_MAX_EXERCISES + 4}`), 90);
  });
});
