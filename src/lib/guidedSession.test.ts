import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompletionResult,
  initSessionState,
  overallProgress,
  pauseSession,
  resetSession,
  resumeSession,
  skipStep,
  startSession,
  tickSession,
  totalSessionDurationSec,
} from '@/lib/guidedSession';

const STEPS = [
  { label: 'A', durationSec: 3 },
  { label: 'B', cue: 'breathe', durationSec: 2 },
];

describe('guidedSession', () => {
  it('initializes at first step', () => {
    const s = initSessionState(STEPS);
    assert.equal(s.status, 'idle');
    assert.equal(s.stepIndex, 0);
    assert.equal(s.remainingSec, 3);
  });

  it('ticks down and advances steps', () => {
    let s = startSession(initSessionState(STEPS));
    s = tickSession(s);
    s = tickSession(s);
    s = tickSession(s);
    s = tickSession(s);
    assert.equal(s.stepIndex, 1);
    assert.equal(s.remainingSec, 2);
  });

  it('skips to next step', () => {
    let s = startSession(initSessionState(STEPS));
    s = skipStep(s);
    assert.equal(s.stepIndex, 1);
    assert.equal(s.remainingSec, 2);
  });

  it('completes after final step', () => {
    let s = startSession(initSessionState(STEPS));
    s = skipStep(s);
    s = skipStep(s);
    assert.equal(s.status, 'completed');
    const result = buildCompletionResult(s, { title: 'Test', sessionId: 't1' });
    assert.equal(result.totalSteps, 2);
    assert.equal(result.durationSec, totalSessionDurationSec(STEPS));
  });

  it('pause and resume preserve step', () => {
    let s = startSession(initSessionState(STEPS));
    s = tickSession(s);
    s = pauseSession(s);
    assert.equal(s.status, 'paused');
    s = resumeSession(s);
    assert.equal(s.status, 'playing');
    assert.equal(s.remainingSec, 2);
  });

  it('overall progress increases toward 100', () => {
    let s = startSession(initSessionState(STEPS));
    const startPct = overallProgress(s);
    s = skipStep(s);
    s = skipStep(s);
    assert.ok(overallProgress(s) > startPct);
    assert.equal(overallProgress(s), 100);
  });

  it('reset returns to idle', () => {
    let s = startSession(initSessionState(STEPS));
    s = skipStep(s);
    s = resetSession(STEPS);
    assert.equal(s.status, 'idle');
    assert.equal(s.stepIndex, 0);
  });
});
