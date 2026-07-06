/**
 * Stripe checkout webhook — grant premium enrollment.
 * Auth: Stripe-Signature | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { grantEnrollmentFromWebhook } from '@/lib/premiumServer';
import { emailFromCheckoutSession } from '@/lib/stripeWebhook';
import { validateStripeWebhookRequest } from '@/lib/api/stripeWebhookAuth';

/**
 * Stripe webhook — requires signature verification before granting premium.
 * Set STRIPE_WEBHOOK_SECRET + SUPABASE_SERVICE_ROLE_KEY in production.
 */
export const POST = withApiLogging('stripe-webhook', async(req: NextRequest) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();

  const auth = validateStripeWebhookRequest(secret, sig, raw);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
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
});
