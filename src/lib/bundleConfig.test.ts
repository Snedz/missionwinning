import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BUNDLE_PLANS,
  bundleSavingsPercent,
  standaloneTotalMonthly,
} from '@/lib/bundleConfig';

describe('bundleConfig', () => {
  it('defines STRATEGY pricing: monthly / 12mo founders / lifetime', () => {
    assert.equal(BUNDLE_PLANS.monthly.price, '11.99');
    assert.equal(BUNDLE_PLANS['12mo'].price, '59');
    assert.equal(BUNDLE_PLANS['12mo'].badge, 'popular');
    assert.equal(BUNDLE_PLANS.lifetime.price, '149');
    assert.equal(BUNDLE_PLANS.lifetime.isSubscription, false);
    assert.ok(parseFloat(BUNDLE_PLANS['12mo'].strikePrice) > parseFloat(BUNDLE_PLANS['12mo'].price));
  });

  it('computes bundle savings vs standalone pillars', () => {
    const standalone = standaloneTotalMonthly();
    assert.equal(standalone, 61);
    const savings = bundleSavingsPercent();
    assert.ok(savings > 0 && savings < 100);
  });
});
