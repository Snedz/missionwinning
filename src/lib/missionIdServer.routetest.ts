/**
 * Mission ID claim — service-role insert, founder is 1, clients never choose.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { claimMissionIdForUser } from '@/lib/missionIdServer';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

type Row = { user_id: string; mission_id: number };

function founderUser(id = 'founder-uuid'): User {
  return {
    id,
    email: 'founder@example.com',
    identities: [
      { provider: 'github', identity_data: { user_name: 'Snedz' } },
    ],
  } as unknown as User;
}

function otherUser(id = 'other-uuid'): User {
  return {
    id,
    email: 'athlete@example.com',
    identities: [],
  } as unknown as User;
}

function makeAdmin(opts: { rows?: Row[]; failInsert?: boolean } = {}) {
  const rows = [...(opts.rows ?? [])];
  const calls: string[] = [];
  let seq = 2;

  const admin = {
    from(table: string) {
      assert.equal(table, 'mission_ids');
      const filters: Record<string, unknown> = {};
      const chain = {
        select(_cols: string) {
          calls.push('select');
          return chain;
        },
        insert(values: Row) {
          calls.push(`insert:${values.mission_id}`);
          return {
            then(
              onFulfilled: (v: { error: { code?: string } | null }) => unknown,
              onRejected?: (e: unknown) => unknown
            ) {
              return Promise.resolve()
                .then(() => {
                  if (opts.failInsert) return { error: { message: 'boom' } };
                  const takenUser = rows.some((r) => r.user_id === values.user_id);
                  const takenId = rows.some((r) => r.mission_id === values.mission_id);
                  if (takenUser || takenId) return { error: { code: '23505' } };
                  rows.push(values);
                  return { error: null };
                })
                .then(onFulfilled, onRejected);
            },
          };
        },
        eq(col: string, value: unknown) {
          filters[col] = value;
          return chain;
        },
        maybeSingle() {
          const hit = rows.find((r) => {
            if (filters.user_id != null) return r.user_id === filters.user_id;
            if (filters.mission_id != null) return r.mission_id === filters.mission_id;
            return false;
          });
          return Promise.resolve({ data: hit ?? null, error: null });
        },
      };
      return chain;
    },
    rpc(name: string) {
      assert.equal(name, 'mw_next_mission_id');
      calls.push('nextval');
      const n = seq;
      seq += 1;
      return Promise.resolve({ data: n, error: null });
    },
    calls,
    rows,
  };

  return admin as unknown as SupabaseClient & { calls: string[]; rows: Row[] };
}

describe('claimMissionIdForUser', () => {
  it('seeds ID 1 for the founder GitHub profile', async () => {
    const admin = makeAdmin();
    const id = await claimMissionIdForUser(admin, founderUser());
    assert.equal(id, 1);
    assert.equal(admin.rows[0]?.mission_id, 1);
  });

  it('ID 1 cannot be issued twice', async () => {
    const admin = makeAdmin({
      rows: [{ user_id: 'someone-else', mission_id: 1 }],
    });
    const id = await claimMissionIdForUser(admin, founderUser());
    assert.notEqual(id, 1);
    assert.ok(id >= 2);
    const ones = admin.rows.filter((r) => r.mission_id === 1);
    assert.equal(ones.length, 1);
  });

  it('sequential accounts get 2, 3, … never 1', async () => {
    const admin = makeAdmin();
    const a = await claimMissionIdForUser(admin, otherUser('a'));
    const b = await claimMissionIdForUser(admin, otherUser('b'));
    assert.equal(a, 2);
    assert.equal(b, 3);
    assert.ok(admin.rows.every((r) => r.mission_id !== 1 || r.user_id === 'a'));
    assert.equal(
      admin.rows.find((r) => r.mission_id === 1),
      undefined
    );
  });

  it('is idempotent for the same user', async () => {
    const admin = makeAdmin();
    const first = await claimMissionIdForUser(admin, founderUser());
    const second = await claimMissionIdForUser(admin, founderUser());
    assert.equal(first, 1);
    assert.equal(second, 1);
    assert.equal(admin.rows.length, 1);
  });
});

describe('server-only mint', () => {
  it('the server module refuses to ship in a client bundle', () => {
    assert.match(read('src/lib/missionIdServer.ts'), /import 'server-only'/);
  });

  it('the migration unique-constrains mission_id and starts the sequence at 2', () => {
    const sql = read('supabase/migrations/20260813_mission_ids.sql');
    assert.match(sql, /mission_id integer not null unique/);
    assert.match(sql, /start with 2/);
    assert.match(sql, /grant select on table public\.mission_ids to authenticated/);
    assert.doesNotMatch(sql, /grant insert/i);
    assert.match(sql, /revoke all on sequence public\.mission_id_seq/);
    assert.match(sql, /No insert\/update\/delete policies/);
  });
});
