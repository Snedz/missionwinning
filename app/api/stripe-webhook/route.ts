/**
 * Stripe checkout webhook — grant premium enrollment.
 * Auth: Stripe-Signature | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { grantEnrollmentFromWebhook } from '@/lib/premiumServer';
import { emailFromCheckoutSession, verifyStripeSignature } from '@/lib/stripeWebhook';

/**
 * Stripe webhook — requires signature verification before granting premium.
 * Set STRIPE_WEBHOOK_SECRET + SUPABASE_SERVICE_ROLE_KEY in production.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 401 });
  }

  const raw = await req.text();
  if (!verifyStripeSignature(raw, sig, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object ?? {};
    const email = emailFromCheckoutSession(session as Parameters<typeof emailFromCheckoutSession>[0]);
    const sessionId = String(session.id ?? '');

    if (email && sessionId) {
      const meta = session.metadata as { product_id?: string } | undefined;
      const productId = meta?.product_id?.trim() || 'super-bundle';
      try {
        await grantEnrollmentFromWebhook({
          user_email: email,
          product_id: productId,
          provider: 'stripe',
          external_id: sessionId,
        });
      } catch (e) {
        console.error('Stripe webhook enrollment error:', e);
        return NextResponse.json({ error: 'Enrollment failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
