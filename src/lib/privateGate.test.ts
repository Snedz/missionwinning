import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPublicApiPathWhileGated,
  isPublicPathWhileGated,
} from './privateGate.ts';

describe('isPublicPathWhileGated', () => {
  it('allows the gate page and legal footer routes', () => {
    assert.equal(isPublicPathWhileGated('/private'), true);
    assert.equal(isPublicPathWhileGated('/privacy'), true);
    assert.equal(isPublicPathWhileGated('/terms'), true);
    assert.equal(isPublicPathWhileGated('/about'), true);
    assert.equal(isPublicPathWhileGated('/america'), true);
    assert.equal(isPublicPathWhileGated('/auth/callback'), true);
  });

  it('blocks app routes including welcome and beta', () => {
    assert.equal(isPublicPathWhileGated('/'), false);
    assert.equal(isPublicPathWhileGated('/welcome'), false);
    assert.equal(isPublicPathWhileGated('/beta'), true);
    assert.equal(isPublicPathWhileGated('/feedback'), true);
    assert.equal(isPublicPathWhileGated('/today'), false);
    assert.equal(isPublicPathWhileGated('/log'), false);
  });
});

describe('isPublicApiPathWhileGated', () => {
  it('allows only gate and webhook endpoints', () => {
    assert.equal(isPublicApiPathWhileGated('/api/private-access'), true);
    assert.equal(isPublicApiPathWhileGated('/api/stripe-webhook'), true);
    assert.equal(isPublicApiPathWhileGated('/api/paypal-webhook'), true);
  });

  it('blocks app APIs until the gate cookie is set', () => {
    assert.equal(isPublicApiPathWhileGated('/api/premium/recipes'), false);
    assert.equal(isPublicApiPathWhileGated('/api/beta/metrics'), false);
    assert.equal(isPublicApiPathWhileGated('/api/coach/daily-insight'), false);
  });

  it('allows self-authenticating public routes while gated', () => {
    // /api/leads powers the public waitlist on /private (rate-limited, validated);
    // cron + unsubscribe carry their own auth (CRON_SECRET bearer / HMAC token).
    assert.equal(isPublicApiPathWhileGated('/api/leads'), true);
    assert.equal(isPublicApiPathWhileGated('/api/cron/nudges'), true);
    assert.equal(isPublicApiPathWhileGated('/api/cron/weekly-digest'), true);
    assert.equal(isPublicApiPathWhileGated('/api/nudges/unsubscribe'), true);
    // Anonymous premium status probe (premium:false) — no auth required
    assert.equal(isPublicApiPathWhileGated('/api/premium/status'), true);
  });
});
