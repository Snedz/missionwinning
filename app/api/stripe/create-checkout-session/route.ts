import { NextRequest, NextResponse } from 'next/server';
import {
  createStripeCheckoutSession,
  isStripeCheckoutConfigured,
} from '@/lib/stripeCheckout';
import type { BundlePlanId } from '@/lib/bundleConfig';

const VALID_PLANS: BundlePlanId[] = ['3mo', '12mo', 'lifetime'];

/**
 * Server-side Stripe Checkout for Super Bundle plan tiers.
 * Requires STRIPE_SECRET_KEY + STRIPE_PRICE_ID_BUNDLE_* (or STRIPE_PRICE_ID_SUPER_BUNDLE).
 */
export async function POST(req: NextRequest) {
  if (!isStripeCheckoutConfigured()) {
    return NextResponse.json(
      {
        error:
          'Stripe Checkout API not configured. Set STRIPE_SECRET_KEY and price IDs, or use payment links.',
      },
      { status: 503 }
    );
  }

  let body: { planId?: string; email?: string };
  try {
    body = (await req.json()) as { planId?: string; email?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const planId = body.planId as BundlePlanId | undefined;
  if (!planId || !VALID_PLANS.includes(planId)) {
    return NextResponse.json(
      { error: 'planId required — one of 3mo, 12mo, lifetime' },
      { status: 400 }
    );
  }

  try {
    const session = await createStripeCheckoutSession({
      planId,
      customerEmail: body.email,
    });
    return NextResponse.json(session);
  } catch (e) {
    console.error('Stripe create-checkout-session error:', e);
    const message = e instanceof Error ? e.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
