import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import {
  parseCheckoutSessionEnrollment,
  parseStripeWebhookPayload,
  verifyStripeSignature,
} from '@/lib/stripeWebhook';

function signPayload(payload: string, secret: string, timestamp?: number): string {
  const t = timestamp ?? Math.floor(Date.now() / 1000);
  const signed = `${t}.${payload}`;
  const v1 = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');
  return `t=${t},v1=${v1}`;
}

describe('verifyStripeSignature', () => {
  const secret = 'whsec_test_secret';
  const payload = '{"type":"checkout.session.completed"}';

  it('accepts a valid v1 signature within tolerance', () => {
    const header = signPayload(payload, secret);
    assert.equal(verifyStripeSignature(payload, header, secret), true);
  });

  it('rejects tampered payload', () => {
    const header = signPayload(payload, secret);
    assert.equal(verifyStripeSignature('{"type":"evil"}', header, secret), false);
  });

  it('rejects stale timestamps', () => {
    const old = Math.floor(Date.now() / 1000) - 600;
    const header = signPayload(payload, secret, old);
    assert.equal(verifyStripeSignature(payload, header, secret), false);
  });

  it('rejects missing header parts', () => {
    assert.equal(verifyStripeSignature(payload, 'v1=abc', secret), false);
    assert.equal(verifyStripeSignature(payload, '', secret), false);
  });
});

describe('parseStripeWebhookPayload', () => {
  it('parses valid JSON', () => {
    const event = parseStripeWebhookPayload('{"type":"ping"}');
    assert.equal(event?.type, 'ping');
  });

  it('returns null for invalid JSON', () => {
    assert.equal(parseStripeWebhookPayload('not-json'), null);
  });
});

describe('parseCheckoutSessionEnrollment', () => {
  it('extracts email and session id from customer_details', () => {
    const row = parseCheckoutSessionEnrollment({
      id: 'cs_test_1',
      customer_details: { email: 'buyer@example.com' },
      metadata: { product_id: 'super-bundle' },
    });
    assert.ok(row);
    assert.equal(row!.user_email, 'buyer@example.com');
    assert.equal(row!.external_id, 'cs_test_1');
    assert.equal(row!.product_id, 'super-bundle');
  });

  it('falls back to customer_email', () => {
    const row = parseCheckoutSessionEnrollment({
      id: 'cs_test_2',
      customer_email: 'legacy@example.com',
    });
    assert.ok(row);
    assert.equal(row!.user_email, 'legacy@example.com');
    assert.equal(row!.product_id, 'super-bundle');
  });

  it('returns null when email or id missing', () => {
    assert.equal(parseCheckoutSessionEnrollment({ id: 'cs_x' }), null);
    assert.equal(parseCheckoutSessionEnrollment({ customer_email: 'a@b.com' }), null);
  });
});
