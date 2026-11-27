import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GET as getCustoms } from '../../../app/api/mobile/sync/customs/route';
import { GET as getRoutines } from '../../../app/api/mobile/sync/routines/route';
import { GET as getWorkouts } from '../../../app/api/mobile/sync/workouts/route';
import { makeNextRequest } from '@/lib/api/testRequest';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv';

const timestamp = '2025-04-01T16:30:00.123456+00:00';
const earlier = '2025-04-01T16:30:00.123455+00:00';
const ids = [1, 2, 3].map((n) => `00000000-0000-4000-8000-00000000000${n}`);
const owner = '10000000-0000-4000-8000-000000000001';
const routes = [
  ['workouts', 'workout_logs', getWorkouts],
  ['routines', 'routines', getRoutines],
  ['customs', 'custom_exercises', getCustoms],
] as const;

for (const [route, table, get] of routes) {
  test(`${route}: resumes a v2 cursor through ties, keeps timestamp cursors compatible, and rejects bad cursors`, async (t) => {
    const env = snapshotEnv();
    t.after(() => restoreEnv(env));
    setTestEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    setTestEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const queries: URLSearchParams[] = [];
    t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
      const url = new URL(input instanceof Request ? input.url : input);
      assert.equal(url.origin, 'https://example.supabase.co');
      if (url.pathname === '/auth/v1/user') return Response.json({ id: owner, aud: 'authenticated' });
      assert.equal(url.pathname, `/rest/v1/${table}`);
      const query = url.searchParams;
      queries.push(query);
      const legacy = query.get('updated_at');
      const composite = query.get('or');
      const matches = ids.filter((id) =>
        legacy === `gt.${earlier}` || composite === `(updated_at.gt.${timestamp},and(updated_at.eq.${timestamp},id.gt.${ids[0]}))` && id > ids[0] ||
        composite === `(updated_at.gt.${timestamp},and(updated_at.eq.${timestamp},id.gt.${ids[1]}))` && id > ids[1]);
      return Response.json(matches.slice(0, Number(query.get('limit'))).map((id) => ({
        id, client_id: id, user_id: owner, name: 'Saved item', workout_name: 'Logged workout',
        exercises: [], completed_at: timestamp, updated_at: timestamp, deleted_at: timestamp,
      })));
    });

    async function pull(since: string) {
      const search = new URLSearchParams({ since, limit: '1' });
      return get(makeNextRequest(`https://example.com/api/mobile/sync/${route}?${search}`, {
        headers: { Authorization: 'Bearer aaa.bbb.ccc' },
      }));
    }

    const legacy = await pull(earlier);
    assert.equal(legacy.status, 200);
    const legacyPage = await legacy.json();
    assert.deepEqual(legacyPage.items.map((item: { serverId: string }) => item.serverId), [ids[0]]);
    assert.equal(legacyPage.nextCursor, timestamp);

    const resumed = await pull(`${timestamp}~${ids[0]}`);
    assert.equal(resumed.status, 200);
    const resumedPage = await resumed.json();
    assert.deepEqual(resumedPage.items.map((item: { serverId: string }) => item.serverId), [ids[1]]);
    assert.equal(resumedPage.items[0].deletedAt, timestamp);
    assert.equal(resumedPage.nextCursor, `${timestamp}~${ids[1]}`);

    const continued = await pull(resumedPage.nextCursor);
    assert.equal(continued.status, 200);
    assert.deepEqual((await continued.json()).items.map((item: { serverId: string }) => item.serverId), [ids[2]]);
    assert.equal(queries.length, 3);
    for (const query of queries) {
      assert.equal(query.get('user_id'), `eq.${owner}`);
      assert.equal(query.get('order'), 'updated_at.asc,id.asc');
    }
    assert.equal(queries[0].get('or'), null);
    assert.equal(queries[1].get('updated_at'), null);

    const invalid = await pull(`${timestamp}~not-a-uuid`);
    assert.equal(invalid.status, 400);
    assert.deepEqual(await invalid.json(), { error: 'Invalid cursor' });
    assert.equal(queries.length, 3, 'invalid input must not reach a sync table');
  });
}
