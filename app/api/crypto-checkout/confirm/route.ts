/**
 * Confirm Phantom USDC lifetime payment and grant premium.
 * Auth: session | Rate: 10/min | Territory hard block | Schema: cryptoCheckoutConfirmSchema
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { cryptoCheckoutConfirmSchema, parseJsonBody } from '@/lib/apiSchemas';
import { clientIp } from '@/lib/clientIp';
import { confirmCryptoPayment } from '@/lib/cryptoCheckout/confirm';
import { hostedServiceAccessFromHeaders } from '@/lib/legal/supportedRegions';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

export const POST = withApiLogging('crypto-checkout/confirm', async (req: NextRequest) => {
  const limited = await rateLimitAsync(`crypto-confirm:${clientIp(req)}`, 10, 60_000);
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

  const parsed = parseJsonBody(cryptoCheckoutConfirmSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await confirmCryptoPayment({
    userId: user.id,
    intentId: parsed.data.intentId,
    signature: parsed.data.signature,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, duplicate: result.duplicate ?? false });
});
