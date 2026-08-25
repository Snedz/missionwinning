/**
 * Session elapsed clock — pause stops accumulating; finish is elapsed-while-running.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  isSessionClockPaused,
  pauseSessionClock,
  readSessionClock,
  resumeSessionClock,
  sessionElapsedSeconds,
  startSessionClock,
  toggleSessionClock,
} from '@/lib/workout/sessionClock';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const T0 = '2026-08-25T10:00:00.000Z';
const at = (iso: string) => new Date(iso).getTime();
const T = (sec: number) => at(T0) + sec * 1000;

const BANNED_IMPORT =
  /from\s+['"]@\/(?:store|lib\/(?:premium|rewards|identity|social|wearables|speech|sync\/))/;

describe('readSessionClock', () => {
  it('empty / never started invents nothing', () => {
    assert.equal(readSessionClock(null), null);
    assert.equal(readSessionClock(undefined), null);
    assert.equal(readSessionClock({}), null);
    assert.equal(readSessionClock({ startedAt: 'not a date' }), null);
    assert.equal(sessionElapsedSeconds(null, T(90)), 0);
    assert.equal(pauseSessionClock(null, T(90)), null);
    assert.equal(resumeSessionClock(null, T(90)), null);
    assert.equal(toggleSessionClock(null, T(90)), null);
  });

  it('pre-.1001 persist (no clock field) runs from startedAt', () => {
    const clock = readSessionClock({ startedAt: T0 });
    assert.deepEqual(clock, { accumulatedSeconds: 0, runningSince: T0 });
    assert.equal(sessionElapsedSeconds(clock, T(45)), 45);
    assert.equal(isSessionClockPaused(clock), false);
  });

  it('start seeds a running clock from that instant', () => {
    assert.deepEqual(startSessionClock(T0), {
      accumulatedSeconds: 0,
      runningSince: T0,
    });
  });
});

describe('pause / resume', () => {
  it('pause freezes elapsed; later now does not add', () => {
    const running = startSessionClock(T0);
    const paused = pauseSessionClock(running, T(30));
    assert.deepEqual(paused, { accumulatedSeconds: 30, runningSince: null });
    assert.equal(isSessionClockPaused(paused), true);
    assert.equal(sessionElapsedSeconds(paused, T(90)), 30);
    assert.equal(sessionElapsedSeconds(paused, T(3600)), 30);
  });

  it('resume keeps the paused total and accumulates again', () => {
    const paused = pauseSessionClock(startSessionClock(T0), T(30));
    const resumed = resumeSessionClock(paused, T(90));
    assert.ok(resumed);
    assert.equal(resumed.accumulatedSeconds, 30);
    assert.equal(resumed.runningSince, '2026-08-25T10:01:30.000Z');
    assert.equal(isSessionClockPaused(resumed), false);
    assert.equal(sessionElapsedSeconds(resumed, T(100)), 40);
  });

  it('pause while already paused is a no-op; resume while running is a no-op', () => {
    const paused = pauseSessionClock(startSessionClock(T0), T(12));
    assert.deepEqual(pauseSessionClock(paused, T(99)), paused);
    const running = startSessionClock(T0);
    assert.deepEqual(resumeSessionClock(running, T(99)), running);
  });

  it('toggle pause then resume from the same total', () => {
    const once = toggleSessionClock(startSessionClock(T0), T(15));
    assert.deepEqual(once, { accumulatedSeconds: 15, runningSince: null });
    const twice = toggleSessionClock(once, T(40));
    assert.equal(sessionElapsedSeconds(twice, T(50)), 25);
  });

  it('pausing a live session with no work is fine — duration stays 0 until time runs', () => {
    const justStarted = startSessionClock(T0);
    const paused = pauseSessionClock(justStarted, T(0));
    assert.deepEqual(paused, { accumulatedSeconds: 0, runningSince: null });
    assert.equal(sessionElapsedSeconds(paused, T(600)), 0);
  });

  it('clock skew / NaN / negative never invent a duration', () => {
    assert.equal(
      sessionElapsedSeconds({ accumulatedSeconds: 10, runningSince: T0 }, at('2026-08-25T09:59:00.000Z')),
      10
    );
    const dirty = readSessionClock({
      startedAt: T0,
      sessionClock: { accumulatedSeconds: Number.NaN, runningSince: 'nope' },
    });
    assert.deepEqual(dirty, { accumulatedSeconds: 0, runningSince: null });
    assert.equal(sessionElapsedSeconds(dirty, T(99)), 0);
  });
});

describe('finish duration is elapsed-while-running', () => {
  it('30s run + 60s paused + 10s run = 40 on the receipt', () => {
    const paused = pauseSessionClock(startSessionClock(T0), T(30));
    const resumed = resumeSessionClock(paused, T(90));
    assert.equal(sessionElapsedSeconds(resumed, T(100)), 40);
  });
});

describe('sessionClock refuse + independence', () => {
  it('helper does not import the store or refused domains', () => {
    const src = read('src/lib/workout/sessionClock.ts');
    assert.doesNotMatch(src, BANNED_IMPORT);
    assert.doesNotMatch(src, /persistDedupe|elapsedSecondsFrom/);
    assert.doesNotMatch(src, /workClock|restTimer|protectLiveStart/);
  });
});
