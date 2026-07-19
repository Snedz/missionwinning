import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import { emailFromCheckoutSession, userIdFromCheckoutSession, verifyStripeSignature } from '@/lib/stripeWebhook';

function signPayload(payload: string, secret: string, timestamp?: number): string {
  const t = timestamp ?? Math.floor(Date.now() / 1000);
  const signed = `${t}.${payload}`;
  const v1 = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');
  return `t=${t},v1=${v1}`;
}

describe('stripeWebhook', () => {
  it('verifies valid stripe signature', () => {
    const secret = 'whsec_test_secret';
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const header = signPayload(payload, secret);
    assert.equal(verifyStripeSignature(payload, header, secret), true);
  });

  it('rejects tampered payload', () => {
    const secret = 'whsec_test_secret';
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const header = signPayload(payload, secret);
    assert.equal(verifyStripeSignature(payload + 'x', header, secret), false);
  });

  it('extracts email from checkout session', () => {
    assert.equal(
      emailFromCheckoutSession({
        id: 'cs_1',
        customer_details: { email: 'test@example.com' },
      }),
      'test@example.com'
    );
    assert.equal(
      emailFromCheckoutSession({ id: 'cs_2', customer_email: 'legacy@example.com' }),
      'legacy@example.com'
    );
    assert.equal(emailFromCheckoutSession({ id: 'cs_3' }), null);
  });

  it('extracts user_id from metadata or client_reference_id', () => {
    const meta = '11111111-1111-4111-8111-111111111111';
    const ref = '22222222-2222-4222-8222-222222222222';
    assert.equal(
      userIdFromCheckoutSession({
        id: 'cs_1',
        metadata: { user_id: meta },
        client_reference_id: ref,
      }),
      meta
    );
    assert.equal(
      userIdFromCheckoutSession({
        id: 'cs_2',
        client_reference_id: ref,
      }),
      ref
    );
    assert.equal(userIdFromCheckoutSession({ id: 'cs_3' }), null);
    assert.equal(
      userIdFromCheckoutSession({
        id: 'cs_4',
        metadata: { user_id: 'not-a-uuid' },
        client_reference_id: 'also-bad',
      }),
      null
    );
  });
});
