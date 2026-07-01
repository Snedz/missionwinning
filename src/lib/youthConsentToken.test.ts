import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createConsentVerifyToken, verifyConsentToken, generateConsentCode, verifyConsentCode } from '@/lib/youthConsentToken';

describe('youthConsentToken', () => {
  it('creates and verifies tokens', () => {
    const token = createConsentVerifyToken('parent@example.com', 10);
    const payload = verifyConsentToken(token);
    assert.ok(payload);
    assert.equal(payload?.email, 'parent@example.com');
    assert.equal(payload?.age, 10);
  });

  it('rejects tampered tokens', () => {
    const token = createConsentVerifyToken('parent@example.com', 10);
    assert.equal(verifyConsentToken(token + 'x'), null);
  });

  it('creates tokens with optional athlete uid', () => {
    const token = createConsentVerifyToken('parent@example.com', 10, undefined, 'user-abc');
    const payload = verifyConsentToken(token);
    assert.equal(payload?.uid, 'user-abc');
  });

  it('generates stable six-digit codes', () => {
    const code = generateConsentCode('parent@example.com', 10);
    assert.match(code, /^\d{6}$/);
    assert.equal(verifyConsentCode('parent@example.com', 10, code), true);
  });
});
