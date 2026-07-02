import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getStripePriceIdForPlan, isStripeCheckoutConfigured } from '@/lib/stripeCheckoutConfig';

describe('isStripeCheckoutConfigured', () => {
  it('is false without STRIPE_SECRET_KEY', () => {
    const prev = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    assert.equal(isStripeCheckoutConfigured(), false);
    if (prev) process.env.STRIPE_SECRET_KEY = prev;
  });
});

describe('getStripePriceIdForPlan', () => {
  it('returns plan-specific price when set', () => {
    process.env.STRIPE_PRICE_ID_BUNDLE_12MO = 'price_12mo_test';
    assert.equal(getStripePriceIdForPlan('12mo'), 'price_12mo_test');
    delete process.env.STRIPE_PRICE_ID_BUNDLE_12MO;
  });

  it('falls back to STRIPE_PRICE_ID_SUPER_BUNDLE', () => {
    delete process.env.STRIPE_PRICE_ID_BUNDLE_3MO;
    process.env.STRIPE_PRICE_ID_SUPER_BUNDLE = 'price_default';
    assert.equal(getStripePriceIdForPlan('3mo'), 'price_default');
    delete process.env.STRIPE_PRICE_ID_SUPER_BUNDLE;
  });
});
