/**
 * Open Stripe Customer Portal for manage/cancel.
 * Auth: session (signed-in) | Rate: 10/min | See: docs/STRIPE_PREMIUM_SETUP.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createBillingPortalSession } from '@/lib/checkoutServer';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

export const POST = withApiLogging('billing-portal', async (req: NextRequest) => {
  const limited = await rateLimitAsync(`billing-portal:${clientIp(req)}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) },
      }
    );
  }

  const user = await getUserFromRequest(req);
  if (!user?.email) {
    return NextResponse.json(
      { error: 'Sign in required', code: 'auth_required' },
      { status: 401 }
    );
  }

  const result = await createBillingPortalSession(user.email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ url: result.url });
});
