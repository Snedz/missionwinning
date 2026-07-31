/**
 * `.217` — these tests used to assert the defect.
 *
 * Every case below pinned an absolute date (`2026-07-10`) while
 * `getTrainingStreak` reads the real clock, so what they actually measured was
 * *"a run that ended long ago still reports its old length"* — and they were
 * **green**, which is why the streak overstated for the whole life of the
 * module. One of them, `prefers positive localStorage override`, asserted a
 * stored `9` against a single ancient workout and called that correct.
 *
 * That is `.211`'s date bomb with the sign flipped: there the fixture drifted
 * away from the clock and the suite went red overnight; here it drifted away and
 * the suite stayed green because the code under test had no opinion about time.
 *
 * So dates are now derived from the same clock the code reads. A test that pins
 * a calendar date to check a rule *about* calendar dates is testing the fixture.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { bumpTrainingStreak, getTrainingStreak, getStreaks, STREAK_KEY } from '@/lib/streaks';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import type { CompletedWorkoutLog } from '@/types';

/** A workout completed `daysAgo` days back, at local midday so no zone flips it. */
function logDaysAgo(daysAgo: number): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return {
    id: `w-${daysAgo}`,
    workoutName: 'Test',
    name: 'Test',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 3600,
    totalVolume: 0,
    exercises: [],
  } as unknown as CompletedWorkoutLog;
}

function dayKeyDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const store = new Map<string, string>();
const ls = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => {
    store.set(k, v);
  },
  removeItem: (k: string) => {
    store.delete(k);
  },
};

describe('getTrainingStreak', () => {
  beforeEach(() => {
    store.clear();
    (globalThis as { window?: unknown; localStorage?: typeof ls }).window = {
      localStorage: ls,
    };
    (globalThis as { localStorage?: typeof ls }).localStorage = ls;
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { localStorage?: typeof ls }).localStorage;
  });

  it('returns 0 for empty history', () => {
    assert.equal(getTrainingStreak([]), 0);
  });

  it('returns 1 for a single session today', () => {
    assert.equal(getTrainingStreak([logDaysAgo(0)]), 1);
  });

  it('counts consecutive days ending today', () => {
    assert.equal(getTrainingStreak([logDaysAgo(2), logDaysAgo(1), logDaysAgo(0)]), 3);
  });

  it('stops at a gap', () => {
    // 4 and 3 days ago are consecutive with each other but do not reach today.
    assert.equal(getTrainingStreak([logDaysAgo(4), logDaysAgo(3), logDaysAgo(1)]), 1);
  });

  it('dedupes same calendar day', () => {
    const twice = { ...logDaysAgo(0), id: 'w-again' } as CompletedWorkoutLog;
    assert.equal(getTrainingStreak([logDaysAgo(0), twice, logDaysAgo(1)]), 2);
  });

  /* ── The decay rule, which is the whole point of `.217` ────────────────── */

  it('a run that ended yesterday still counts', () => {
    // The only grace in the definition: someone who trained last night and opens
    // the app at 07:00 has broken nothing.
    assert.equal(getTrainingStreak([logDaysAgo(2), logDaysAgo(1)]), 2);
  });

  it('a run that ended two days ago is broken', () => {
    assert.equal(getTrainingStreak([logDaysAgo(3), logDaysAgo(2)]), 0);
  });

  it('a long run that ended three months ago is 0, not its old length', () => {
    /*
     * The defect, stated as a test. Five consecutive days, ninety days back:
     * the old implementation walked backwards from `dates[0]` without ever
     * asking when `dates[0]` was, and reported 5 — to the share card, the
     * commissioning milestone and the public leaderboard.
     */
    const history = [90, 91, 92, 93, 94].map(logDaysAgo);
    assert.equal(getTrainingStreak(history), 0);
  });

  /* ── The override, which `dayReview` called unfit for a factual sentence ── */

  it('a stale override does not survive', () => {
    store.set(STREAK_KEY, '9');
    store.set(STORAGE_KEYS.streakLastBump, dayKeyDaysAgo(30));
    // Falls through to the history, which is also stale — so 0, not 9.
    assert.equal(getTrainingStreak([logDaysAgo(30)]), 0);
  });

  it('a live override is honoured', () => {
    store.set(STREAK_KEY, '9');
    store.set(STORAGE_KEYS.streakLastBump, dayKeyDaysAgo(0));
    assert.equal(getTrainingStreak([]), 9);
  });

  it('an override with no recorded day falls through to the history', () => {
    /*
     * Pre-`.217` overrides carry no date. They are not evidence of a live streak
     * — only that some number was written at an unknown time — so the history,
     * which can actually be checked, decides.
     */
    store.set(STREAK_KEY, '9');
    assert.equal(getTrainingStreak([logDaysAgo(0), logDaysAgo(1)]), 2);
    assert.equal(getTrainingStreak([logDaysAgo(40)]), 0);
  });

  /* ── The writer, round-tripped through the reader ──────────────────────── */

  it('a bump is honoured by the next read, and the same day does not bump twice', () => {
    /*
     * Behavioural, not source-text. `.217`'s first draft of this guard asserted
     * `/streakLastBump/` appeared in `bumpTrainingStreak`'s body — and the body
     * *reads* that key as well as writing it, so deleting the write left the
     * guard green while every override silently stopped being honoured. Tenth
     * vacuous guard in this run of work, same shape as `.215`'s survivor: a
     * search wider than the thing it names.
     */
    assert.equal(bumpTrainingStreak(), 1);
    assert.equal(getTrainingStreak([]), 1, 'the write must be readable, or the override is dead');

    assert.equal(bumpTrainingStreak(), 1, 'a second tap on the same day is a no-op');
    assert.equal(bumpTrainingStreak(), 1, 'and a third');
    assert.equal(getTrainingStreak([]), 1);
  });

  it('a bump after a gap restarts at 1 rather than continuing a stale run', () => {
    store.set(STREAK_KEY, '12');
    store.set(STORAGE_KEYS.streakLastBump, dayKeyDaysAgo(30));
    assert.equal(bumpTrainingStreak(), 1);
    assert.equal(getTrainingStreak([]), 1);
  });

  it('a bump the day after a live run continues it', () => {
    store.set(STREAK_KEY, '4');
    store.set(STORAGE_KEYS.streakLastBump, dayKeyDaysAgo(1));
    assert.equal(bumpTrainingStreak(), 5);
    assert.equal(getTrainingStreak([]), 5);
  });

  it('getStreaks returns training + fuel shape', () => {
    store.set(STORAGE_KEYS.fuelStreak, '4');
    store.set(STORAGE_KEYS.fuelLastLogDate, dayKeyDaysAgo(0));
    const s = getStreaks([logDaysAgo(1), logDaysAgo(0)]);
    assert.equal(s.training, 2);
    assert.equal(s.fuel, 4);
  });
});
