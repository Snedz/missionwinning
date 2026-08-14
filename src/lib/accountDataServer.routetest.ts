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
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
  it('cleans every email-keyed table before the auth cascade', async () => {
    const { admin, calls } = makeAdmin();
    const result = await deleteAccount(admin, 'user-1', 'a@b.co');
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
  });

  it('does not delete anonymous rows for an unproven client device id', async () => {
    const { admin, calls } = makeAdmin();
    const result = await deleteAccount(admin, 'user-1', 'a@b.co');
    assert.deepEqual(result, { ok: true });
    const deviceDeletes = calls.filter(
      (c) => c.op === 'delete' && (c.table === 'push_subscriptions' || c.table === 'llm_usage')
    );
    assert.deepEqual(deviceDeletes, [], 'no linked device — no anonymous wipe');
    assert.ok(
      !calls.some((c) => c.filters.some((f) => f.includes('device-1') || f.includes('attacker'))),
      'a guessed device id must never appear in a filter'
    );
  });

  it('wipes anonymous rows only for device ids already stored on this user', async () => {
    const { admin, calls } = makeAdmin({
      rowsFor: (table) =>
        table === 'push_subscriptions' ? [{ device_id: 'mine-device' }] : [],
    });
    const result = await deleteAccount(admin, 'user-1', 'a@b.co');
    assert.deepEqual(result, { ok: true });

    for (const table of ['push_subscriptions', 'llm_usage']) {
      const wipe = calls.find(
        (c) => c.table === table && c.op === 'delete' && c.filters.includes('is:user_id=null')
      );
      assert.ok(wipe, `${table} anonymous rows for the linked device must be cleaned`);
      assert.ok(wipe?.filters.includes('eq:device_id=mine-device'));
      assert.ok(!wipe?.filters.some((f) => f.includes('attacker')));
    }
  });

  it('a failed device-link lookup aborts before the cascade', async () => {
    const { admin, calls } = makeAdmin({ failOn: 'push_subscriptions' });
    const result = await deleteAccount(admin, 'user-1', 'a@b.co');
    assert.deepEqual(result, { ok: false, step: 'device_link_push_subscriptions' });
    assert.ok(!calls.some((c) => c.op === 'deleteUser'));
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

  it('without email, only the device-link lookup and cascade run', async () => {
    const { admin, calls } = makeAdmin();
    const result = await deleteAccount(admin, 'user-1', null);
    assert.deepEqual(result, { ok: true });
    assert.deepEqual(
      calls.map((c) => `${c.table}:${c.op}`),
      ['push_subscriptions:select', 'llm_usage:select', 'auth.users:deleteUser']
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

  it('with an email, exports email-keyed PI and orphan enrollments', async () => {
    const { admin, calls } = makeAdmin({
      rowsFor: (table) =>
        table === 'leads'
          ? [{ id: 1, email: 'a@b.co', name: 'Pat' }]
          : table === 'enrollments'
            ? [{ id: 'owned' }, { id: 'orphan' }]
            : [],
    });
    const data = await exportAccountData(admin, 'user-1', 'a@b.co');

    for (const table of EMAIL_ONLY_TABLES) {
      const sel = calls.find((c) => c.table === table && c.op === 'select');
      assert.ok(sel, `${table} must be selected for access`);
      assert.ok(sel?.filters.includes('eq:email=a@b.co'));
    }
    assert.equal(data.tables.leads.rows[0]?.name, 'Pat');

    const orphanSel = calls.find(
      (c) =>
        c.table === 'enrollments' &&
        c.op === 'select' &&
        c.filters.includes('is:user_id=null') &&
        c.filters.includes('eq:user_email=a@b.co')
    );
    assert.ok(orphanSel, 'orphan enrollments by email must be in the export');
    assert.ok(data.tables.enrollments.rows.some((r) => r.id === 'owned'));
    assert.ok(data.tables.enrollments.rows.some((r) => r.id === 'orphan'));
  });

  it('without an email, does not query email-keyed tables', async () => {
    const { admin, calls } = makeAdmin();
    await exportAccountData(admin, 'user-1', null);
    for (const table of EMAIL_ONLY_TABLES) {
      assert.ok(
        !calls.some((c) => c.table === table),
        `${table} has no email to match — must not appear`
      );
    }
  });
});

describe('account delete route does not forward a client device id', () => {
  it('the handler never passes parsed.data.deviceId into the executor', () => {
    const src = readFileSync(
      join(import.meta.dirname, '../../app/api/account/delete/route.ts'),
      'utf8'
    );
    assert.match(src, /deleteAccount\(admin, userId, user\.email/);
    assert.doesNotMatch(src, /deleteAccount\([^)]*parsed\.data\.deviceId/);
    assert.match(src, /linkedDeviceIdsForUser|P2-1/);
  });
});
