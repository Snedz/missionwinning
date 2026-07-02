import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import {
  verifyStripeSignature,
  STRIPE_SIGNATURE_TOLERANCE_SECONDS,
} from './stripeWebhookVerify';

const SECRET = 'whsec_test_secret';
const PAYLOAD = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_1' } } });

function sign(payload: string, secret: string, timestampSec: number): string {
  return createHmac('sha256', secret).update(`${timestampSec}.${payload}`, 'utf8').digest('hex');
}

function headerFor(payload: string, secret: string, timestampSec: number): string {
  return `t=${timestampSec},v1=${sign(payload, secret, timestampSec)}`;
}

describe('verifyStripeSignature', () => {
  const nowMs = 1_750_000_000_000;
  const nowSec = nowMs / 1000;

  it('accepts a valid, fresh signature', () => {
    const header = headerFor(PAYLOAD, SECRET, nowSec);
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, nowMs), true);
  });

  it('rejects a tampered payload', () => {
    const header = headerFor(PAYLOAD, SECRET, nowSec);
    const tampered = PAYLOAD.replace('cs_1', 'cs_evil');
    assert.equal(verifyStripeSignature(tampered, header, SECRET, nowMs), false);
  });

  it('rejects a signature made with the wrong secret', () => {
    const header = headerFor(PAYLOAD, 'whsec_other', nowSec);
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, nowMs), false);
  });

  it('rejects a replayed (stale) timestamp beyond tolerance', () => {
    const staleSec = nowSec - STRIPE_SIGNATURE_TOLERANCE_SECONDS - 1;
    const header = headerFor(PAYLOAD, SECRET, staleSec);
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, nowMs), false);
  });

  it('accepts a timestamp exactly at the tolerance boundary', () => {
    const boundarySec = nowSec - STRIPE_SIGNATURE_TOLERANCE_SECONDS;
    const header = headerFor(PAYLOAD, SECRET, boundarySec);
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, nowMs), true);
  });

  it('rejects future-dated timestamps beyond tolerance', () => {
    const futureSec = nowSec + STRIPE_SIGNATURE_TOLERANCE_SECONDS + 10;
    const header = headerFor(PAYLOAD, SECRET, futureSec);
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, nowMs), false);
  });

  it('rejects a header missing the timestamp', () => {
    const header = `v1=${sign(PAYLOAD, SECRET, nowSec)}`;
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, nowMs), false);
  });

  it('rejects a header missing any v1 signature', () => {
    assert.equal(verifyStripeSignature(PAYLOAD, `t=${nowSec}`, SECRET, nowMs), false);
  });

  it('rejects empty and garbage headers', () => {
    assert.equal(verifyStripeSignature(PAYLOAD, '', SECRET, nowMs), false);
    assert.equal(verifyStripeSignature(PAYLOAD, 'not-a-header', SECRET, nowMs), false);
    assert.equal(verifyStripeSignature(PAYLOAD, 't=abc,v1=zzzz', SECRET, nowMs), false);
  });

  it('rejects a v1 signature of the wrong length (no timingSafeEqual throw)', () => {
    const header = `t=${nowSec},v1=deadbeef`;
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, nowMs), false);
  });

  it('accepts when a valid signature appears among invalid ones (key rotation)', () => {
    const good = sign(PAYLOAD, SECRET, nowSec);
    const bad = sign(PAYLOAD, 'whsec_rotated_out', nowSec);
    const header = `t=${nowSec},v1=${bad},v1=${good}`;
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, nowMs), true);
  });
});
