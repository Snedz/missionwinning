import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPayPalCertUrl, parsePayPalWebhookHeaders } from '@/lib/paypalWebhookParse';

describe('isPayPalCertUrl', () => {
  it('accepts PayPal HTTPS cert URLs', () => {
    assert.equal(isPayPalCertUrl('https://api.paypal.com/v1/notifications/certs/CERT-123'), true);
    assert.equal(isPayPalCertUrl('https://api.sandbox.paypal.com/v1/notifications/certs/X'), true);
  });

  it('rejects non-PayPal or insecure URLs', () => {
    assert.equal(isPayPalCertUrl('http://api.paypal.com/cert'), false);
    assert.equal(isPayPalCertUrl('https://evil.example.com/paypal.com/cert'), false);
    assert.equal(isPayPalCertUrl('not-a-url'), false);
  });
});

describe('parsePayPalWebhookHeaders', () => {
  it('returns null when headers are missing', () => {
    const req = new Request('https://example.com/api/paypal-webhook', { method: 'POST' });
    assert.equal(parsePayPalWebhookHeaders(req), null);
  });

  it('parses valid PayPal transmission headers', () => {
    const req = new Request('https://example.com/api/paypal-webhook', {
      method: 'POST',
      headers: {
        'paypal-transmission-id': 'tid-1',
        'paypal-transmission-time': '2026-01-01T00:00:00Z',
        'paypal-transmission-sig': 'sig',
        'paypal-cert-url': 'https://api.paypal.com/v1/notifications/certs/CERT-1',
        'paypal-auth-algo': 'SHA256withRSA',
      },
    });
    const parsed = parsePayPalWebhookHeaders(req);
    assert.ok(parsed);
    assert.equal(parsed!.transmissionId, 'tid-1');
  });

  it('rejects invalid cert URL even when other headers present', () => {
    const req = new Request('https://example.com/api/paypal-webhook', {
      method: 'POST',
      headers: {
        'paypal-transmission-id': 'tid-1',
        'paypal-transmission-time': '2026-01-01T00:00:00Z',
        'paypal-transmission-sig': 'sig',
        'paypal-cert-url': 'https://attacker.example/cert',
        'paypal-auth-algo': 'SHA256withRSA',
      },
    });
    assert.equal(parsePayPalWebhookHeaders(req), null);
  });
});
