import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyMissFlash, IDLE_PULSE } from './missFlashPulse.ts';
import type { MissFlashSource, MissFlashPulse } from './missFlashPulse.ts';

test('idle + fail → active with source and clearAtMs = now + timeout', () => {
  const now = 1000;
  const timeout = 5000;
  const result = applyMissFlash(IDLE_PULSE, {
    type: 'fail',
    source: 'save-fail',
    nowMs: now,
    timeoutMs: timeout,
  });
  assert.equal(result.active, true);
  assert.equal(result.source, 'save-fail');
  assert.equal(result.observedAtMs, now);
  assert.equal(result.clearAtMs, now + timeout);
});

test('fail with timeoutMs 0 leaves state unchanged', () => {
  const result = applyMissFlash(IDLE_PULSE, {
    type: 'fail',
    source: 'save-fail',
    nowMs: 1000,
    timeoutMs: 0,
  });
  assert.deepEqual(result, IDLE_PULSE);
});

test('fail with negative timeoutMs leaves state unchanged', () => {
  const result = applyMissFlash(IDLE_PULSE, {
    type: 'fail',
    source: 'save-fail',
    nowMs: 1000,
    timeoutMs: -100,
  });
  assert.deepEqual(result, IDLE_PULSE);
});

test('fail with non-finite nowMs leaves state unchanged', () => {
  const result = applyMissFlash(IDLE_PULSE, {
    type: 'fail',
    source: 'save-fail',
    nowMs: NaN,
    timeoutMs: 5000,
  });
  assert.deepEqual(result, IDLE_PULSE);
});

test('active + ack → idle', () => {
  const activeState: MissFlashPulse = {
    active: true,
    source: 'offline-save',
    observedAtMs: 1000,
    clearAtMs: 6000,
  };
  const result = applyMissFlash(activeState, { type: 'ack', nowMs: 2000 });
  assert.deepEqual(result, IDLE_PULSE);
});

test('ack on idle is a no-op', () => {
  const result = applyMissFlash(IDLE_PULSE, { type: 'ack', nowMs: 1000 });
  assert.deepEqual(result, IDLE_PULSE);
});

test('tick before clearAtMs leaves active', () => {
  const activeState: MissFlashPulse = {
    active: true,
    source: 'ci-red',
    observedAtMs: 1000,
    clearAtMs: 6000,
  };
  const result = applyMissFlash(activeState, { type: 'tick', nowMs: 3000 });
  assert.deepEqual(result, activeState);
});

test('tick at clearAtMs → idle', () => {
  const activeState: MissFlashPulse = {
    active: true,
    source: 'ci-red',
    observedAtMs: 1000,
    clearAtMs: 6000,
  };
  const result = applyMissFlash(activeState, { type: 'tick', nowMs: 6000 });
  assert.deepEqual(result, IDLE_PULSE);
});

test('tick after clearAtMs → idle', () => {
  const activeState: MissFlashPulse = {
    active: true,
    source: 'ci-red',
    observedAtMs: 1000,
    clearAtMs: 6000,
  };
  const result = applyMissFlash(activeState, { type: 'tick', nowMs: 7000 });
  assert.deepEqual(result, IDLE_PULSE);
});

test('second fail replaces source/times', () => {
  const firstFail: MissFlashPulse = {
    active: true,
    source: 'save-fail',
    observedAtMs: 1000,
    clearAtMs: 6000,
  };
  const result = applyMissFlash(firstFail, {
    type: 'fail',
    source: 'offline-save',
    nowMs: 2000,
    timeoutMs: 3000,
  });
  assert.equal(result.active, true);
  assert.equal(result.source, 'offline-save');
  assert.equal(result.observedAtMs, 2000);
  assert.equal(result.clearAtMs, 2000 + 3000);
});

test('reset from active → idle', () => {
  const activeState: MissFlashPulse = {
    active: true,
    source: 'ci-red',
    observedAtMs: 1000,
    clearAtMs: 6000,
  };
  const result = applyMissFlash(activeState, { type: 'reset' });
  assert.deepEqual(result, IDLE_PULSE);
});

test('reset from idle → idle', () => {
  const result = applyMissFlash(IDLE_PULSE, { type: 'reset' });
  assert.deepEqual(result, IDLE_PULSE);
});

test('all source variants are accepted', () => {
  const sources: MissFlashSource[] = ['save-fail', 'offline-save', 'ci-red'];
  for (const source of sources) {
    const result = applyMissFlash(IDLE_PULSE, {
      type: 'fail',
      source,
      nowMs: 1000,
      timeoutMs: 5000,
    });
    assert.equal(result.source, source);
  }
});
