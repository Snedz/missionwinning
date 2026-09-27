/**
 * POST /api/coach/trainer is free. No app-access cookie. No premium 402.
 * A dark seat returns the set line.
 */
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST as trainerPost } from '../../../app/api/coach/trainer/route.ts';
import { makeNextRequest } from '@/lib/api/testRequest';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';

const BODY = {
  exerciseName: 'Bench Press',
  setNumber: 1,
  setCount: 3,
  reps: 5,
  weight: 60,
  unitLabel: 'kg',
  kind: 'normal',
  rowType: 'weight',
  hardCount: 0,
};

function post(body: unknown, ip: string): Promise<Response> {
  return trainerPost(
    makeNextRequest('http://localhost/api/coach/trainer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    })
  );
}

describe('free trainer route', () => {
  let envSnapshot: NodeJS.ProcessEnv;

  beforeEach(() => {
    envSnapshot = snapshotEnv();
    setTestEnv('GEMINI_API_KEY', undefined);
    setTestEnv('GEMINI_MODEL', undefined);
    setTestEnv('COACH_LLM_API_URL', undefined);
    setTestEnv('COACH_LLM_API_KEY', undefined);
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  it('answers the set line with no session and no premium', async () => {
    const res = await post(BODY, '203.0.113.10');
    assert.equal(res.status, 200);
    const data = (await res.json()) as { text: string; source: string; paymentUrl?: string };
    assert.equal(data.source, 'rules');
    assert.equal(data.text, 'Set 1 of 3. Bench Press. 60 kg for 5.');
    assert.equal(data.paymentUrl, undefined);
    assert.equal(JSON.stringify(data).includes('paymentUrl'), false);
  });

  it('rejects a body that is not an open set', async () => {
    const res = await post({ exerciseName: '' }, '203.0.113.11');
    assert.equal(res.status, 400);
  });
});
