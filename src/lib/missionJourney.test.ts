import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  isIDayComplete,
  completeIDay,
  pickReadinessPrimaryAction,
} from '@/lib/missionJourney';
import { week1SecondSessionCue } from '@/lib/activation/week1SecondSession';

const startWorkout = {
  name: 'Test',
  exercises: [{ exerciseId: 'air-squat', sets: [{ reps: 10, weight: 0 }] }],
};

describe('missionJourney', () => {
  it('isIDayComplete returns boolean', () => {
    const result = isIDayComplete();
    assert.equal(typeof result, 'boolean');
  });
});

describe('pickReadinessPrimaryAction (Flow-6 train-first)', () => {
  it('exactly one log → session 2 at /active, not PAR-Q or guidebook', () => {
    const cue = week1SecondSessionCue({ completedSessions: 1 });
    assert.ok(cue);
    const action = pickReadinessPrimaryAction({
      readiness: { parq: false, streakMet: false, winScoreSeen: true },
      completedSessions: 1,
      startWorkout,
    });
    assert.ok(action);
    assert.equal(action!.href, '/active');
    assert.equal(action!.label, cue!.defaultLabel);
    assert.ok(action!.startWorkout);
    assert.notEqual(action!.href, '/assessments');
    assert.notEqual(action!.href, '/learn/guide');
  });

  it('parq false + guide unread still trains while streak open', () => {
    const action = pickReadinessPrimaryAction({
      readiness: { parq: false, streakMet: false, winScoreSeen: true },
      completedSessions: 2,
      startWorkout,
    });
    assert.ok(action);
    assert.equal(action!.href, '/active');
    assert.match(action!.label, /streak|train|session/i);
  });

  it('after streak met, Today still trains — PAR-Q is not a dock boss', () => {
    const action = pickReadinessPrimaryAction({
      readiness: { parq: false, streakMet: true, winScoreSeen: true },
      completedSessions: 7,
      startWorkout,
    });
    assert.ok(action);
    assert.equal(action!.href, '/active');
    assert.notEqual(action!.href, '/assessments');
  });

  it('never returns guidebook as primary', () => {
    for (const sessions of [0, 1, 2, 5]) {
      for (const parq of [false, true]) {
        for (const streakMet of [false, true]) {
          const action = pickReadinessPrimaryAction({
            readiness: { parq, streakMet, winScoreSeen: true },
            completedSessions: sessions,
            startWorkout,
          });
          if (action) {
            assert.notEqual(
              action.href,
              '/learn/guide',
              `sessions=${sessions} parq=${parq} streak=${streakMet}`
            );
          }
        }
      }
    }
  });

  it('getNextAction readiness branch uses pickReadinessPrimaryAction', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, 'missionJourney.ts'),
      'utf8'
    );
    assert.match(src, /pickReadinessPrimaryAction\(/);
    assert.match(src, /week1SecondSessionCue/);
    // Guidebook must not be a readiness primary return anymore.
    assert.doesNotMatch(
      src,
      /href:\s*'\/learn\/guide'/,
      'guidebook must not be a getNextAction primary href'
    );
  });

  it('basic empty-steps branch does not boss Mission Coach (K6)', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, 'missionJourney.ts'),
      'utf8'
    );
    // Soft-Coach fallthrough after BASIC_STEPS empty is gone.
    assert.doesNotMatch(
      src,
      /Open Mission Coach/,
      'basic complete must not primary-pin Coach (Flow-6 / K6)'
    );
    assert.match(src, /K6/);
  });
});

/*
 * A completion that never reached the device is not a completion.
 *
 * `iday_completed` is the top of the activation funnel, and the queue ratchet's
 * standing instruction is that the one thing this project still cannot do is
 * measure its own funnel. An event that fires on a write the browser refused
 * doesn't just add noise — it makes the number move for people who did not
 * convert, which is precisely how a funnel metric stops being evidence.
 *
 * These assert the return value rather than the absence of a throw, because the
 * old code did not throw either. It returned quietly and carried on.
 */
describe('completeIDay reports whether it persisted', () => {
  const profile = { experience: 'beginner', equipment: 'bodyweight', primaryGoal: 'general' };
  // `saveJourneyState` early-returns on the server, so a browser-ish global is
  // part of the fixture -- without it both cases read as `false` and the test
  // would pass for the wrong reason.
  const hadWindow = typeof globalThis.window !== 'undefined';
  if (!hadWindow) {
    (globalThis as unknown as { window: unknown }).window = Object.assign(
      Object.create(globalThis),
      { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} }
    );
  }
  after(() => {
    if (!hadWindow) delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('returns true when the device accepts the write', () => {
    const map = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        get length() {
          return map.size;
        },
        key: (i: number) => [...map.keys()][i] ?? null,
        getItem: (k: string) => map.get(k) ?? null,
        setItem: (k: string, v: string) => void map.set(k, v),
        removeItem: (k: string) => void map.delete(k),
        clear: () => map.clear(),
      } as Storage,
    });
    assert.equal(completeIDay(profile), true);
  });

  it('returns false when the device refuses, instead of pretending it completed', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        get length(): number {
          throw new DOMException('denied', 'SecurityError');
        },
        key: () => {
          throw new DOMException('denied', 'SecurityError');
        },
        getItem: () => null,
        setItem: () => {
          throw new DOMException('denied', 'SecurityError');
        },
        removeItem: () => {},
        clear: () => {},
      } as Storage,
    });
    assert.equal(completeIDay(profile), false);
  });
});
