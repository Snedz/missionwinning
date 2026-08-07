/**
 * Deletion order, redaction, and failure honesty for account data.
 *
 * Route lane because `accountDataServer.ts` is `server-only`. The stub client
 * records every table/op/filter so the assertions pin the *shape* of the work:
 * email-keyed cleanups run before the auth-user cascade (the address is
 * unrecoverable after), secrets never ride an export, and a failed step
 * surfaces as failure — a partial deletion must never report success.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteAccount, exportAccountData } from '@/lib/accountDataServer';
import { EMAIL_ONLY_TABLES, EXPORT_ROW_CAP } from '@/lib/accountDataRegistry';

type Call = { table: string; op: string; filters: string[] };

type StubOptions = {
  failOn?: string;
  rowsFor?: (table: string) => Record<string, unknown>[];
  failDeleteUser?: boolean;
};

function makeAdmin(opts: StubOptions = {}) {
  const calls: Call[] = [];

  const makeBuilder = (table: string) => {
    const call: Call = { table, op: '', filters: [] };
    let pushed = false;
    const settle = () => {
      if (!pushed) {
        pushed = true;
        calls.push(call);
      }
      return opts.failOn === table
        ? { data: null, error: { message: 'boom' } }
        : { data: opts.rowsFor?.(table) ?? [], error: null };
    };
    const chain = {
      select(_cols: string) {
        call.op = 'select';
        return chain;
      },
      delete() {
        call.op = 'delete';
        return chain;
      },
      update(_values: Record<string, unknown>) {
        call.op = 'update';
        return chain;
      },
      eq(col: string, value: unknown) {
        call.filters.push(`eq:${col}=${String(value)}`);
        return chain;
      },
      is(col: string, value: unknown) {
        call.filters.push(`is:${col}=${String(value)}`);
        return chain;
      },
      limit(_n: number) {
        return Promise.resolve(settle());
      },
      then(
        onFulfilled: (v: { data: unknown; error: unknown }) => unknown,
        onRejected?: (e: unknown) => unknown
      ) {
        return Promise.resolve(settle()).then(onFulfilled, onRejected);
      },
    };
    return chain;
  };

  const admin = {
    from: (table: string) => makeBuilder(table),
    auth: {
      admin: {
        deleteUser: async (_id: string) => {
          calls.push({ table: 'auth.users', op: 'deleteUser', filters: [] });
          return opts.failDeleteUser ? { error: { message: 'boom' } } : { error: null };
        },
      },
    },
  };
  return { admin: admin as unknown as SupabaseClient, calls };
}

describe('deleteAccount', () => {
  it('cleans every email-keyed table before the auth cascade, device rows included', async () => {
    const { admin, calls } = makeAdmin();
    const result = await deleteAccount(admin, 'user-1', 'a@b.co', 'device-1');
    assert.deepEqual(result, { ok: true });

    const deleteUserIndex = calls.findIndex((c) => c.op === 'deleteUser');
    assert.ok(deleteUserIndex >= 0, 'auth user must be deleted');
    assert.equal(deleteUserIndex, calls.length - 1, 'auth cascade must run LAST');

    // Wiring: the executor touches every table the registry declares email-keyed.
    for (const table of EMAIL_ONLY_TABLES) {
      const idx = calls.findIndex((c) => c.table === table);
      assert.ok(idx >= 0 && idx < deleteUserIndex, `${table} must be cleaned before deleteUser`);
    }
    // beta_invites is anonymized, never deleted — funnel rows are history.
    assert.equal(calls.find((c) => c.table === 'beta_invites')?.op, 'update');
    // Orphan enrollments only: rows already owned by user_id ride the cascade.
    const enroll = calls.find((c) => c.table === 'enrollments');
    assert.ok(enroll?.filters.includes('is:user_id=null'));
    // Anonymous device rows: cascade cannot reach them, so the executor must.
    for (const table of ['push_subscriptions', 'llm_usage']) {
      const c = calls.find((x) => x.table === table);
      assert.ok(c, `${table} device rows must be cleaned`);
      assert.ok(c?.filters.includes('is:user_id=null'));
      assert.ok(c?.filters.includes('eq:device_id=device-1'));
    }
  });

  it('a failed cleanup aborts before the cascade and reports the failure', async () => {
    const { admin, calls } = makeAdmin({ failOn: 'leads' });
    const result = await deleteAccount(admin, 'user-1', 'a@b.co');
    assert.deepEqual(result, { ok: false, step: 'leads' });
    assert.ok(
      !calls.some((c) => c.op === 'deleteUser'),
      'auth user must survive when a cleanup fails — partial deletion is worse than none'
    );
  });

  it('a failed auth delete is a failure, not a success', async () => {
    const { admin } = makeAdmin({ failDeleteUser: true });
    const result = await deleteAccount(admin, 'user-1', 'a@b.co');
    assert.deepEqual(result, { ok: false, step: 'auth_user' });
  });

  it('without email or device, only the cascade runs', async () => {
    const { admin, calls } = makeAdmin();
    const result = await deleteAccount(admin, 'user-1', null);
    assert.deepEqual(result, { ok: true });
    assert.deepEqual(
      calls.map((c) => c.op),
      ['deleteUser']
    );
  });
});

describe('exportAccountData', () => {
  it('filters by the verified user and never exports wearable tokens', async () => {
    const { admin, calls } = makeAdmin({
      rowsFor: (table) =>
        table === 'wearable_connections'
          ? [{ id: 'w1', provider: 'x', access_token: 'SECRET', refresh_token: 'SECRET2' }]
          : [{ id: 'r1', note: 'keep' }],
    });
    const data = await exportAccountData(admin, 'user-1', 'a@b.co');

    const profiles = calls.find((c) => c.table === 'profiles');
    assert.ok(profiles?.filters.includes('eq:id=user-1'));
    const logs = calls.find((c) => c.table === 'workout_logs');
    assert.ok(logs?.filters.includes('eq:user_id=user-1'));

    const wearRows = data.tables.wearable_connections.rows;
    assert.equal(wearRows.length, 1);
    assert.ok(!('access_token' in wearRows[0]), 'access_token must never ride an export');
    assert.ok(!('refresh_token' in wearRows[0]), 'refresh_token must never ride an export');
    assert.equal(data.tables.routines.rows[0]?.note, 'keep');
  });

  it('caps rows per table and marks the truncation', async () => {
    const big = Array.from({ length: EXPORT_ROW_CAP + 1 }, (_, i) => ({ id: `r${i}` }));
    const { admin } = makeAdmin({ rowsFor: () => big });
    const data = await exportAccountData(admin, 'user-1', null);
    assert.equal(data.tables.workout_logs.rows.length, EXPORT_ROW_CAP);
    assert.equal(data.tables.workout_logs.truncated, true);
  });

  it('a table read failure throws — a partial export must not look complete', async () => {
    const { admin } = makeAdmin({ failOn: 'workout_logs' });
    await assert.rejects(() => exportAccountData(admin, 'user-1', null));
  });
});
