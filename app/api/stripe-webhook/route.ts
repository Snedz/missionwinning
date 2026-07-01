import { NextRequest, NextResponse } from 'next/server';
import {
  parseStripeWebhookPayload,
  verifyStripeSignature,
} from '@/lib/stripeWebhook';
import { handleStripeWebhookEvent } from '@/lib/stripeWebhookHandler';

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

  const event = parseStripeWebhookPayload(raw);
  if (!event) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    await handleStripeWebhookEvent(event);
  } catch (e) {
    console.error('Stripe webhook enrollment error:', e);
    return NextResponse.json({ error: 'Enrollment failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
