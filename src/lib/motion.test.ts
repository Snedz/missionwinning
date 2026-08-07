/**
 * The count-up animation, and the two ways it must not run.
 *
 * `animateCount` drives the Mission Score numeral. It has one hard requirement
 * that is easy to lose in a refactor: when the athlete has asked for reduced
 * motion, it must **still deliver the final value** — skipping the animation is
 * correct, skipping the number is a blank score. The same is true of the
 * `from === to` short-circuit, which exists so a re-render with an unchanged
 * score does not schedule a frame loop that paints nothing.
 *
 * Both short-circuits are also the only paths that run without a browser, so
 * they are asserted directly; the animated path is driven through a stubbed
 * frame scheduler, which lets the easing endpoints and the cleanup be checked
 * deterministically rather than by waiting on real time.
 */

import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  MOTION_DURATION,
  MOTION_DURATION_FAST,
  MOTION_DURATION_SLOW,
  MOTION_EASE,
  animateCount,
  prefersReducedMotion,
} from '@/lib/motion';

type G = typeof globalThis & {
  requestAnimationFrame?: (cb: (t: number) => void) => number;
  cancelAnimationFrame?: (h: number) => void;
};
const g = globalThis as G;

/** A frame scheduler the test drives by hand — no timers, no flake. */
function stubFrames() {
  const pending = new Map<number, (t: number) => void>();
  let next = 1;
  const cancelled: number[] = [];
  const prevRaf = g.requestAnimationFrame;
  const prevCancel = g.cancelAnimationFrame;

  g.requestAnimationFrame = (cb) => {
    const handle = next++;
    pending.set(handle, cb);
    return handle;
  };
  g.cancelAnimationFrame = (handle) => {
    cancelled.push(handle);
    pending.delete(handle);
  };

  return {
    cancelled,
    pendingCount: () => pending.size,
    /** Run the single queued frame at `time`. */
    step(time: number) {
      const [handle, cb] = [...pending.entries()][0] ?? [];
      if (cb === undefined) return false;
      pending.delete(handle!);
      cb(time);
      return true;
    },
    restore() {
      g.requestAnimationFrame = prevRaf;
      g.cancelAnimationFrame = prevCancel;
    },
  };
}

let frames: ReturnType<typeof stubFrames> | null = null;
afterEach(() => {
  frames?.restore();
  frames = null;
});

describe('motion tokens', () => {
  it('are ordered fast < base < slow', () => {
    assert.ok(MOTION_DURATION_FAST < MOTION_DURATION, 'fast must be shorter than base');
    assert.ok(MOTION_DURATION < MOTION_DURATION_SLOW, 'base must be shorter than slow');
    for (const d of [MOTION_DURATION_FAST, MOTION_DURATION, MOTION_DURATION_SLOW]) {
      assert.ok(Number.isFinite(d) && d > 0, `duration ${d} is not a positive number`);
    }
  });

  it('the easing token is a usable CSS value', () => {
    assert.match(MOTION_EASE, /^cubic-bezier\(([-\d.]+,\s*){3}[-\d.]+\)$/);
  });
});

describe('prefersReducedMotion', () => {
  it('is false without a document rather than throwing', () => {
    // Server render: `window` is absent and this must not reach `matchMedia`.
    assert.equal(typeof globalThis.window, 'undefined', 'precondition: no window here');
    assert.equal(prefersReducedMotion(), false);
  });
});

describe('animateCount', () => {
  it('delivers the value immediately when there is nothing to animate', () => {
    frames = stubFrames();
    const seen: number[] = [];
    let done = 0;

    const cancel = animateCount(42, 42, 300, (v) => seen.push(v), () => done++);

    assert.deepEqual(seen, [42], 'the final value must still be painted');
    assert.equal(done, 1, 'onDone must fire');
    assert.equal(frames.pendingCount(), 0, 'no frame may be scheduled for a no-op');
    assert.doesNotThrow(() => cancel(), 'the returned cleanup must always be callable');
  });

  it('paints the exact target on the final frame', () => {
    frames = stubFrames();
    const seen: number[] = [];
    let done = 0;

    animateCount(0, 100, 300, (v) => seen.push(v), () => done++);
    assert.equal(frames.pendingCount(), 1, 'the first frame is scheduled immediately');

    // performance.now() is the clock; step far past the duration so t clamps to 1.
    frames.step(performance.now() + 10_000);

    assert.equal(seen[seen.length - 1], 100, 'the animation must land exactly on the target');
    assert.equal(done, 1, 'onDone fires once the clock passes the duration');
    assert.equal(frames.pendingCount(), 0, 'no further frames after completion');
  });

  it('emits only values inside the requested range while running', () => {
    frames = stubFrames();
    const seen: number[] = [];
    animateCount(10, 20, 300, (v) => seen.push(v));

    const start = performance.now();
    frames.step(start + 150);
    frames.step(start + 10_000);

    assert.ok(seen.length >= 2, 'expected at least one intermediate frame');
    for (const v of seen) {
      assert.ok(v >= 10 && v <= 20, `frame value ${v} escaped the range`);
      assert.equal(v, Math.round(v), 'a count-up must paint whole numbers');
    }
    assert.equal(seen[seen.length - 1], 20);
  });

  it('cancels the pending frame when the caller cleans up mid-flight', () => {
    frames = stubFrames();
    const cancel = animateCount(0, 100, 300, () => {});
    assert.equal(frames.pendingCount(), 1);

    cancel();

    assert.equal(frames.cancelled.length, 1, 'unmounting must cancel the scheduled frame');
    assert.equal(frames.pendingCount(), 0);
  });
});
