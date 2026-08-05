/**
 * Don't write the same bytes twice.
 *
 * `.210` — the logger serialised the athlete's entire history to `localStorage`
 * **once per second, while they trained.**
 *
 * `tickElapsed` and `tickRestTimer` each call `set()` on a one-second interval,
 * and zustand's persist middleware calls `setItem()` after **every** `set()` —
 * it does not diff the partialized slice (`zustand/middleware.js:360-377`). So
 * each tick ran `partialize` + `JSON.stringify` + a synchronous
 * `localStorage.setItem` of `savedWorkouts + workoutHistory + activeWorkout`.
 *
 * Benchmarked on realistic 6-exercise/4-set logs:
 *
 *   | history      | payload   | JSON.stringify |
 *   |--------------|-----------|----------------|
 *   | 50 sessions  |   163 KB  |    0.85 ms     |
 *   | 200 sessions |   647 KB  |    3.45 ms     |
 *   | 500 sessions | 1,616 KB  |    9.64 ms     |
 *
 * A mid-tier Android is 4–6× slower, and the synchronous disk write costs about
 * as much again — so a 200-session athlete lost roughly **30–50 ms of main
 * thread per second while logging, 60–100 ms/s during rest**. On the wedge
 * screen, mid-set, on the cheapest phone in the target market.
 *
 * ## Why this only skips, and never delays
 *
 * The obvious companion fix is to throttle writes to ~1/2 s with a trailing
 * flush on `pagehide`. **Deliberately not done.** This is the path that holds
 * workouts nobody can reproduce from memory, and `.205` was the last defect
 * here — a deferred write that fails to flush is data loss, and the browser
 * events that would flush it are exactly the ones that fire unreliably on
 * mobile.
 *
 * Skipping a byte-identical write is different in kind: it cannot lose
 * anything, because the value on disk is already the value we were asked to
 * write. Combined with `elapsedSeconds` leaving `partialize`, a timer tick now
 * produces an identical payload and is skipped outright — the whole cost goes
 * to zero without deferring a single real write.
 */

import type { StateStorage } from 'zustand/middleware';
import { readRaw, remove, writeRaw } from '@/lib/storage/safeStorage';

/**
 * Wrap a storage so a `setItem` with the value already stored is a no-op.
 *
 * Tracks what it last wrote rather than re-reading, because a `getItem` on the
 * hot path would trade one synchronous storage call for another.
 */
export function dedupeWrites(base: StateStorage): StateStorage & { writeCount: () => number } {
  const lastWritten = new Map<string, string>();
  let writes = 0;

  return {
    getItem: (name) => {
      const value = base.getItem(name);
      // Seed the cache from whatever hydration read, so the first tick after a
      // reload is skipped too rather than writing back what it just loaded.
      if (typeof value === 'string') lastWritten.set(name, value);
      return value;
    },

    setItem: (name, value) => {
      if (lastWritten.get(name) === value) return;
      lastWritten.set(name, value);
      writes += 1;
      return base.setItem(name, value);
    },

    removeItem: (name) => {
      lastWritten.delete(name);
      return base.removeItem(name);
    },

    /** Test-only: how many writes actually reached the underlying storage. */
    writeCount: () => writes,
  };
}

/**
 * Seconds the current session has been running, from its own start time.
 *
 * `elapsedSeconds` used to be an incrementing counter **inside `partialize`**,
 * which is what made a timer tick a full history write. Deriving it from
 * `startedAt` removes the reason to persist it at all — and is more correct:
 * the counter did not advance while the tab was closed, so a session resumed
 * after twenty minutes away reported the time the tab had been open rather than
 * the time the athlete had been training.
 */
/**
 * Zustand persist adapter over `safeStorage`.
 *
 * Framework review: this used to return bare `window.localStorage`, which
 * bypassed the eslint `no-restricted-globals` rule (that rule only sees the
 * identifier `localStorage`, not `window.localStorage`). `safeStorage` is
 * SSR-safe and never throws — the same promise the unit/route lanes need when
 * they import this module with no `window`.
 */
export function browserStorage(): StateStorage {
  return {
    getItem: (name) => readRaw(name),
    setItem: (name, value) => {
      writeRaw(name, value);
    },
    removeItem: (name) => {
      remove(name);
    },
  };
}

export function elapsedSecondsFrom(startedAt: string | undefined, now: number = Date.now()): number {
  if (!startedAt) return 0;
  const started = new Date(startedAt).getTime();
  if (!Number.isFinite(started)) return 0;
  return Math.max(0, Math.floor((now - started) / 1000));
}
