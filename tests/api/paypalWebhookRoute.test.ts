import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/paypal-webhook/route';

const VALID_HEADERS = {
  'paypal-transmission-id': 'tx-1',
  'paypal-transmission-time': '2026-07-02T00:00:00Z',
  'paypal-transmission-sig': 'sig',
  'paypal-cert-url': 'https://api.paypal.com/cert.pem',
  'paypal-auth-algo': 'SHA256withRSA',
};

function webhookRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/paypal-webhook', {
    method: 'POST',
    body,
    headers,
  });
}

describe('POST /api/paypal-webhook', () => {
  beforeEach(() => {
    delete process.env.PAYPAL_WEBHOOK_ID;
    delete process.env.PAYPAL_CLIENT_ID;
    delete process.env.PAYPAL_CLIENT_SECRET;
  });

  it('returns 503 when PAYPAL_WEBHOOK_ID is not configured', async () => {
    const res = await POST(webhookRequest('{}', VALID_HEADERS));
    assert.equal(res.status, 503);
  });

  it('returns 503 when API credentials are missing', async () => {
    process.env.PAYPAL_WEBHOOK_ID = 'wh-1';
    const res = await POST(webhookRequest('{}', VALID_HEADERS));
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.match(body.error, /credentials/i);
  });

  it('returns 401 when transmission headers are missing', async () => {
    process.env.PAYPAL_WEBHOOK_ID = 'wh-1';
    process.env.PAYPAL_CLIENT_ID = 'client';
    process.env.PAYPAL_CLIENT_SECRET = 'secret';
    const res = await POST(webhookRequest('{}'));
    assert.equal(res.status, 401);
  });

  it('returns 401 when the cert URL is not on PayPal infrastructure (SSRF guard)', async () => {
    process.env.PAYPAL_WEBHOOK_ID = 'wh-1';
    process.env.PAYPAL_CLIENT_ID = 'client';
    process.env.PAYPAL_CLIENT_SECRET = 'secret';
    const res = await POST(
      webhookRequest('{}', {
        ...VALID_HEADERS,
        'paypal-cert-url': 'https://evil.example.com/cert.pem',
      })
    );
    assert.equal(res.status, 401);
  });

  it('returns 400 for malformed JSON once headers pass parsing', async () => {
    process.env.PAYPAL_WEBHOOK_ID = 'wh-1';
    process.env.PAYPAL_CLIENT_ID = 'client';
    process.env.PAYPAL_CLIENT_SECRET = 'secret';
    const res = await POST(webhookRequest('not-json{', VALID_HEADERS));
    assert.equal(res.status, 400);
  });
});
