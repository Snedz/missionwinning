/**
 * Stripe checkout webhook — grant premium enrollment.
 * Auth: Stripe-Signature | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { grantEnrollmentFromWebhook } from '@/lib/premiumServer';
import {
  emailFromCheckoutSession,
  userIdFromCheckoutSession,
  type StripeCheckoutSession,
} from '@/lib/stripeWebhook';
import { validateStripeWebhookRequest } from '@/lib/api/stripeWebhookAuth';

/**
 * Stripe webhook — requires signature verification before granting premium.
 * Set STRIPE_WEBHOOK_SECRET + SUPABASE_SERVICE_ROLE_KEY in production.
 * Prefer metadata.user_id from Checkout Sessions when present.
 */
export const POST = withApiLogging('stripe-webhook', async (req: NextRequest) => {
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
    const session = (event.data?.object ?? {}) as StripeCheckoutSession;
    const email = emailFromCheckoutSession(session);
    const userId = userIdFromCheckoutSession(session);
    const sessionId = String(session.id ?? '');

    if (email && sessionId) {
      const productId = session.metadata?.product_id?.trim() || 'super-bundle';
      try {
        await grantEnrollmentFromWebhook({
          user_email: email,
          user_id: userId,
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

  // Abandoned checkout — record only; email sent by nudges cron (keep webhook fast).
  if (event.type === 'checkout.session.expired') {
    const session = (event.data?.object ?? {}) as StripeCheckoutSession;
    const email = emailFromCheckoutSession(session);
    const sessionId = String(session.id ?? '');
    if (email && sessionId) {
      try {
        const { getSupabaseAdmin } = await import('@/lib/supabaseAdmin');
        const admin = getSupabaseAdmin();
        if (admin) {
          const plan =
            session.metadata?.product_id?.trim() ||
            session.metadata?.plan_id?.trim() ||
            'super-bundle';
          await admin.from('checkout_recovery').upsert(
            {
              session_id: sessionId,
              email: email.trim().toLowerCase(),
              plan,
              expired_at: new Date().toISOString(),
            },
            { onConflict: 'session_id' }
          );
        }
      } catch (e) {
        console.error('Stripe checkout.session.expired recovery upsert', e);
        // Do not 500 — Stripe will retry; missing recovery is non-fatal
      }
    }
  }

  return NextResponse.json({ received: true });
});
