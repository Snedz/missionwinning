import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/stripe/create-checkout-session/route';

function postJson(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/stripe/create-checkout-session', () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRICE_ID_BUNDLE_12MO;
    delete process.env.STRIPE_PRICE_ID_SUPER_BUNDLE;
  });

  it('returns 503 when Stripe is not configured', async () => {
    const res = await POST(postJson({ planId: '12mo' }));
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.match(body.error, /not configured/i);
  });

  it('returns 400 for malformed JSON', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
    process.env.STRIPE_PRICE_ID_BUNDLE_12MO = 'price_test';
    const req = new NextRequest('http://localhost/api/stripe/create-checkout-session', {
      method: 'POST',
      body: '{bad',
    });
    const res = await POST(req);
    assert.equal(res.status, 400);
  });

  it('returns 400 when planId is missing or invalid', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
    process.env.STRIPE_PRICE_ID_BUNDLE_12MO = 'price_test';
    const res = await POST(postJson({ planId: 'monthly' }));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /planId required/i);
  });
});
