import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PLAY_PRODUCT_ALLOWLIST } from './playBillingProducts';

describe('playBilling allowlist', () => {
  it('includes Super Bundle SKUs', () => {
    assert.equal(PLAY_PRODUCT_ALLOWLIST.has('super_bundle_monthly'), true);
    assert.equal(PLAY_PRODUCT_ALLOWLIST.has('super_bundle_yearly'), true);
    assert.equal(PLAY_PRODUCT_ALLOWLIST.has('unknown_sku'), false);
  });
});
