import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  isIDayComplete,
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

  it('after streak met, PAR-Q can own primary (commissioning)', () => {
    const action = pickReadinessPrimaryAction({
      readiness: { parq: false, streakMet: true, winScoreSeen: true },
      completedSessions: 7,
      startWorkout,
    });
    assert.ok(action);
    assert.equal(action!.href, '/assessments');
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
