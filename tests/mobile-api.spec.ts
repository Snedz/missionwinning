import { randomUUID } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { expect, test } from '@playwright/test';

const mobile = '/api/mobile';
const privateMode = process.env.PRIVATE_MODE === 'true' || process.env.PRIVATE_MODE === '1';
const localApi = 'http://127.0.0.1:54321';
const localStack = Boolean(process.env.V2_LOCAL_SUPABASE_TEST);
const weekKey = '2025-W01';
const trainerAsk = {
  exerciseName: 'Bench press', setNumber: 2, setCount: 3, reps: 8,
  weight: 45, unitLabel: 'lb', rowType: 'weight', hardCount: 0,
};

test('private mobile ingress returns the legacy 403 before route auth', async ({ request }) => {
  test.skip(!privateMode, 'Opt into the legacy private mobile perimeter.');
  const response = await request.get(`${mobile}/coach/plan`, {
    headers: { Authorization: 'Bearer invalid' },
  });
  expect(response.status()).toBe(403);
  expect(await response.json()).toEqual({ error: 'Private development gate' });
  const trainer = await request.post('/api/coach/trainer', { data: trainerAsk });
  expect(trainer.status()).toBe(403);
});

test.describe('public mobile ingress', () => {
  test.skip(privateMode, 'These requests target the public mobile ingress.');

  test('Compose Trainer uses the free set-line fallback and validates the strict request', async ({ request }) => {
    const route = '/api/coach/trainer';
    const reply = await request.post(route, { data: trainerAsk });
    expect(reply.status()).toBe(200);
    expect(await reply.json()).toEqual({ text: 'Set 2 of 3. Bench press. 45 lb for 8.', source: 'rules' });
    const invalid = await request.post(route, { data: { ...trainerAsk, checkoutUrl: 'https://example.com' } });
    expect(invalid.status()).toBe(400);
    const large = await request.post(route, { data: { ...trainerAsk, question: 'a'.repeat(8192) } });
    expect(large.status()).toBe(413);
  });

  test('Compose Trainer accepts twelve requests per IP before throttling', async ({ request }) => {
    const headers = { 'x-forwarded-for': '192.0.2.42' };
    for (let i = 0; i < 12; i++) {
      const response = await request.post('/api/coach/trainer', { headers, data: trainerAsk });
      expect(response.status()).toBe(200);
    }
    const blocked = await request.post('/api/coach/trainer', { headers, data: trainerAsk });
    expect(blocked.status()).toBe(429);
  });

  test('Trainer caps streamed request bytes without a declared length', async ({ baseURL }) => {
    const status = await new Promise<number | undefined>((resolve, reject) => {
      const request = httpRequest(new URL('/api/coach/trainer', baseURL), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      }, (response) => {
        response.resume();
        resolve(response.statusCode);
      });
      request.on('error', reject);
      request.write('{"question":"');
      request.end('é'.repeat(4096) + '"}');
    });
    expect(status).toBe(413);
  });

  test('rejects invalid Coach session shapes and workout timestamps', async ({ request }) => {
    const { plan } = await (await request.get('/api/mobile/coach/plan')).json();
    const badPlan = { ...plan, sessions: [{ ...plan.sessions[0], exercises: [null] }] };
    const adapt = await request.post('/api/mobile/coach/adapt', {
      data: { plan: badPlan, sessionId: plan.sessions[0].id },
    });
    expect(adapt.status()).toBe(400);
    const workout = await request.post('/api/mobile/workouts', {
      data: { workoutName: 'Date validation', durationSeconds: 60, setCount: 1, totalVolume: 0, completedAt: 'not a date' },
    });
    expect(workout.status()).toBe(400);
  });

  test('Compose CoachPlanResponseDto supports GET, POST, and marking a session done', async ({ request }) => {
    const seed = await request.get(`${mobile}/coach/plan?equipment=dumbbells&adaptDemo=1`);
    expect(seed.status()).toBe(200);
    const first = await seed.json();
    expect(first).toMatchObject({
      plan: { equipmentProfile: 'dumbbells', revision: expect.any(Number), weekStart: expect.any(String) },
      adaptBeats: expect.any(Array), hasAdaptSignal: true,
    });
    expect(first.plan.sessions.length).toBeGreaterThan(0);

    const generated = await request.post(`${mobile}/coach/plan`, {
      data: { equipment: 'bodyweight', withAdaptDemo: false, revision: 9 },
    });
    expect(generated.ok()).toBe(true);
    const { plan } = await generated.json();
    const session = plan.sessions.find((entry: { kind: string }) => entry.kind !== 'rest');
    expect(plan.revision).toBe(9);
    expect(session).toMatchObject({
      id: expect.any(String), dayOffset: expect.any(Number), name: expect.any(String),
      estMinutes: expect.any(Number), status: 'planned',
      exercises: expect.arrayContaining([
        expect.objectContaining({ exerciseId: expect.any(String), sets: expect.any(Number), reps: expect.any(Number) }),
      ]),
    });
    const adapted = await request.post(`${mobile}/coach/adapt`, { data: { plan, sessionId: session.id } });
    expect(adapted.ok()).toBe(true);
    const next = await adapted.json();
    expect(next.plan.revision).toBe(10);
    expect(next.plan.sessions.find((entry: { id: string }) => entry.id === session.id).status).toBe('done');
    expect((await request.get(`${mobile}/coach/plan?equipment=unknown`)).status()).toBe(400);
  });

  test('unauthenticated Compose logging stays local; sync is Bearer-only', async ({ request }) => {
    const data = { workoutName: 'Quick workout', completedAt: '2025-01-02T12:00:00Z', durationSeconds: 60, setCount: 1, totalVolume: 0 };
    const result = await request.post(`${mobile}/workouts`, { data });
    expect(result.status()).toBe(200);
    expect(await result.json()).toMatchObject({ ok: true, synced: false, id: expect.stringMatching(/^local-/), workoutName: data.workoutName });

    for (const resource of ['workouts', 'routines', 'customs', 'prefs']) {
      const url = `${mobile}/sync/${resource}`;
      for (const response of [await request.get(url), await request.post(url, { data: {} })]) {
        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized' });
      }
    }
    const heartbeat = await request.post(`${mobile}/telemetry`, { data: { installId: randomUUID(), weekKey, appVersion: '1.0.0' } });
    expect(heartbeat.status()).toBe(200);
    expect(await heartbeat.json()).toEqual({ ok: true, stored: localStack && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) });
    expect((await request.post(`${mobile}/telemetry`, { data: { installId: 'invalid', weekKey } })).status()).toBe(400);
  });

  test('local legacy database: Compose DTOs round-trip through bearer auth and RLS', async ({ request }) => {
    test.skip(!localStack, 'Requires the opt-in local Supabase stack and legacy mobile migrations.');
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe(localApi);
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    expect(Boolean(key)).toBe(true);
    async function signUp() {
      const response = await request.post(`${localApi}/auth/v1/signup`, {
        headers: { apikey: key }, data: { email: `${randomUUID()}@example.com`, password: randomUUID() },
      });
      expect(response.ok()).toBe(true);
      const { access_token: token } = await response.json();
      expect(Boolean(token)).toBe(true);
      return { Authorization: `Bearer ${token}` };
    }

    const headers = await signUp();
    const other = await signUp();
    const completedAt = '2025-01-02T12:00:00Z';
    const workout = {
      clientId: randomUUID(), workoutName: 'Compose workout', completedAt, durationSeconds: 60,
      setCount: 1, totalVolume: 50, sessionId: 'compose-session', weightUnit: 'lb', revision: 1,
      sets: [{ id: 'set-1', exerciseId: 'push-ups', exerciseName: 'Push-ups', setIndex: 0, reps: 10,
        weight: 5, completedAt, weightUnit: 'kg', rpe: 8, setKind: 'normal', note: 'Smooth set' }],
    };
    const routine = {
      clientId: randomUUID(), name: 'Compose routine', createdAt: completedAt, revision: 1,
      exercises: [{ exerciseId: 'push-ups', exerciseName: 'Push-ups', sets: 4, targetReps: 10, lastWeight: 5 }],
    };
    const custom = {
      clientId: 'custom-compose-1', name: 'Compose exercise', createdAt: completedAt, revision: 1,
      equipment: 'bodyweight', muscleGroups: 'chest',
    };
    const prefs = { weightUnit: 'lb', defaultRestSeconds: 75, equipment: 'dumbbells', barWeightKg: 20, barWeightLb: 45, revision: 2 };

    const legacy = await request.post(`${mobile}/workouts`, { headers, data: workout });
    expect(legacy.ok()).toBe(true);
    const legacyLog = await legacy.json();
    expect(legacyLog).toMatchObject({ ok: true, synced: true, id: expect.any(String) });

    for (const [resource, key, item] of [['workouts', 'workouts', workout], ['routines', 'routines', routine], ['customs', 'exercises', custom]] as const) {
      const url = `${mobile}/sync/${resource}`;
      const pushed = await request.post(url, { headers, data: { [key]: [item] } });
      expect(pushed.status()).toBe(200);
      const push = await pushed.json();
      expect(push).toMatchObject({ ok: true, acks: [{
        clientId: item.clientId, serverId: expect.any(String), revision: 1, updatedAt: expect.any(String), status: resource === 'workouts' ? 'claimed' : 'ok',
      }] });
      if (resource === 'workouts') expect(push.acks[0].serverId).toBe(legacyLog.id);
      const pulled = await request.get(url + '?limit=1', { headers });
      expect(pulled.ok()).toBe(true);
      const page = await pulled.json();
      expect(page).toMatchObject({
        items: [{ clientId: item.clientId, serverId: push.acks[0].serverId, revision: 1, deletedAt: null }],
        nextCursor: expect.any(String),
      });
      if (resource === 'workouts') {
        expect(page.items[0]).toMatchObject({
          weightUnit: 'lb', sessionId: workout.sessionId, setCount: 1,
          sets: [{ exerciseId: 'push-ups', reps: 10, weight: 5, weightUnit: 'kg', note: 'Smooth set' }],
        });
      }
      expect(await (await request.get(url + '?' + new URLSearchParams({ since: page.nextCursor }), { headers })).json()).toEqual({ items: [], nextCursor: null });
      expect(await (await request.get(url, { headers: other })).json()).toEqual({ items: [], nextCursor: null });
      const removed = await request.post(url, { headers, data: { [key]: [{ ...item, revision: 2, deletedAt: completedAt }] } });
      expect(await removed.json()).toMatchObject({ acks: [{ serverId: push.acks[0].serverId, revision: 2, status: 'ok' }] });
      const retry = await request.post(url, { headers, data: { [key]: [item] } });
      expect(await retry.json()).toMatchObject({ acks: [{ revision: 2, status: 'ok' }] });
      expect(await (await request.get(url, { headers })).json()).toMatchObject({
        items: [{ clientId: item.clientId, revision: 2, deletedAt: expect.any(String) }],
      });
    }

    const prefsUrl = `${mobile}/sync/prefs`;
    expect(await (await request.post(prefsUrl, { headers, data: { prefs } })).json()).toEqual({ ok: true, revision: 2 });
    expect(await (await request.get(prefsUrl, { headers })).json()).toMatchObject({ prefs });
    expect(await (await request.get(prefsUrl, { headers: other })).json()).toEqual({ prefs: null });
    expect(await (await request.post(prefsUrl, { headers, data: { prefs: { ...prefs, revision: 1 } } })).json())
      .toEqual({ ok: true, skipped: true, revision: 2 });

    const purchase = await request.post(`${mobile}/premium/play-purchase`, {
      headers, data: { productId: 'mw_super_bundle', purchaseToken: 'synthetic-local-token', packageName: 'com.missionwinning.app' },
    });
    expect(purchase.status()).toBe(410);
    expect(await purchase.json()).toEqual({ ok: false, error: 'Payments are off', premium: false });
    const premium = await request.get(`${mobile}/premium/status`, { headers });
    expect(premium.status()).toBe(200);
    expect(await premium.json()).toEqual({ premium: true, source: 'free_beta' });
  });
});
