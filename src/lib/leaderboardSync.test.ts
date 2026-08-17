/**
 * Cloud leaderboard writes go through /api/leaderboard/snapshot.
 * A signed-in PostgREST upsert of mission_score must not be possible
 * from the client path that used to call supabase.from().upsert().
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { leaderboardSnapshotDeliveryDone } from '@/lib/leaderboardSync';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('leaderboard client upsert path is closed', () => {
  it('pushLeaderboardSnapshot does not write leaderboard_snapshots via the browser client', () => {
    const src = read('src/lib/leaderboardSync.ts');
    const push = src.slice(src.indexOf('export async function pushLeaderboardSnapshot'));
    const end = push.indexOf('\nexport async function fetchCloud');
    const body = end === -1 ? push : push.slice(0, end);
    assert.doesNotMatch(body, /from\(\s*['"]leaderboard_snapshots['"]\s*\)/);
    assert.doesNotMatch(body, /\.upsert\s*\(/);
    assert.doesNotMatch(body, /mission_score/);
    assert.match(body, /\/api\/leaderboard\/snapshot/);
  });

  it('the migration drops client write policies and revokes INSERT/UPDATE', () => {
    const sql = read('supabase/migrations/20260817_leaderboard_snapshots_server_write.sql');
    assert.match(sql, /drop policy if exists "Users upsert own leaderboard row"/);
    assert.match(sql, /drop policy if exists "Users update own leaderboard row"/);
    assert.match(
      sql,
      /revoke insert,\s*update on table public\.leaderboard_snapshots from anon,\s*authenticated/i
    );
  });

  it('the API route is session + Zod + service-role and does not take scores', () => {
    const route = read('app/api/leaderboard/snapshot/route.ts');
    assert.match(route, /getUserFromRequest/);
    assert.match(route, /rateLimitAsync/);
    assert.match(route, /leaderboardSnapshotBodySchema/);
    assert.match(route, /storeLeaderboardSnapshot/);
    assert.match(route, /status: 401/);
    assert.doesNotMatch(route, /mission_score\s*:/);
    assert.doesNotMatch(route, /parsed\.data\.mission/);
  });
});

describe('leaderboardSnapshotDeliveryDone', () => {
  it('retries only transient failures', () => {
    assert.equal(leaderboardSnapshotDeliveryDone(200), true);
    assert.equal(leaderboardSnapshotDeliveryDone(401), true);
    assert.equal(leaderboardSnapshotDeliveryDone(400), true);
    assert.equal(leaderboardSnapshotDeliveryDone(429), false);
    assert.equal(leaderboardSnapshotDeliveryDone(408), false);
    assert.equal(leaderboardSnapshotDeliveryDone(500), false);
  });
});
