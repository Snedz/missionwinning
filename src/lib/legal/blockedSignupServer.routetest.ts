/**
 * P1-3 — dispose reaps only a new empty user; lookup failure keeps the row.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { disposeBlockedTerritorySignup } from './blockedSignupServer.ts';

type Call = { table: string; op: string };

function makeAdmin(opts: { failOn?: string; owned?: string[]; failDelete?: boolean } = {}) {
  const calls: Call[] = [];
  const owned = new Set(opts.owned ?? []);
  const admin = {
    from: (table: string) => {
      const chain = {
        select() {
          return chain;
        },
        eq() {
          return chain;
        },
        limit() {
          calls.push({ table, op: 'select' });
          if (opts.failOn === table) {
            return Promise.resolve({ data: null, error: { message: 'boom' } });
          }
          return Promise.resolve({
            data: owned.has(table) ? [{ id: 'row-1' }] : [],
            error: null,
          });
        },
      };
      return chain;
    },
    auth: {
      admin: {
        deleteUser: async (id: string) => {
          calls.push({ table: 'auth.users', op: `deleteUser:${id}` });
          return opts.failDelete ? { error: { message: 'boom' } } : { error: null };
        },
      },
    },
  };
  return { admin: admin as unknown as SupabaseClient, calls };
}

const fresh = { id: 'user-new', created_at: new Date().toISOString() };
const old = {
  id: 'user-old',
  created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
};

describe('disposeBlockedTerritorySignup', () => {
  it('reaps a fresh empty user', async () => {
    const { admin, calls } = makeAdmin();
    assert.equal(await disposeBlockedTerritorySignup(admin, fresh), 'reaped');
    assert.ok(calls.some((c) => c.op === 'deleteUser:user-new'));
  });

  it('keeps an older user', async () => {
    const { admin, calls } = makeAdmin();
    assert.equal(await disposeBlockedTerritorySignup(admin, old), 'kept');
    assert.ok(!calls.some((c) => c.op.startsWith('deleteUser')));
  });

  it('keeps a fresh user who already has logs', async () => {
    const { admin, calls } = makeAdmin({ owned: ['workout_logs'] });
    assert.equal(await disposeBlockedTerritorySignup(admin, fresh), 'kept');
    assert.ok(!calls.some((c) => c.op.startsWith('deleteUser')));
  });

  it('keeps the user when a lookup fails', async () => {
    const { admin, calls } = makeAdmin({ failOn: 'workout_logs' });
    assert.equal(await disposeBlockedTerritorySignup(admin, fresh), 'kept');
    assert.ok(!calls.some((c) => c.op.startsWith('deleteUser')));
  });
});
