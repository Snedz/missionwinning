import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COACH_LIVE_HASH,
  COACH_LIVE_HREF,
  coachVoiceAccess,
  coachVoiceEmptyRetry,
  coachVoiceReopensListen,
  nextCoachVoicePhase,
  shouldFocusLiveTalk,
} from '@/lib/speech/coachVoiceSession';

describe('coach live href', () => {
  it('is the Coach talk hash — Today pins and deep links share one home', () => {
    assert.equal(COACH_LIVE_HASH, 'coach-live');
    assert.equal(COACH_LIVE_HREF, '/coach#coach-live');
    assert.equal(shouldFocusLiveTalk('#coach-live'), true);
    assert.equal(shouldFocusLiveTalk('coach-live'), true);
    assert.equal(shouldFocusLiveTalk('#week'), false);
  });
});

describe('coachVoiceEmptyRetry', () => {
  it('re-listens twice while the session is open, then stops', () => {
    assert.equal(coachVoiceEmptyRetry(true, 0), true);
    assert.equal(coachVoiceEmptyRetry(true, 1), true);
    assert.equal(coachVoiceEmptyRetry(true, 2), false);
    assert.equal(coachVoiceEmptyRetry(false, 0), false);
  });
});

describe('coachVoiceAccess', () => {
  it('live only when online and entitled — Meta signed-in + connected', () => {
    assert.equal(coachVoiceAccess({ online: true, entitled: true }), 'live');
    assert.equal(coachVoiceAccess({ online: false, entitled: true }), 'offline');
    assert.equal(coachVoiceAccess({ online: true, entitled: false }), 'locked');
    assert.equal(coachVoiceAccess({ online: false, entitled: false }), 'offline');
  });
});

describe('nextCoachVoicePhase', () => {
  it('tap starts listening; heard goes thinking; reply speaks', () => {
    assert.equal(nextCoachVoicePhase('ready', 'start'), 'listening');
    assert.equal(nextCoachVoicePhase('listening', 'heard'), 'thinking');
    assert.equal(nextCoachVoicePhase('thinking', 'reply'), 'speaking');
  });

  it('after speaking, reopens listen — the conversation stays open', () => {
    assert.equal(nextCoachVoicePhase('speaking', 'spoken'), 'listening');
    assert.equal(coachVoiceReopensListen('speaking', 'spoken'), true);
    assert.equal(coachVoiceReopensListen('thinking', 'reply'), false);
  });

  it('interrupt while speaking barges in to listen', () => {
    assert.equal(nextCoachVoicePhase('speaking', 'interrupt'), 'listening');
  });

  it('end or fail always returns to ready', () => {
    assert.equal(nextCoachVoicePhase('listening', 'end'), 'ready');
    assert.equal(nextCoachVoicePhase('thinking', 'fail'), 'ready');
    assert.equal(nextCoachVoicePhase('speaking', 'end'), 'ready');
  });

  it('empty hear does not invent a turn', () => {
    assert.equal(nextCoachVoicePhase('listening', 'empty'), 'ready');
  });
});
