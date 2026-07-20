import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  holdProgress,
  holdComplete,
  reduceKeyboardArm,
  createKeyboardArmState,
  DEFAULT_HOLD_MS,
  KEYBOARD_ARM_MS,
} from './holdToConfirm.ts';

describe('holdToConfirm', () => {
  it('progress is 0 at start and 1 at holdMs', () => {
    assert.equal(holdProgress(0), 0);
    assert.equal(holdProgress(DEFAULT_HOLD_MS / 2), 0.5);
    assert.equal(holdProgress(DEFAULT_HOLD_MS), 1);
    assert.equal(holdProgress(DEFAULT_HOLD_MS + 50), 1);
  });

  it('holdComplete only after full duration', () => {
    assert.equal(holdComplete(299), false);
    assert.equal(holdComplete(300), true);
  });

  it('keyboard arm requires two activations within window', () => {
    let state = createKeyboardArmState();
    let r = reduceKeyboardArm(state, 1000);
    assert.equal(r.confirmed, false);
    assert.equal(r.next.armed, true);
    state = r.next;
    r = reduceKeyboardArm(state, 1000 + KEYBOARD_ARM_MS - 1);
    assert.equal(r.confirmed, true);
  });

  it('keyboard arm resets after window expires', () => {
    let state = createKeyboardArmState();
    state = reduceKeyboardArm(state, 1000).next;
    const r = reduceKeyboardArm(state, 1000 + KEYBOARD_ARM_MS + 1);
    assert.equal(r.confirmed, false);
    assert.equal(r.next.armed, true);
  });
});
