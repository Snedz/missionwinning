import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INTENT_TTL_MS } from '@/lib/cryptoCheckout/constants';
import { isIntentExpired } from '@/lib/cryptoCheckout/intentExpiry';

describe('isIntentExpired', () => {
  it('marks past expires_at as expired', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    assert.equal(isIntentExpired(past), true);
  });

  it('keeps future expires_at pending', () => {
    const future = new Date(Date.now() + INTENT_TTL_MS).toISOString();
    assert.equal(isIntentExpired(future), false);
  });
});
