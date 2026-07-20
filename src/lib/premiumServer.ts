/**
 * Server-only premium checks and webhook enrollment grants.
 * Consumers: /api/premium/*, webhooks | See: docs/API.md
 */
import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  getCachedPremiumFlag,
  invalidatePremiumEnrollmentCache,
  setCachedPremiumFlag,
} from '@/lib/premiumEnrollmentCache';

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

  const cached = await getCachedPremiumFlag(userId, email);
  if (cached !== null) return cached;

  const admin = getSupabaseAdmin();
  if (!admin) return false;

  let premium = false;

  if (userId) {
    const { data } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .or('premium_granted.eq.true,status.eq.active')
      .limit(1);
    if (data?.length) premium = true;
  }

  if (!premium && email) {
    const normalized = email.trim().toLowerCase();
    const { data } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_email', normalized)
      .or('premium_granted.eq.true,status.eq.active')
      .limit(1);
    if (data?.length) premium = true;
  }

  await setCachedPremiumFlag(userId, email, premium);
  return premium;
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
  const uid = payload.user_id?.trim();
  // enrollments.user_id references auth.users — only set when it looks like a UUID
  if (uid && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uid)) {
    row.user_id = uid;
  }

  let { error } = await admin.from('enrollments').insert(row);

  // Payment Link / test pings may send a UUID that is not an auth user yet — fall back to email-only
  if (error && row.user_id && (error.code === '23503' || /foreign key|auth\.users/i.test(error.message || ''))) {
    delete row.user_id;
    ({ error } = await admin.from('enrollments').insert(row));
  }

  if (error) throw error;

  await invalidatePremiumEnrollmentCache(
    typeof row.user_id === 'string' ? row.user_id : payload.user_id,
    payload.user_email
  );

  return { duplicate: false };
}
