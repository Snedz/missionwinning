import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST as createClass } from '../../app/api/school/class/route';
import { GET as verifyPin } from '../../app/api/school/class/[code]/verify/route';
import { GET as classAccess } from '../../app/api/school/class/[code]/access/route';

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

const classParams = (code: string) => ({ params: Promise.resolve({ code }) });

describe('POST /api/school/class', () => {
  beforeEach(() => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it('returns 400 for invalid class code', async () => {
    const res = await createClass(postJson('/api/school/class', { code: '!!!', name: 'PE' }));
    assert.equal(res.status, 400);
  });

  it('returns 401 when creating a class without sign-in', async () => {
    const res = await createClass(
      postJson('/api/school/class', { code: 'ABC123', name: 'Period 1 PE' })
    );
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.registered, false);
    assert.equal(body.reason, 'sign_in_required');
  });
});

describe('GET /api/school/class/[code]/verify', () => {
  it('returns 400 for invalid class code', async () => {
    const res = await verifyPin(getUrl('/api/school/class/!!!/verify?pin=1234'), classParams('!!!'));
    assert.equal(res.status, 400);
  });

  it('returns 400 when PIN is missing', async () => {
    const res = await verifyPin(getUrl('/api/school/class/ABC123/verify'), classParams('ABC123'));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /PIN required/i);
  });

  it('returns ok:false when Supabase admin is not configured', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await verifyPin(
      getUrl('/api/school/class/ABC123/verify?pin=5678'),
      classParams('ABC123')
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, false);
  });
});

describe('GET /api/school/class/[code]/access', () => {
  it('returns 400 for invalid class code', async () => {
    const res = await classAccess(getUrl('/api/school/class/!!!/access'), classParams('!!!'));
    assert.equal(res.status, 400);
  });

  it('returns locked when anonymous and no valid PIN', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await classAccess(getUrl('/api/school/class/ABC123/access'), classParams('ABC123'));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.unlocked, false);
    assert.equal(body.pinRequired, true);
  });
});
