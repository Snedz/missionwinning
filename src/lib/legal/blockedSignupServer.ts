/**
 * Reap a blocked-region signup only when {@link blockedSignupDisposition} says so.
 */
import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BLOCKED_SIGNUP_OWNED_TABLES,
  blockedSignupDisposition,
} from './blockedSignup';

export async function accountHasOwnedCloudRows(
  admin: SupabaseClient,
  userId: string
): Promise<boolean | 'unknown'> {
  for (const table of BLOCKED_SIGNUP_OWNED_TABLES) {
    const { data, error } = await admin.from(table).select('id').eq('user_id', userId).limit(1);
    if (error) return 'unknown';
    if ((data ?? []).length > 0) return true;
  }
  return false;
}

export async function disposeBlockedTerritorySignup(
  admin: SupabaseClient,
  user: { id: string; created_at?: string | null }
): Promise<'reaped' | 'kept'> {
  const owned = await accountHasOwnedCloudRows(admin, user.id);
  const disposition = blockedSignupDisposition({
    createdAt: user.created_at,
    hasOwnedRows: owned === true,
    unknownOwnedRows: owned === 'unknown',
  });
  if (disposition !== 'reap') return 'kept';
  const { error } = await admin.auth.admin.deleteUser(user.id);
  return error ? 'kept' : 'reaped';
}
