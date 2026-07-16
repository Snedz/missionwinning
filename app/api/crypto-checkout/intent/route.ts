/**
 * Create a Solana USDC lifetime payment intent (Phantom).
 * Auth: session | Rate: 8/min | See: docs/PHANTOM_USDC_CHECKOUT.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { clientIp } from '@/lib/clientIp';
import { createPaymentIntent } from '@/lib/cryptoCheckout/intent';
import { getSolanaRpcUrl } from '@/lib/cryptoCheckout/constants';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

export const POST = withApiLogging('crypto-checkout/intent', async (req: NextRequest) => {
  const limited = await rateLimitAsync(`crypto-intent:${clientIp(req)}`, 8, 60_000);
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
  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: 'Sign in required', code: 'auth_required' },
      { status: 401 }
    );
  }

  const result = await createPaymentIntent({
    userId: user.id,
    email: user.email,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    intentId: result.intent.id,
    reference: result.intent.reference_pubkey,
    treasury: result.treasury,
    amountUsdc: Number(result.intent.amount_usdc),
    expiresAt: result.intent.expires_at,
    rpcUrl: getSolanaRpcUrl(),
  });
});
