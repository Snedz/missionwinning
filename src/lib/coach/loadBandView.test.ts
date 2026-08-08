/**
 * The load band must refuse to speak before it has evidence (`.608`).
 *
 * This is the branch that matters. Anyone can render a number once `loadBands`
 * produces one; the value of the whole feature is that on day three it says "not
 * yet" instead of a plausible 1.0 — which is `.602`'s defect (a seeded 50/50/50
 * rendering as measured) in a more convincing costume, since a load ratio looks
 * like physiology.
 *
 * Drives the real `loadBands` rather than a stub, so a change to
 * `MIN_DAYS_FOR_RATIO` or to the model's null conditions moves this test with it
 * instead of leaving it asserting a contract nothing implements.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLoadBandView } from '@/lib/coach/loadBandView';
import { MIN_DAYS_FOR_RATIO } from '@/lib/coach/load';
import type { CompletedWorkoutLog } from '@/types';

/** Offsets from `now`, never date literals (§6). */
function session(daysAgo: number, id: string): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id,
    workoutName: 'Full body',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 3600,
    totalVolume: 4000,
    exercises: [
      {
        exerciseId: 'squats',
        sets: [
          { reps: 5, weight: 100, rpe: 'med' },
          { reps: 5, weight: 100, rpe: 'med' },
        ],
        muscleGroups: ['Legs'],
      },
    ],
  };
}

describe('resolveLoadBandView', () => {
  it('says nothing at all with no history', () => {
    const view = resolveLoadBandView([]);
    assert.equal(view.state, 'unmeasured');
  });

  it('refuses a ratio inside the evidence window, and says how long is left', () => {
    // Three days of training — a real streak, and nowhere near enough signal.
    const history = [session(2, 'a'), session(1, 'b'), session(0, 'c')];
    const view = resolveLoadBandView(history);

    assert.equal(
      view.state,
      'unmeasured',
      'a ratio inside the window would be an invented number that looks measured'
    );
    if (view.state !== 'unmeasured') throw new Error('unreachable');
    assert.ok(view.daysRemaining >= 1, 'the unmeasured state must be actionable, not blank');
    assert.ok(
      view.daysRemaining <= MIN_DAYS_FOR_RATIO,
      `daysRemaining ${view.daysRemaining} exceeds the whole window`
    );
  });

  it('reports a zone and a ratio once there is enough history', () => {
    // Well past MIN_DAYS_FOR_RATIO, trained consistently throughout.
    const history = Array.from({ length: 18 }, (_, i) =>
      session(MIN_DAYS_FOR_RATIO + 14 - i, `s${i}`)
    );
    const view = resolveLoadBandView(history);

    // Precondition asserted, not assumed: if this fixture failed to clear the
    // window the test below would pass for the wrong reason — it would be
    // measuring the unmeasured branch twice.
    assert.equal(
      view.state,
      'measured',
      'fixture must clear the evidence window or this suite tests one branch twice'
    );
    if (view.state !== 'measured') throw new Error('unreachable');
    assert.notEqual(view.zone, 'unknown', 'a measured view may not carry the unknown zone');
    assert.ok(Number.isFinite(view.ratio) && view.ratio > 0, `ratio ${view.ratio}`);
    assert.equal(view.ratio, Math.round(view.ratio * 100) / 100, 'ratio is rounded for display');
  });
});
