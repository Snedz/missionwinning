import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type YouthConsentServerRecord = {
  userId: string;
  parentEmail: string;
  childAge: number;
  verifiedAt: string;
};

export async function persistYouthConsent(
  userId: string,
  parentEmail: string,
  childAge: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: 'not_configured' };

  const { error } = await admin.from('youth_consent_records').upsert(
    {
      user_id: userId,
      parent_email: parentEmail.trim().toLowerCase(),
      child_age: childAge,
      verified_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchYouthConsent(userId: string): Promise<YouthConsentServerRecord | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin
    .from('youth_consent_records')
    .select('user_id, parent_email, child_age, verified_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    userId: data.user_id,
    parentEmail: data.parent_email,
    childAge: data.child_age,
    verifiedAt: data.verified_at,
  };
}
