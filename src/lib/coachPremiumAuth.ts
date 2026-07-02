import 'server-only';
import type { NextRequest } from 'next/server';
import { isDemoPremiumEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

export async function getCoachPremiumAccess(request: NextRequest) {
  if (isDemoPremiumEnabled()) {
    return { premium: true, user: null as null };
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return { premium: false, user: null as null };
  }

  const premium = await isPremiumForUser(user.id, user.email ?? null);
  return { premium, user };
}
