/**
 * Lead-list unsubscribe — HMAC token (NUDGE_SECRET).
 * Auth: public token | Rate: 20/min/IP
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyLeadUnsubscribeToken } from '@/lib/emailServer';

export const GET = withApiLogging('leads/unsubscribe', async (req: NextRequest) => {
  const ip = clientIp(req);
  const limited = await rateLimitAsync(`leads-unsub:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return new NextResponse('Too many requests. Try again shortly.', {
      status: 429,
      headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) },
    });
  }

  const email = (req.nextUrl.searchParams.get('e') || '').trim().toLowerCase();
  const token = (req.nextUrl.searchParams.get('t') || '').trim();

  if (!email || !token || !verifyLeadUnsubscribeToken(email, token)) {
    return new NextResponse('Invalid or expired unsubscribe link.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin
      .from('leads')
      .update({ unsubscribed_at: new Date().toISOString() })
      .ilike('email', email);
    if (error) {
      console.error('leads unsubscribe error:', error);
    }
  }

  return new NextResponse(
    'You are unsubscribed from Mission Winning launch and waitlist emails. You can close this page.',
    {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }
  );
});
