/**
 * PayPal subscription webhook.
 * Auth: PayPal transmission headers | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { grantEnrollmentFromWebhook } from '@/lib/premiumServer';
import {
  isPayPalWebhookConfigured,
  parsePayPalWebhookHeaders,
  verifyPayPalWebhookSignature,
} from '@/lib/paypalWebhook';

/**
 * PayPal webhook — verifies transmission signature before granting premium.
 * Requires PAYPAL_WEBHOOK_ID, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET.
 * Set PAYPAL_ENV=live for production API (default: sandbox).
 */
export const POST = withApiLogging('paypal-webhook', async(req: NextRequest) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    return NextResponse.json(
      { error: 'PayPal webhook not configured. Set PAYPAL_WEBHOOK_ID when LLC + PayPal ready.' },
      { status: 503 }
    );
  }

  if (!isPayPalWebhookConfigured()) {
    return NextResponse.json(
      {
        error:
          'PayPal API credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
      },
      { status: 503 }
    );
  }

  const headers = parsePayPalWebhookHeaders(req);
  if (!headers) {
    return NextResponse.json({ error: 'Missing or invalid PayPal transmission headers' }, { status: 401 });
  }

  const raw = await req.text();
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const verified = await verifyPayPalWebhookSignature(headers, event, webhookId);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid PayPal webhook signature' }, { status: 401 });
  }

  try {
    await handleVerifiedPayPalEvent(event);
  } catch (e) {
    console.error('PayPal webhook enrollment error:', e);
    return NextResponse.json({ error: 'Enrollment failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
});

async function handleVerifiedPayPalEvent(event: {
  event_type?: string;
  resource?: Record<string, unknown>;
}) {
  const successEvents = ['PAYMENT.CAPTURE.COMPLETED', 'BILLING.SUBSCRIPTION.ACTIVATED'];

  if (!successEvents.includes(event.event_type ?? '')) return;

  const resource = event.resource ?? {};
  const payer = (resource.payer as { email_address?: string }) ?? {};
  const email =
    payer.email_address ||
    (resource.subscriber as { email_address?: string } | undefined)?.email_address ||
    '';

  const externalId = String(resource.id ?? event.event_type);
  const productId = String(resource.custom_id ?? 'paypal-premium');

  if (email) {
    await grantEnrollmentFromWebhook({
      user_email: email,
      product_id: productId,
      provider: 'paypal',
      external_id: externalId,
    });
  }
}
