import test from 'node:test';
import assert from 'node:assert/strict';
import { alignLegacyWorkouts, createWorkoutCloud, withClientId } from './workoutCloud';
import { mapCloudToLocal, mergeWorkoutHistories } from '@/lib/workout/workoutMerge';

const legacy = {
  id: '11111111-1111-4111-8111-111111111111',
  user_id: '22222222-2222-4222-8222-222222222222', revision: 1,
  client_id: null, updated_at: '2025-01-01T00:01:00Z', deleted_at: null,
  workout_name: 'Legacy push', started_at: '2025-01-01T00:00:00Z', completed_at: '2025-01-01T00:01:00Z',
  duration_seconds: 60, total_volume: 0, weight_unit: 'lb', set_count: 1,
  exercises: [{ id: 'set-1', exerciseId: 'push-ups', reps: 12, weight: 0 }],
};

test('legacy cloud and guest copies reconcile without minting a second row', async () => {
  const [remote] = mapCloudToLocal([legacy]);
  const local = await withClientId({ ...remote, id: 'offline-1' });
  assert.equal((await withClientId({ ...remote, id: 'offline-1' })).clientId, local.clientId);
  const merged = mergeWorkoutHistories(alignLegacyWorkouts([local], [remote]), [remote]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, remote.id);

  const methods: string[] = [];
  const transport = createWorkoutCloud({
    url: 'http://127.0.0.1:54321', publicKey: 'test-public-key', userId: legacy.user_id, accessToken: 'test-token',
    fetcher: async (url, options) => {
      const query = new URL(String(url)).searchParams;
      assert.equal(query.get('user_id'), `eq.${legacy.user_id}`);
      assert.equal(new Headers(options?.headers).get('authorization'), 'Bearer test-token');
      methods.push(options?.method ?? 'GET');
      return Response.json(query.get('client_id') === `eq.${local.clientId}` ? [] : [legacy]);
    },
  });
  assert.deepEqual(await transport.pull(), [legacy]);
  assert.equal(await transport.push(local, 'kg'), true);
  assert.deepEqual(methods, ['GET', 'GET', 'GET']);
});

test('workout deletion uses the existing row, compare-and-set, and preserves stored data', async () => {
  const [remote] = mapCloudToLocal([legacy]);
  const deletion = { ...remote, revision: 2, deletedAt: '2025-01-02T00:00:00Z' };
  let patched = false;
  const transport = createWorkoutCloud({
    url: 'http://127.0.0.1:54321', publicKey: 'test-public-key', userId: legacy.user_id, accessToken: 'test-token',
    fetcher: async (url, options) => {
      const query = new URL(String(url)).searchParams;
      assert.equal(query.get('id'), `eq.${legacy.id}`);
      if (options?.method === 'PATCH') {
        patched = true;
        assert.equal(query.get('revision'), 'eq.1');
        assert.equal(query.get('updated_at'), `eq.${legacy.updated_at}`);
        assert.equal(query.get('deleted_at'), 'is.null');
        const body = JSON.parse(String(options.body));
        assert.deepEqual(Object.keys(body).sort(), ['deleted_at', 'revision', 'updated_at']);
        assert.equal(body.deleted_at, deletion.deletedAt);
        return Response.json([{ ...legacy, ...body }]);
      }
      return Response.json([legacy]);
    },
  });
  assert.equal(await transport.push(deletion, 'kg'), true);
  assert.equal(patched, true);
});
