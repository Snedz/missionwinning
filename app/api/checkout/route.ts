/**
 * Create a Stripe Checkout Session for Super Bundle.
 * Auth: session (signed-in) | Rate: 10/min | Territory hard block (Europe/OIC/CA)
 * See: docs/STRIPE_PREMIUM_SETUP.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { checkoutBodySchema, parseJsonBody } from '@/lib/apiSchemas';
import { createCheckoutSession } from '@/lib/checkoutServer';
import { clientIp } from '@/lib/clientIp';
import { hostedServiceAccessFromHeaders } from '@/lib/legal/supportedRegions';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

export const POST = withApiLogging('checkout', async (req: NextRequest) => {
  const limited = await rateLimitAsync(`checkout:${clientIp(req)}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) },
      }
    );
  }

  const territory = hostedServiceAccessFromHeaders(req.headers);
  if (!territory.allowed) {
    return NextResponse.json(
      {
        error: territory.message,
        code: territory.code,
        reason: territory.reason,
        country: territory.country,
      },
      { status: 403 }
    );
  }

  const user = await getUserFromRequest(req);
  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: 'Sign in required', code: 'auth_required' },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseJsonBody(checkoutBodySchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await createCheckoutSession({
    planId: parsed.data.planId,
    userId: user.id,
    email: user.email,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ url: result.url, sessionId: result.sessionId });
});
