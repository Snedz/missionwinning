import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FALLBACK_REST_SECONDS,
  formatRestClock,
  getSuggestedRestSeconds,
  resolveRestSeconds,
  restSecondsForExercise,
  resolveStartRestSeconds,
  restProgress,
} from '@/lib/workout/restTimer';
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

  it('ActiveWorkoutPage uses restSecondsForExercise rather than a ternary', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /restSecondsForExercise\(/);
    assert.doesNotMatch(src, /resolveRestSeconds\(exercise\.name\)\s*:\s*90/);
  });
});
