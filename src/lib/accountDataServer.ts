/**
 * Account data export (GDPR Art. 20) + deletion (Art. 17) — the executor.
 *
 * Table fates live in `accountDataRegistry.ts` (pure data, unit-guarded for
 * completeness against `supabase/migrations`); this module is `server-only`
 * and is pinned by `accountDataServer.routetest.ts`.
 *
 * Deletion needs NO migration: every user-keyed table already declares
 * `references auth.users(id) on delete cascade`, so `auth.admin.deleteUser`
 * cascades them. Only email-keyed rows (a lead has no user_id) and anonymous
 * device rows need explicit cleanup — and they run FIRST, because the email
 * is unrecoverable once the auth user is gone.
 */
import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  EMAIL_ONLY_TABLES,
  EXPORT_ROW_CAP,
  EXPORT_TABLES,
  type ExportTableSpec,
} from '@/lib/accountDataRegistry';

export { EMAIL_ONLY_TABLES, EXPORT_ROW_CAP, EXPORT_TABLES };

export type AccountExport = {
  app: 'mission-winning';
  exportedAt: string;
  userId: string;
  email: string | null;
  tables: Record<string, { rows: Record<string, unknown>[]; truncated: boolean }>;
};

/**
 * Export always filters by the server-verified user — never by a
 * client-supplied device id, which a session cannot prove ownership of.
 * Delete matches: anonymous device rows are cleaned only for device ids
 * already stored on this user (P2-1).
 */

const DEVICE_LINK_TABLES = ['push_subscriptions', 'llm_usage'] as const;

async function linkedDeviceIdsForUser(
  admin: SupabaseClient,
  userId: string
): Promise<{ ok: true; ids: string[] } | { ok: false; step: string }> {
  const ids = new Set<string>();
  for (const table of DEVICE_LINK_TABLES) {
    const { data, error } = await admin.from(table).select('device_id').eq('user_id', userId);
    if (error) return { ok: false, step: `device_link_${table}` };
    for (const row of data ?? []) {
      const id = typeof (row as { device_id?: unknown }).device_id === 'string'
        ? (row as { device_id: string }).device_id.trim()
        : '';
      if (id) ids.add(id);
    }
  }
  return { ok: true, ids: [...ids] };
}

function ownershipColumn(spec: ExportTableSpec): 'id' | 'user_id' {
  return spec.match === 'id' ? 'id' : 'user_id';
}

function redactRow(row: Record<string, unknown>, redact?: readonly string[]) {
  if (!redact?.length) return row;
  const out = { ...row };
  for (const col of redact) delete out[col];
  return out;
}

export async function exportAccountData(
  admin: SupabaseClient,
  userId: string,
  email: string | null
): Promise<AccountExport> {
  const tables: AccountExport['tables'] = {};
  for (const spec of EXPORT_TABLES) {
    const { data, error } = await admin
      .from(spec.table)
      .select('*')
      .eq(ownershipColumn(spec), userId)
      .limit(EXPORT_ROW_CAP + 1);
    if (error) {
      throw new Error(`export failed on ${spec.table}`);
    }
    const rows = (data ?? []) as Record<string, unknown>[];
    tables[spec.table] = {
      rows: rows.slice(0, EXPORT_ROW_CAP).map((r) => redactRow(r, spec.redact)),
      truncated: rows.length > EXPORT_ROW_CAP,
    };
  }

  // Email-keyed PI is not on auth.users — CCPA access must still include it.
  if (email) {
    for (const table of EMAIL_ONLY_TABLES) {
      const { data, error } = await admin
        .from(table)
        .select('*')
        .eq('email', email)
        .limit(EXPORT_ROW_CAP + 1);
      if (error) {
        throw new Error(`export failed on ${table}`);
      }
      const rows = (data ?? []) as Record<string, unknown>[];
      tables[table] = {
        rows: rows.slice(0, EXPORT_ROW_CAP),
        truncated: rows.length > EXPORT_ROW_CAP,
      };
    }

    const orphans = await admin
      .from('enrollments')
      .select('*')
      .is('user_id', null)
      .eq('user_email', email)
      .limit(EXPORT_ROW_CAP + 1);
    if (orphans.error) {
      throw new Error('export failed on enrollments');
    }
    const existing = tables.enrollments ?? { rows: [], truncated: false };
    const seen = new Set(existing.rows.map((r) => String(r.id ?? '')));
    const extra = ((orphans.data ?? []) as Record<string, unknown>[]).filter(
      (r) => !seen.has(String(r.id ?? ''))
    );
    const merged = [...existing.rows, ...extra];
    tables.enrollments = {
      rows: merged.slice(0, EXPORT_ROW_CAP),
      truncated: existing.truncated || merged.length > EXPORT_ROW_CAP,
    };
  }

  return {
    app: 'mission-winning',
    exportedAt: new Date().toISOString(),
    userId,
    email,
    tables,
  };
}

/**
 * Delete the account and everything keyed to it.
 *
 * Order is load-bearing: email cleanups run before `deleteUser` because the
 * address is unrecoverable once the auth row is gone. Any failure aborts —
 * the caller must never report success on a partial deletion.
 */
export async function deleteAccount(
  admin: SupabaseClient,
  userId: string,
  email: string | null
): Promise<{ ok: true } | { ok: false; step: string }> {
  if (email) {
    const leads = await admin.from('leads').delete().eq('email', email);
    if (leads.error) return { ok: false, step: 'leads' };

    const recovery = await admin.from('checkout_recovery').delete().eq('email', email);
    if (recovery.error) return { ok: false, step: 'checkout_recovery' };

    // Anonymize, not delete: the invite row is funnel history keyed by code;
    // stripping the address removes the personal data (signed_up_user_id
    // nulls itself via FK when the auth user goes).
    const invites = await admin.from('beta_invites').update({ email: null }).eq('email', email);
    if (invites.error) return { ok: false, step: 'beta_invites' };

    const orphanEnrollments = await admin
      .from('enrollments')
      .delete()
      .is('user_id', null)
      .eq('user_email', email);
    if (orphanEnrollments.error) return { ok: false, step: 'enrollments' };
  }

  const linked = await linkedDeviceIdsForUser(admin, userId);
  if (!linked.ok) return linked;

  for (const deviceId of linked.ids) {
    // Anonymous device rows carry no user_id, so the cascade cannot reach them.
    const push = await admin
      .from('push_subscriptions')
      .delete()
      .is('user_id', null)
      .eq('device_id', deviceId);
    if (push.error) return { ok: false, step: 'push_subscriptions' };

    const llm = await admin
      .from('llm_usage')
      .delete()
      .is('user_id', null)
      .eq('device_id', deviceId);
    if (llm.error) return { ok: false, step: 'llm_usage' };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, step: 'auth_user' };
  return { ok: true };
}
