/**
 * P2-3 — youth consent-notify is not an open mail relay.
 * Runs under `npm run test:routes` (`server-only` resolves).
 */
import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../../app/api/youth/consent-notify/route.ts';
import { makeNextRequest } from '@/lib/api/testRequest';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';

const BODY = { parentEmail: 'parent@example.com', childAge: 11 };

function post(surfaces: string | undefined): Promise<Response> {
  if (surfaces === undefined) {
    delete process.env.NEXT_PUBLIC_SURFACES;
  } else {
    setTestEnv('NEXT_PUBLIC_SURFACES', surfaces);
  }
  setTestEnv('RESEND_API_KEY', 're_test_should_never_be_called');
  return POST(
    makeNextRequest('https://www.missionwinning.com/api/youth/consent-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(BODY),
    })
  );
}

describe('youth/consent-notify', () => {
  let envSnapshot: NodeJS.ProcessEnv;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it('404s when the youth surface is parked — even with a Resend key', async () => {
    const res = await post(undefined);
    assert.equal(res.status, 404);
    const body = (await res.json()) as { error?: string };
    assert.equal(body.error, 'Not found');
  });

  it('401s when school is on but there is no session', async () => {
    const res = await post('school');
    assert.equal(res.status, 401);
    const body = (await res.json()) as { error?: string };
    assert.equal(body.error, 'Sign in required');
  });
});
