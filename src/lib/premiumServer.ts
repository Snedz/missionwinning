import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export function isDemoPremiumEnabled(): boolean {
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const supabase = createClient(url, anon);

  if (userId) {
    const { data } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .or('premium_granted.eq.true,status.eq.active')
      .limit(1);
    if (data?.length) return true;
  }

  if (email) {
    const { data } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_email', email)
      .or('premium_granted.eq.true,status.eq.active')
      .limit(1);
    if (data?.length) return true;
  }

  return false;
}

/** Grant enrollment via service role (webhooks only). */
export async function grantEnrollmentFromWebhook(payload: {
  user_email: string;
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

  const { error } = await admin.from('enrollments').insert({
    user_email: payload.user_email,
    product_id: payload.product_id ?? 'super-bundle',
    plan: 'bundle',
    status: 'active',
    premium_granted: true,
    provider: payload.provider,
    external_id: payload.external_id,
  });

  if (error) throw error;
  return { duplicate: false };
}
