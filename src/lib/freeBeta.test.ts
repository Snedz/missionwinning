import assert from 'node:assert/strict';
import { describe, it, afterEach } from 'node:test';
import { isFreeBeta, isFreeBetaPremiumUnlocked } from './freeBeta';

describe('isFreeBeta', () => {
  const prev = process.env.NEXT_PUBLIC_FREE_BETA;

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_FREE_BETA;
    else process.env.NEXT_PUBLIC_FREE_BETA = prev;
  });

  it('defaults to true when unset', () => {
    delete process.env.NEXT_PUBLIC_FREE_BETA;
    assert.equal(isFreeBeta(), true);
    assert.equal(isFreeBetaPremiumUnlocked(), true);
  });

  it('respects explicit off', () => {
    process.env.NEXT_PUBLIC_FREE_BETA = 'false';
    assert.equal(isFreeBeta(), false);
    assert.equal(isFreeBetaPremiumUnlocked(), false);
    process.env.NEXT_PUBLIC_FREE_BETA = '0';
    assert.equal(isFreeBeta(), false);
  });

  it('respects explicit on', () => {
    process.env.NEXT_PUBLIC_FREE_BETA = '1';
    assert.equal(isFreeBeta(), true);
  });
});
