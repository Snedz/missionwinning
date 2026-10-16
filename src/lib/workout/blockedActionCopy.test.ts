import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  blockedActionCopy,
  claimsSuccess,
  isHonestBlockedCopy,
  type BlockedAction,
  type BlockedState,
} from './blockedActionCopy';

describe('blockedActionCopy', () => {
  it('offline-save queued → title "Not synced yet", state queued', () => {
    const result = blockedActionCopy('offline-save', 'queued');
    assert.strictEqual(result.title, 'Not synced yet');
    assert.strictEqual(result.state, 'queued');
  });

  it('offline-save blocked → title "Couldn\'t store this set"', () => {
    const result = blockedActionCopy('offline-save', 'blocked');
    assert.strictEqual(result.title, "Couldn't store this set");
  });

  it('duplicate-tap stub → still "Already logged once"', () => {
    const result = blockedActionCopy('duplicate-tap', 'stub');
    assert.strictEqual(result.title, 'Already logged once');
  });

  it('truncated-review queued → "Review incomplete"', () => {
    const result = blockedActionCopy('truncated-review', 'queued');
    assert.strictEqual(result.title, 'Review incomplete');
  });

  it('unknown + stub → "Not available yet"', () => {
    const result = blockedActionCopy('unknown', 'stub');
    assert.strictEqual(result.title, 'Not available yet');
  });

  it('unknown + blocked → "Action held"', () => {
    const result = blockedActionCopy('unknown', 'blocked');
    assert.strictEqual(result.title, 'Action held');
  });

  it('every action×state combo passes isHonestBlockedCopy', () => {
    const actions: BlockedAction[] = ['offline-save', 'duplicate-tap', 'truncated-review', 'unknown'];
    const states: BlockedState[] = ['stub', 'blocked', 'queued'];

    for (const action of actions) {
      for (const state of states) {
        const copy = blockedActionCopy(action, state);
        const honest = isHonestBlockedCopy(copy);
        assert.strictEqual(honest, true, `Failed for ${action} + ${state}`);
      }
    }
  });

  it('claimsSuccess("Saved!") true', () => {
    assert.strictEqual(claimsSuccess('Saved!'), true);
  });

  it('claimsSuccess("Held for review") false', () => {
    assert.strictEqual(claimsSuccess('Held for review'), false);
  });
});
