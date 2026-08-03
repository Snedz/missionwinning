import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  week1SecondSessionCue,
  week1SecondSessionDone,
  WEEK1_SECOND_SESSION_TARGET,
} from './week1SecondSession.ts';

describe('week1SecondSessionCue', () => {
  it('shows only after exactly one completed session', () => {
    assert.equal(week1SecondSessionCue({ completedSessions: 0 }), null);
    assert.ok(week1SecondSessionCue({ completedSessions: 1 })?.show);
    assert.equal(week1SecondSessionCue({ completedSessions: 2 }), null);
    assert.equal(week1SecondSessionCue({ completedSessions: 5 }), null);
  });

  it('hides while a workout is already active', () => {
    assert.equal(
      week1SecondSessionCue({ completedSessions: 1, hasActiveWorkout: true }),
      null
    );
  });

  it('points at /active with session-2 copy keys', () => {
    const cue = week1SecondSessionCue({ completedSessions: 1 });
    assert.ok(cue);
    assert.equal(cue!.href, '/active');
    assert.equal(cue!.labelKey, 'week1SecondSessionCta');
    assert.match(cue!.defaultReason, /second/i);
  });
});

describe('week1SecondSessionDone', () => {
  it(`is true at ${WEEK1_SECOND_SESSION_TARGET}+ sessions`, () => {
    assert.equal(week1SecondSessionDone(0), false);
    assert.equal(week1SecondSessionDone(1), false);
    assert.equal(week1SecondSessionDone(2), true);
    assert.equal(week1SecondSessionDone(3), true);
  });
});
