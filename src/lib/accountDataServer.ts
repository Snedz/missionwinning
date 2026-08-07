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
  EXPORT_ROW_CAP,
  EXPORT_TABLES,
  type ExportTableSpec,
} from '@/lib/accountDataRegistry';

export { EXPORT_ROW_CAP, EXPORT_TABLES };

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
 * ('user_id_or_device' describes the DELETE story: anonymous rows for that
 * device are cleaned too, since the cascade cannot reach them.)
 */
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
  email: string | null,
  deviceId?: string
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

  if (deviceId) {
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
