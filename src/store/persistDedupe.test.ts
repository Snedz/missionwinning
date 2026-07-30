/**
 * A timer tick must not write the athlete's history to disk.
 *
 * `.210` — it did, once per second, for as long as a session was running.
 * `tickElapsed` and `tickRestTimer` each `set()` on a one-second interval, and
 * zustand's persist calls `setItem()` after **every** `set()` without diffing
 * the partialized slice. On a 200-session history that is ~647 KB of
 * `JSON.stringify` plus a synchronous disk write, every second, on the logger.
 *
 * The fix has two halves and both are asserted here, because either alone
 * leaves the write in place: `elapsedSeconds` must be out of `partialize`, and
 * an identical payload must not reach storage.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { browserStorage, dedupeWrites, elapsedSecondsFrom } from '@/store/persistDedupe';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

function countingStorage() {
  const data = new Map<string, string>();
  let writes = 0;
  return {
    writes: () => writes,
    storage: {
      getItem: (n: string) => data.get(n) ?? null,
      setItem: (n: string, v: string) => {
        writes += 1;
        data.set(n, v);
      },
      removeItem: (n: string) => void data.delete(n),
    },
  };
}

describe('dedupeWrites', () => {
  it('writes the first value and skips an identical repeat', () => {
    const base = countingStorage();
    const s = dedupeWrites(base.storage);

    s.setItem('k', '{"a":1}');
    s.setItem('k', '{"a":1}');
    s.setItem('k', '{"a":1}');

    assert.equal(base.writes(), 1, 'three identical writes must reach storage once');
  });

  it('writes again as soon as the value really changes', () => {
    const base = countingStorage();
    const s = dedupeWrites(base.storage);

    s.setItem('k', '{"a":1}');
    s.setItem('k', '{"a":2}');
    s.setItem('k', '{"a":2}');
    s.setItem('k', '{"a":3}');

    assert.equal(base.writes(), 3);
    assert.equal(base.storage.getItem('k'), '{"a":3}', 'the last real value must be on disk');
  });

  /**
   * The property that makes this safe. Skipping is only ever correct because
   * the value we declined to write is already the value stored — this is the
   * assertion that would fail if the cache ever drifted from reality.
   */
  it('never leaves storage holding anything but the last value asked for', () => {
    const base = countingStorage();
    const s = dedupeWrites(base.storage);
    for (const v of ['a', 'a', 'b', 'b', 'b', 'c', 'a', 'a']) s.setItem('k', v);
    assert.equal(base.storage.getItem('k'), 'a');
  });

  it('seeds from the value hydration read, so the first tick after reload is free', () => {
    const base = countingStorage();
    base.storage.setItem('k', '{"a":1}');
    const s = dedupeWrites(base.storage);

    s.getItem('k'); // hydration
    s.setItem('k', '{"a":1}'); // the state we just loaded, written back

    assert.equal(base.writes(), 1, 'only the seed write; the write-back is a no-op');
  });

  it('a removed key can be written again', () => {
    const base = countingStorage();
    const s = dedupeWrites(base.storage);
    s.setItem('k', 'v');
    s.removeItem('k');
    s.setItem('k', 'v');
    assert.equal(base.storage.getItem('k'), 'v', 'the value must come back after a remove');
  });
});

describe('browserStorage', () => {
  /** The unit and route lanes both import the store with no window. */
  it('works without a window instead of throwing', () => {
    const s = browserStorage();
    assert.doesNotThrow(() => s.setItem('k', 'v'));
    assert.equal(s.getItem('k'), 'v');
    s.removeItem('k');
    assert.equal(s.getItem('k'), null);
  });
});

describe('elapsedSecondsFrom', () => {
  const start = '2026-07-30T10:00:00.000Z';
  const at = (iso: string) => new Date(iso).getTime();

  it('counts from the session start', () => {
    assert.equal(elapsedSecondsFrom(start, at('2026-07-30T10:00:00.000Z')), 0);
    assert.equal(elapsedSecondsFrom(start, at('2026-07-30T10:00:45.000Z')), 45);
    assert.equal(elapsedSecondsFrom(start, at('2026-07-30T11:30:00.000Z')), 5400);
  });

  /**
   * The behaviour change worth stating: the old counter only advanced while the
   * tab was open, so a session resumed after twenty minutes away reported the
   * time the *tab* had been open, not the time the athlete had been training.
   */
  it('counts wall-clock time, including time the tab was closed', () => {
    assert.equal(elapsedSecondsFrom(start, at('2026-07-30T10:20:00.000Z')), 1200);
  });

  it('never returns a negative or NaN duration', () => {
    assert.equal(elapsedSecondsFrom(start, at('2026-07-30T09:59:00.000Z')), 0, 'clock skew');
    assert.equal(elapsedSecondsFrom('not a date'), 0);
    assert.equal(elapsedSecondsFrom(undefined), 0);
  });
});

describe('the store wiring', () => {
  const store = () => stripComments(read('src/store/workoutStore.ts'));

  /**
   * Half one. Without this, dedupe cannot help — the payload genuinely differs
   * every second, so every write is a real one.
   */
  it('no key written by a setInterval appears in partialize', () => {
    const src = store();
    const partialize = src.slice(src.indexOf('partialize:'), src.indexOf('onRehydrateStorage'));
    for (const ticked of ['elapsedSeconds', 'restSecondsRemaining']) {
      assert.doesNotMatch(
        partialize,
        new RegExp(`\\b${ticked}\\b`),
        `${ticked} is written by a one-second interval; persisting it makes every tick ` +
          `serialise savedWorkouts + workoutHistory + activeWorkout to disk`
      );
    }
  });

  /** Half two. */
  it('the store persists through the dedupe wrapper', () => {
    assert.match(
      store(),
      /storage:\s*createJSONStorage\(\(\)\s*=>\s*dedupeWrites\(/,
      'the persist storage must be wrapped, or an unchanged payload still hits the disk'
    );
  });

  /** And elapsed is derived, not counted — the reason it can leave `partialize`. */
  it('elapsed time is derived from the session start', () => {
    const src = store();
    /*
     * Bounded from the *implementation*, not from the first textual match.
     * `getRecentHistory:` appears in the `WorkoutState` interface 400 lines
     * above `tickElapsed:`, so `indexOf` from position 0 produced a backwards
     * slice and the assertion read an empty string — vacuously true. Same trap
     * `.196` hit from the other direction, when a slice ran to end-of-file and
     * matched a function 200 lines below.
     */
    // `tickElapsed: () => {` — the brace is what separates the implementation
    // from the interface's `tickElapsed: () => void;`. The first correction of
    // this guard still matched the declaration and still read an empty body.
    const from = src.indexOf('tickElapsed: () => {');
    assert.ok(from !== -1, 'tickElapsed implementation not found — this guard is pointing nowhere');
    const to = src.indexOf('getRecentHistory:', from);
    assert.ok(to > from, 'could not bound the tickElapsed body');
    const tick = src.slice(from, to);
    assert.match(tick, /elapsedSecondsFrom\(/);
    assert.doesNotMatch(
      tick,
      /elapsedSeconds:\s*s\.elapsedSeconds\s*\+\s*1/,
      'an incrementing counter has to be persisted to survive a reload; a derived value does not'
    );
  });
});
