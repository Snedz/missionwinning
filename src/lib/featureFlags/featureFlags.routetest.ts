/**
 * Flags API contracts. 403 without admin. 503 vs empty. PATCH cannot mint.
 * GET /api/flags never returns an allowlist.
 */
import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GET as flagsGet } from '../../../app/api/flags/route.ts';
import { GET as adminGet, PATCH as adminPatch } from '../../../app/api/flags/admin/route.ts';
import { GET as previewGet } from '../../../app/api/flags/admin/preview/route.ts';
import { makeNextRequest } from '@/lib/api/testRequest';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';

const SECRET = 'flags-test-secret';

function adminHeaders(): HeadersInit {
  return { 'x-beta-admin-secret': SECRET, 'Content-Type': 'application/json' };
}

describe('flags routes', () => {
  let envSnapshot: NodeJS.ProcessEnv;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
    setTestEnv('BETA_ADMIN_SECRET', SECRET);
    setTestEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);
    setTestEnv('NEXT_PUBLIC_SUPABASE_URL', undefined);
    setTestEnv('SUPABASE_URL', undefined);
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it('admin GET is 403 without admin', async () => {
    const res = await adminGet(makeNextRequest('https://www.missionwinning.com/api/flags/admin'));
    assert.equal(res.status, 403);
    const body = (await res.json()) as { error?: string; flags?: unknown };
    assert.equal(body.error, 'Forbidden');
    assert.equal(Array.isArray(body.flags), false);
  });

  it('admin GET is 503 with flags_unavailable, never an empty catalog', async () => {
    const res = await adminGet(
      makeNextRequest('https://www.missionwinning.com/api/flags/admin', {
        headers: adminHeaders(),
      })
    );
    assert.equal(res.status, 503);
    const body = (await res.json()) as { error?: string; flags?: unknown };
    assert.equal(body.error, 'flags_unavailable');
    assert.equal(Array.isArray(body.flags), false, 'a missing table must not look like zero flags');
  });

  it('PATCH is 403 without admin', async () => {
    const res = await adminPatch(
      makeNextRequest('https://www.missionwinning.com/api/flags/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'example_staged', percent: 10 }),
      })
    );
    assert.equal(res.status, 403);
  });

  it('PATCH cannot mint a key that is not in the catalog', async () => {
    const res = await adminPatch(
      makeNextRequest('https://www.missionwinning.com/api/flags/admin', {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ key: 'logger', percent: 100 }),
      })
    );
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error?: string };
    assert.equal(body.error, 'unknown_key');
  });

  it('athlete GET never returns allowlists, percents, or other users', async () => {
    const res = await flagsGet(
      makeNextRequest('https://www.missionwinning.com/api/flags?deviceId=mw-device-1')
    );
    assert.equal(res.status, 200);
    const body = (await res.json()) as { flags?: Record<string, unknown> };
    assert.equal(typeof body.flags, 'object');
    assert.equal(body.flags?.example_staged, false);
    const raw = JSON.stringify(body);
    assert.equal(raw.includes('allowlist'), false);
    assert.equal(raw.includes('percent'), false);
    assert.equal(raw.includes('killed'), false);
    assert.equal('allowlist' in body, false);
  });

  it('preview without admin is 403', async () => {
    const res = await previewGet(
      makeNextRequest(
        'https://www.missionwinning.com/api/flags/admin/preview?subject=a@x.co&key=example_staged'
      )
    );
    assert.equal(res.status, 403);
  });

  it('preview with admin but no table is 503, never a fake on/off', async () => {
    const res = await previewGet(
      makeNextRequest(
        'https://www.missionwinning.com/api/flags/admin/preview?subject=a@x.co&key=example_staged',
        { headers: adminHeaders() }
      )
    );
    assert.equal(res.status, 503);
    const body = (await res.json()) as { error?: string; on?: unknown };
    assert.equal(body.error, 'flags_unavailable');
    assert.equal(body.on, undefined);
  });
});
