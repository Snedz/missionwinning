import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import { validateStripeWebhookRequest } from '@/lib/api/stripeWebhookAuth';

function signPayload(payload: string, secret: string): string {
  const t = Math.floor(Date.now() / 1000);
  const signed = `${t}.${payload}`;
  const v1 = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');
  return `t=${t},v1=${v1}`;
}

describe('validateStripeWebhookRequest', () => {
  it('returns 503 when secret missing', () => {
    const r = validateStripeWebhookRequest(undefined, 't=1,v1=x', '{}');
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 503);
  });

  it('returns 401 when signature header missing', () => {
    const r = validateStripeWebhookRequest('whsec_test', null, '{}');
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 401);
  });

  it('returns 401 for invalid signature', () => {
    const r = validateStripeWebhookRequest('whsec_test', 't=1,v1=bad', '{}');
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 401);
  });

  it('returns 400 for invalid JSON', () => {
    const secret = 'whsec_test';
    const body = 'not-json';
    const r = validateStripeWebhookRequest(secret, signPayload(body, secret), body);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 400);
  });

  it('passes valid signed JSON', () => {
    const secret = 'whsec_test';
    const body = JSON.stringify({ type: 'checkout.session.completed' });
    const r = validateStripeWebhookRequest(secret, signPayload(body, secret), body);
    assert.equal(r.ok, true);
  });
});
