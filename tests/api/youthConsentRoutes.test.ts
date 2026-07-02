import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST as consentVerify } from '../../app/api/youth/consent-verify/route';
import { POST as consentNotify } from '../../app/api/youth/consent-notify/route';
import { GET as consentStatus } from '../../app/api/youth/consent-status/route';
import { GET as consentConfirm } from '../../app/api/youth/consent-confirm/route';
import {
  createConsentVerifyToken,
  generateConsentCode,
} from '../../src/lib/youthConsentToken';

function postJson(path: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function getUrl(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`);
}

describe('POST /api/youth/consent-verify', () => {
  beforeEach(() => {
    process.env.YOUTH_CONSENT_SECRET = 'test-youth-secret';
  });

  it('returns 400 for malformed JSON', async () => {
    const req = new NextRequest('http://localhost/api/youth/consent-verify', {
      method: 'POST',
      body: 'not-json',
    });
    const res = await consentVerify(req);
    assert.equal(res.status, 400);
  });

  it('returns 400 when child is at or above COPPA threshold', async () => {
    const res = await consentVerify(
      postJson('/api/youth/consent-verify', {
        parentEmail: 'parent@example.com',
        childAge: 13,
        code: '123456',
      })
    );
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.ok, false);
  });

  it('returns 403 for an incorrect verification code', async () => {
    const res = await consentVerify(
      postJson('/api/youth/consent-verify', {
        parentEmail: 'parent@example.com',
        childAge: 10,
        code: '000000',
      })
    );
    assert.equal(res.status, 403);
  });

  it('accepts a valid code for anonymous athletes (local-only verify)', async () => {
    const code = generateConsentCode('parent@example.com', 10);
    const res = await consentVerify(
      postJson('/api/youth/consent-verify', {
        parentEmail: 'parent@example.com',
        childAge: 10,
        code,
      })
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.persisted, false);
  });
});

describe('POST /api/youth/consent-notify', () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it('returns 503 when email is not configured', async () => {
    const res = await consentNotify(
      postJson('/api/youth/consent-notify', {
        parentEmail: 'parent@example.com',
        childAge: 10,
      })
    );
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.match(body.error, /not configured/i);
  });

  it('returns 400 for invalid consent payload', async () => {
    process.env.RESEND_API_KEY = 're_test_fake';
    const res = await consentNotify(
      postJson('/api/youth/consent-notify', {
        parentEmail: 'not-an-email',
        childAge: 10,
      })
    );
    assert.equal(res.status, 400);
  });
});

describe('GET /api/youth/consent-status', () => {
  it('returns 401 when the athlete is not signed in', async () => {
    const res = await consentStatus(getUrl('/api/youth/consent-status'));
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.verified, false);
    assert.equal(body.error, 'not_signed_in');
  });
});

describe('GET /api/youth/consent-confirm', () => {
  beforeEach(() => {
    process.env.YOUTH_CONSENT_SECRET = 'test-youth-secret';
  });

  it('returns 400 when token query param is missing', async () => {
    const res = await consentConfirm(getUrl('/api/youth/consent-confirm'));
    assert.equal(res.status, 400);
  });

  it('returns 400 for an invalid or tampered token', async () => {
    const res = await consentConfirm(getUrl('/api/youth/consent-confirm?token=bad.token'));
    assert.equal(res.status, 400);
  });

  it('confirms a valid token without persisting when no athlete uid is embedded', async () => {
    const token = createConsentVerifyToken('parent@example.com', 10);
    const res = await consentConfirm(
      getUrl(`/api/youth/consent-confirm?token=${encodeURIComponent(token)}`)
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.email, 'parent@example.com');
    assert.equal(body.age, 10);
    assert.equal(body.persisted, false);
  });
});
