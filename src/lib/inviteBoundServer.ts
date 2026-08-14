/**
 * Service-role invite bind — used by session mint and /api/beta/invites/redeem.
 */
import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidInviteCode } from '@/lib/inviteCode';
import { inviteRedeemed } from '@/lib/inviteBound';

export async function loadInvitedVia(
  admin: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await admin.from('profiles').select('invited_via').eq('id', userId).maybeSingle();
  const via = data && typeof data.invited_via === 'string' ? data.invited_via : null;
  return via;
}

export async function profileInviteRedeemed(
  admin: SupabaseClient,
  userId: string
): Promise<boolean> {
  return inviteRedeemed(await loadInvitedVia(admin, userId));
}

export async function bindInviteToUser(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  codeRaw: string
): Promise<{ ok: true } | { ok: false; reason: 'invalid_code' | 'unknown_code' | 'write_failed' }> {
  const code = codeRaw.trim();
  if (!isValidInviteCode(code)) return { ok: false, reason: 'invalid_code' };

  const { data: invite } = await admin
    .from('beta_invites')
    .select('id, signed_up_user_id')
    .eq('code', code)
    .maybeSingle();

  if (!invite) return { ok: false, reason: 'unknown_code' };

  const { error } = await admin.from('profiles').update({ invited_via: code }).eq('id', user.id);
  if (error) {
    const { error: upErr } = await admin.from('profiles').upsert(
      {
        id: user.id,
        email: user.email ?? null,
        invited_via: code,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (upErr) return { ok: false, reason: 'write_failed' };
  }

  if (!invite.signed_up_user_id) {
    await admin
      .from('beta_invites')
      .update({ signed_up_user_id: user.id })
      .eq('id', invite.id)
      .is('signed_up_user_id', null);
  }

  return { ok: true };
}
