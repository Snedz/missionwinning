import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getTrainingStreak, getStreaks, STREAK_KEY } from '@/lib/streaks';
import type { CompletedWorkoutLog } from '@/types';

function log(isoDate: string): CompletedWorkoutLog {
  return {
    id: `w-${isoDate}`,
    workoutName: 'Test',
    name: 'Test',
    startedAt: `${isoDate}T11:00:00.000Z`,
    completedAt: `${isoDate}T12:00:00.000Z`,
    durationSeconds: 3600,
    totalVolume: 0,
    exercises: [],
  } as unknown as CompletedWorkoutLog;
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

  it('returns 1 for a single day', () => {
    assert.equal(getTrainingStreak([log('2026-07-10')]), 1);
  });

  it('counts consecutive days', () => {
    assert.equal(
      getTrainingStreak([log('2026-07-10'), log('2026-07-11'), log('2026-07-12')]),
      3
    );
  });

  it('stops at a gap', () => {
    assert.equal(
      getTrainingStreak([log('2026-07-10'), log('2026-07-11'), log('2026-07-13')]),
      1
    );
  });

  it('dedupes same calendar day', () => {
    assert.equal(
      getTrainingStreak([
        log('2026-07-12'),
        { ...log('2026-07-12'), id: 'w2', completedAt: '2026-07-12T18:00:00.000Z' } as CompletedWorkoutLog,
        log('2026-07-11'),
      ]),
      2
    );
  });

  it('prefers positive localStorage override', () => {
    store.set(STREAK_KEY, '9');
    assert.equal(getTrainingStreak([log('2026-07-10')]), 9);
  });

  it('getStreaks returns training + fuel shape', () => {
    store.set('mw_fuel_streak', '4');
    const s = getStreaks([log('2026-07-10'), log('2026-07-11')]);
    assert.equal(s.training, 2);
    assert.equal(s.fuel, 4);
  });
});
