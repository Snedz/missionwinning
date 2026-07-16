/**
 * Server-only premium checks and webhook enrollment grants.
 * Consumers: /api/premium/*, webhooks | See: docs/API.md
 */
import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export function isDemoPremiumEnabled(): boolean {
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_PREMIUM === 'true') {
    console.error('[security] DEMO_PREMIUM=true is forbidden in production');
    return false;
  }
  return (
    process.env.DEMO_PREMIUM === 'true' ||
    (process.env.NODE_ENV === 'development' && process.env.DEMO_PREMIUM !== 'false')
  );
}

export async function isPremiumForUser(
  userId: string | null | undefined,
  email: string | null | undefined
): Promise<boolean> {
  if (isDemoPremiumEnabled()) return true;
  if (!userId && !email) return false;

  const admin = getSupabaseAdmin();
  if (!admin) return false;

  if (userId) {
    const { data } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .or('premium_granted.eq.true,status.eq.active')
      .limit(1);
    if (data?.length) return true;
  }

  if (email) {
    const normalized = email.trim().toLowerCase();
    const { data } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_email', normalized)
      .or('premium_granted.eq.true,status.eq.active')
      .limit(1);
    if (data?.length) return true;
  }

  return false;
}

/** Grant enrollment via service role (webhooks only). */
export async function grantEnrollmentFromWebhook(payload: {
  user_email: string;
  user_id?: string | null;
  product_id?: string;
  provider: string;
  external_id: string;
}) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');

  const { data: existing } = await admin
    .from('enrollments')
    .select('id')
    .eq('provider', payload.provider)
    .eq('external_id', payload.external_id)
    .limit(1);

  if (existing?.length) return { duplicate: true };

  const row: Record<string, unknown> = {
    user_email: payload.user_email.trim().toLowerCase(),
    product_id: payload.product_id ?? 'super-bundle',
    plan: 'bundle',
    status: 'active',
    premium_granted: true,
    provider: payload.provider,
    external_id: payload.external_id,
  };
  if (payload.user_id) {
    row.user_id = payload.user_id;
  }

  const { error } = await admin.from('enrollments').insert(row);

  if (error) throw error;
  return { duplicate: false };
}
