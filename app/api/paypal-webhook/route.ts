import { NextRequest, NextResponse } from 'next/server';
import { grantEnrollmentFromWebhook } from '@/lib/premiumServer';

/**
 * PayPal webhook — disabled until PAYPAL_WEBHOOK_ID + verification is configured.
 * Prevents forged premium grants (critical before public launch).
 */
export async function POST(req: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    return NextResponse.json(
      { error: 'PayPal webhook not configured. Set PAYPAL_WEBHOOK_ID when LLC + PayPal ready.' },
      { status: 503 }
    );
  }

  // TODO: Verify PayPal transmission signature (cert chain + PAYPAL-TRANSMISSION-SIG)
  // Until implemented, reject all requests rather than grant premium.
  return NextResponse.json(
    { error: 'PayPal signature verification not yet implemented' },
    { status: 501 }
  );
}

/** Reserved for verified PayPal handler after signature check passes. */
async function handleVerifiedPayPalEvent(event: {
  event_type?: string;
  resource?: Record<string, unknown>;
}) {
  const successEvents = [
    'PAYMENT.CAPTURE.COMPLETED',
    'BILLING.SUBSCRIPTION.ACTIVATED',
  ];

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
