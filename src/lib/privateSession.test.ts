import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import {
  getPrivateAccessPasswords,
  matchesPrivateAccessPassword,
  timingSafeSecretMatch,
  verifyPrivateAccessToken,
} from './privateSession.ts';

describe('timingSafeSecretMatch', () => {
  it('matches equal strings', () => {
    assert.equal(timingSafeSecretMatch('Done', 'Done'), true);
  });

  it('rejects unequal strings', () => {
    assert.equal(timingSafeSecretMatch('Done', 'Nope'), false);
    assert.equal(timingSafeSecretMatch('Done', 'Done!'), false);
  });
});

describe('getPrivateAccessPasswords', () => {
  it('includes primary and comma-separated extras', () => {
    assert.deepEqual(getPrivateAccessPasswords('primary', 'Done, other'), [
      'primary',
      'Done',
      'other',
    ]);
  });

  it('dedupes and drops empties', () => {
    assert.deepEqual(getPrivateAccessPasswords('Done', 'Done, ,Done'), ['Done']);
  });
});

describe('matchesPrivateAccessPassword', () => {
  it('accepts primary or extras', () => {
    assert.equal(matchesPrivateAccessPassword('primary', 'primary', 'Done'), true);
    assert.equal(matchesPrivateAccessPassword('Done', 'primary', 'Done'), true);
    assert.equal(matchesPrivateAccessPassword('wrong', 'primary', 'Done'), false);
  });
});

describe('verifyPrivateAccessToken', () => {
  const secret = 'test-gate-secret-32chars-min!!';

  it('rejects a stale (expired) cookie', () => {
    const exp = Math.floor(Date.now() / 1000) - 30;
    const payload = Buffer.from(JSON.stringify({ exp, v: 1 }), 'utf8').toString('base64url');
    const sig = createHmac('sha256', secret).update(payload).digest('base64url');
    assert.equal(verifyPrivateAccessToken(`${payload}.${sig}`, secret), false);
  });

  it('rejects a raw secret stored as the cookie value', () => {
    assert.equal(verifyPrivateAccessToken(secret, secret), false);
  });

  it('rejects a missing token or secret', () => {
    assert.equal(verifyPrivateAccessToken(undefined, secret), false);
    assert.equal(verifyPrivateAccessToken('x.y', undefined), false);
  });
});
