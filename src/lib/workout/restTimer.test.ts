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
  restLaneFromKind,
  WARMUP_FALLBACK_SECONDS,
  rememberedRestAfterAdjust,
  resolveRestForNextSet,
  resolveRestSeconds,
  saveDefaultRestSeconds,
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

  it('resolveRestSeconds uses the name heuristic; global default is fallback only', () => {
    resetStorage();
    saveDefaultRestSeconds(90);
    assert.equal(resolveRestSeconds('Barbell Bench Press'), 180);
    assert.equal(resolveRestSeconds('Lateral Raise'), 60);
    assert.equal(resolveRestSeconds('Lat Pulldown'), 90);
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
    const curlFallback = restSecondsForExercise('Hammer Curl');
    assert.equal(
      resolveRestForNextSet({ exerciseId: 'hammer-curl', exerciseName: 'Hammer Curl' }),
      curlFallback
    );
    assert.notEqual(curlFallback, 150);
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

describe('per-exercise rest lanes (.995)', () => {
  it('maps warmup kind to the warmup lane; everything else is work', () => {
    assert.equal(restLaneFromKind('warmup'), 'warmup');
    assert.equal(restLaneFromKind('normal'), 'work');
    assert.equal(restLaneFromKind('failure'), 'work');
    assert.equal(restLaneFromKind('drop'), 'work');
    assert.equal(restLaneFromKind(undefined), 'work');
  });

  it('warmup and work rest can differ on the same lift; legacy number is work', () => {
    resetStorage();
    rememberLastRest('bench-press', 180);
    assert.equal(recallLastRest('bench-press'), 180);
    assert.equal(recallLastRest('bench-press', 'work'), 180);
    assert.equal(recallLastRest('bench-press', 'warmup'), null);
    rememberLastRest('bench-press', 60, 'warmup');
    assert.equal(recallLastRest('bench-press', 'work'), 180);
    assert.equal(recallLastRest('bench-press', 'warmup'), 60);
    assert.equal(
      resolveRestForNextSet({
        exerciseId: 'bench-press',
        exerciseName: 'Barbell Bench Press',
        lane: 'work',
      }),
      180
    );
    assert.equal(
      resolveRestForNextSet({
        exerciseId: 'bench-press',
        exerciseName: 'Barbell Bench Press',
        lane: 'warmup',
      }),
      60
    );
  });

  it('unset warmup is the 60s floor — never the work 3:00', () => {
    resetStorage();
    rememberLastRest('bench-press', 180, 'work');
    assert.equal(
      resolveRestForNextSet({
        exerciseId: 'bench-press',
        exerciseName: 'Barbell Bench Press',
        lane: 'warmup',
      }),
      WARMUP_FALLBACK_SECONDS
    );
    assert.equal(WARMUP_FALLBACK_SECONDS, 60);
  });

  it('laterals work 1:00 while bench work stays 3:00', () => {
    resetStorage();
    saveDefaultRestSeconds(90);
    assert.equal(
      resolveRestForNextSet({
        exerciseId: 'lateral-raise',
        exerciseName: 'Lateral Raise',
        lane: 'work',
      }),
      60
    );
    assert.equal(
      resolveRestForNextSet({
        exerciseId: 'bench-press',
        exerciseName: 'Barbell Bench Press',
        lane: 'work',
      }),
      180
    );
  });

  it('setting one lane does not rewrite the other', () => {
    resetStorage();
    rememberLastRest('squats', 180, 'work');
    rememberLastRest('squats', 45, 'warmup');
    rememberLastRest('squats', 150, 'work');
    assert.equal(recallLastRest('squats', 'work'), 150);
    assert.equal(recallLastRest('squats', 'warmup'), 45);
  });
});
