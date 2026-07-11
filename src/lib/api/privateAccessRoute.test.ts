import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../../../app/api/private-access/route.ts';
import { PRIVATE_ACCESS_COOKIE } from '@/lib/privateSession';
import { makeNextRequest } from '@/lib/api/testRequest';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';

describe('private-access API route', () => {
  let envSnapshot: NodeJS.ProcessEnv;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
    setTestEnv('PRIVATE_ACCESS_SECRET', 'test-gate-secret-32chars-min!!');
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it('returns 500 when PRIVATE_ACCESS_SECRET unset', async () => {
    setTestEnv('PRIVATE_ACCESS_SECRET', undefined);
    const res = await POST(
      makeNextRequest('http://localhost/api/private-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'x' }),
      })
    );
    assert.equal(res.status, 500);
  });

  it('returns 401 for wrong password', async () => {
    const res = await POST(
      makeNextRequest('http://localhost/api/private-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.99' },
        body: JSON.stringify({ password: 'wrong' }),
      })
    );
    assert.equal(res.status, 401);
  });

  it('returns 200 and sets cookie for correct password', async () => {
    const res = await POST(
      makeNextRequest('http://localhost/api/private-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.100' },
        body: JSON.stringify({ password: 'test-gate-secret-32chars-min!!' }),
      })
    );
    assert.equal(res.status, 200);
    const setCookie = res.headers.get('set-cookie') ?? '';
    assert.ok(setCookie.includes(PRIVATE_ACCESS_COOKIE));
  });

  it('returns 200 for PRIVATE_ACCESS_CODES alias', async () => {
    setTestEnv('PRIVATE_ACCESS_CODES', 'Done');
    const res = await POST(
      makeNextRequest('http://localhost/api/private-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.102' },
        body: JSON.stringify({ password: 'Done' }),
      })
    );
    assert.equal(res.status, 200);
    const setCookie = res.headers.get('set-cookie') ?? '';
    assert.ok(setCookie.includes(PRIVATE_ACCESS_COOKIE));
  });

  it('returns 400 for invalid body', async () => {
    const res = await POST(
      makeNextRequest('http://localhost/api/private-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.101' },
        body: JSON.stringify({}),
      })
    );
    assert.equal(res.status, 400);
  });
});
