/**
 * Security-oriented pure checks for crypto confirm (no server-only / chain / DB).
 * Ownership is enforced via getIntentForUser(intentId, userId) in confirm.ts.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPlausibleTxSignature } from '@/lib/cryptoCheckout/confirmGuards';

describe('crypto confirm signature guards', () => {
  it('rejects empty or short signatures', () => {
    assert.equal(isPlausibleTxSignature(''), false);
    assert.equal(isPlausibleTxSignature('   '), false);
    assert.equal(isPlausibleTxSignature('short'), false);
  });

  it('accepts long base58-like signatures', () => {
    assert.equal(isPlausibleTxSignature('x'.repeat(64)), true);
    assert.equal(isPlausibleTxSignature(`  ${'y'.repeat(88)}  `), true);
  });
});
