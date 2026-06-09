import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Placeholder webhook for future payment processor fulfillment (Super Bundle + premium pillars).
// Core mission (tracker etc.) is free forever per vision.md.
//
// Currently inactive (demo/request-based payments while finalizing business setup / LLC).
// When a processor (PayPal, Stripe, etc.) is connected:
// - Point its webhook here (prod URL).
// - Handle one-time/recurring events, grant access via Supabase, send fulfillment emails.
//
// The route and Supabase logic are ready. For now the app works fully in demo mode.

export async function POST(req: NextRequest) {
  const body = await req.text();

  // PayPal sends the event directly as JSON (different from Stripe's signed wrapper in basic mode)
  let event: any;
  try {
    event = JSON.parse(body);
  } catch (err) {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const eventType = event.event_type || event.type || '';

  // Success events for one-time captures and subscription activations
  const successEvents = [
    'PAYMENT.CAPTURE.COMPLETED',
    'CHECKOUT.ORDER.APPROVED',
    'BILLING.SUBSCRIPTION.ACTIVATED',
    'BILLING.SUBSCRIPTION.CREATED',
  ];

  if (successEvents.includes(eventType)) {
    // PayPal payload structure is under `resource`
    const resource = event.resource || event;
    const payer = resource.payer || {};
    const email =
      payer.email_address ||
      resource.payer_email ||
      (resource.subscriber && resource.subscriber.email_address) ||
      '';

    const amount =
      resource.amount?.value ||
      (resource.purchase_units && resource.purchase_units[0]?.amount?.value) ||
      resource.billing_info?.outstanding_balance?.value ||
      '0';

    const productId =
      resource.custom_id ||
      (resource.purchase_units && resource.purchase_units[0]?.custom_id) ||
      'paypal-program-or-premium';

    // Server-side grant
    if (email && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        await supabase.from('enrollments').insert({
          id: undefined,
          user_id: 'paypal-' + (resource.id || Date.now()),
          product_id: productId,
          purchased_at: new Date().toISOString(),
          premium_granted: true,
          pdf_urls: [],
        });

        // Fire-and-forget lead for analytics
        supabase
          .from('leads')
          .insert({
            email,
            goals: 'paypal-webhook-' + eventType,
            package_interest: productId,
          })
          .then(() => {}, () => {});
      } catch (e) {
        console.error('PayPal webhook Supabase grant error (demo continues):', e);
      }
    }

    // TODO: Trigger Resend email with PDFs + "premium unlocked" link to /log
    // import { Resend } from 'resend'; const resend = new Resend(process.env.RESEND_API_KEY);

    console.log(`[Mission Winning] PayPal webhook success for ${eventType} — premium granted for ${email || 'unknown'} (amount ${amount})`);

    return NextResponse.json({ received: true, granted: true });
  }

  // Always acknowledge so PayPal doesn't retry
  return NextResponse.json({ received: true });
}
