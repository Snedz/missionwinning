/**
 * Mobile Super Bundle entitlement — Bearer-first (cookie fallback).
 * Mirrors /api/premium/status for native clients.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { bearerAccessToken } from '@/lib/mobileAccess';
import { isDemoPremiumEnabled, isPremiumBypassEnabled, isPremiumForUser } from '@/lib/premiumServer';
import { isFreeBetaPremiumUnlocked } from '@/lib/freeBeta';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';

export const GET = withApiLogging('mobile/premium/status', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-premium-status:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { premium: false, source: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } },
    );
  }

  if (isPremiumBypassEnabled()) {
    const source = isFreeBetaPremiumUnlocked()
      ? 'free_beta'
      : isDemoPremiumEnabled()
        ? 'demo'
        : 'free_beta';
    return NextResponse.json({ premium: true, source });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ premium: false, source: 'unconfigured' });
  }

  const accessToken =
    bearerAccessToken(request) ?? extractSupabaseAccessToken(request.cookies);
  if (!accessToken) {
    return NextResponse.json({ premium: false, source: 'anonymous' });
  }

  const supabase = createClient(url, anon);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.json({ premium: false, source: 'anonymous' });
  }

  const premium = await isPremiumForUser(user.id, user.email ?? null);
  return NextResponse.json({
    premium,
    source: premium ? 'enrollment' : 'free',
  });
});
