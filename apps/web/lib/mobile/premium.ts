import 'server-only';
import { getSupabaseAdmin } from './supabaseAdmin';

export function isFreeBetaPremiumUnlocked() {
  return !['0', 'false', 'off'].includes(process.env.NEXT_PUBLIC_FREE_BETA?.trim().toLowerCase() ?? '');
}

export function isDemoPremiumEnabled() {
  return process.env.NODE_ENV !== 'production' &&
    (process.env.DEMO_PREMIUM === 'true' ||
      (process.env.NODE_ENV === 'development' && process.env.DEMO_PREMIUM !== 'false'));
}

export function isPremiumBypassEnabled() {
  return isDemoPremiumEnabled() || isFreeBetaPremiumUnlocked();
}

export async function isPremiumForUser(userId: string, email: string | null) {
  if (isPremiumBypassEnabled()) return true;
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const existing = (key: 'user_id' | 'user_email', value: string) => supabase
    .from('enrollments').select('id').eq(key, value)
    .or('premium_granted.eq.true,status.eq.active').limit(1);
  const { data } = await existing('user_id', userId);
  if (data?.length) return true;
  if (!email) return false;
  const fallback = await existing('user_email', email.trim().toLowerCase());
  return Boolean(fallback.data?.length);
}
