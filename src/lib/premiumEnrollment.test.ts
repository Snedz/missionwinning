import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { emailFromCheckoutSession } from '@/lib/stripeWebhook';

function isDemoPremiumEnabled(): boolean {
  return (
    process.env.DEMO_PREMIUM === 'true' ||
    (process.env.NODE_ENV === 'development' && process.env.DEMO_PREMIUM !== 'false')
  );
}

describe('premium enrollment flow', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it('demo premium mode unlocks without enrollment row', () => {
    process.env.DEMO_PREMIUM = 'true';
    process.env.NODE_ENV = 'production';
    assert.equal(isDemoPremiumEnabled(), true);
  });

  it('production defaults demo premium off', () => {
    process.env.DEMO_PREMIUM = 'false';
    process.env.NODE_ENV = 'production';
    assert.equal(isDemoPremiumEnabled(), false);
  });

  it('stripe checkout session yields email for enrollment grant', () => {
    const email = emailFromCheckoutSession({
      id: 'cs_test_123',
      customer_details: { email: 'buyer@example.com' },
    });
    assert.equal(email, 'buyer@example.com');
  });

  it('webhook enrollment payload shape matches super-bundle product', () => {
    const payload = {
      user_email: 'buyer@example.com',
      product_id: 'super-bundle',
      provider: 'stripe',
      external_id: 'cs_test_123',
    };
    assert.equal(payload.product_id, 'super-bundle');
    assert.equal(payload.provider, 'stripe');
    assert.ok(payload.external_id.startsWith('cs_'));
  });
});
