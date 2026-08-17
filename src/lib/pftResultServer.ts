import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { buildPftResultRow, type PftResultSubmitInput } from '@/lib/pftResultRow';

export type StorePftResultResult =
  | { ok: true; stored: boolean }
  | { ok: false; status: number };

/** Service-role insert. Caller must have already resolved the session user id. */
export async function storePftResult(
  userId: string,
  input: PftResultSubmitInput
): Promise<StorePftResultResult> {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: true, stored: false };

  const row = buildPftResultRow(userId, input);
  const { error } = await admin.from('fitness_test_results').insert(row);
  if (error) {
    console.error('[pft/results] %s', error.message);
    return { ok: false, status: 500 };
  }
  return { ok: true, stored: true };
}
