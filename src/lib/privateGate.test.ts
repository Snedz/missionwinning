import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPublicApiPathWhileGated,
  isPublicPathWhileGated,
} from './privateGate';

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
    assert.equal(isPublicPathWhileGated('/beta'), false);
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
    assert.equal(isPublicApiPathWhileGated('/api/leads'), false);
    assert.equal(isPublicApiPathWhileGated('/api/beta/metrics'), false);
  });
});
