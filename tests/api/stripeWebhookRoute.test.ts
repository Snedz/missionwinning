import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/stripe-webhook/route';

const SECRET = 'whsec_route_test';

function signatureHeader(payload: string, secret = SECRET, timestampSec = Date.now() / 1000): string {
  const sig = createHmac('sha256', secret).update(`${timestampSec}.${payload}`, 'utf8').digest('hex');
  return `t=${timestampSec},v1=${sig}`;
}

function webhookRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/stripe-webhook', {
    method: 'POST',
    body,
    headers,
  });
}

describe('POST /api/stripe-webhook', () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it('returns 503 when the webhook secret is not configured', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const res = await POST(webhookRequest('{}'));
    assert.equal(res.status, 503);
  });

  it('returns 401 when the stripe-signature header is missing', async () => {
    const res = await POST(webhookRequest('{}'));
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /signature/i);
  });

  it('returns 401 for an invalid signature', async () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const res = await POST(
      webhookRequest(payload, { 'stripe-signature': signatureHeader(payload, 'whsec_wrong') })
    );
    assert.equal(res.status, 401);
  });

  it('returns 401 for a valid signature with a stale timestamp (replay)', async () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const stale = Date.now() / 1000 - 3600;
    const res = await POST(
      webhookRequest(payload, { 'stripe-signature': signatureHeader(payload, SECRET, stale) })
    );
    assert.equal(res.status, 401);
  });

  it('returns 400 for a validly-signed but malformed JSON body', async () => {
    const payload = 'not-json{';
    const res = await POST(
      webhookRequest(payload, { 'stripe-signature': signatureHeader(payload) })
    );
    assert.equal(res.status, 400);
  });

  it('acknowledges validly-signed events of irrelevant types without granting', async () => {
    const payload = JSON.stringify({ type: 'invoice.paid', data: { object: {} } });
    const res = await POST(
      webhookRequest(payload, { 'stripe-signature': signatureHeader(payload) })
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.received, true);
  });

  it('acknowledges checkout.session.completed lacking email/session id without granting', async () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: {} } });
    const res = await POST(
      webhookRequest(payload, { 'stripe-signature': signatureHeader(payload) })
    );
    assert.equal(res.status, 200);
  });

  it('returns 500 when a complete event cannot be persisted (no Supabase admin)', async () => {
    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_1', customer_details: { email: 'buyer@example.com' } } },
    });
    const res = await POST(
      webhookRequest(payload, { 'stripe-signature': signatureHeader(payload) })
    );
    assert.equal(res.status, 500);
  });
});
