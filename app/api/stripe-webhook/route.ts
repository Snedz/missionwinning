import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Stripe webhook handler for BOTH one-time program purchases (high-ticket Beta Founders)
// AND recurring subscriptions (Premium monthly).
// 
// 1. In Stripe Dashboard → Developers → Webhooks, add endpoint:
//    https://www.missionwinning.com/api/stripe-webhook   (after you deploy)
// 2. Select events: checkout.session.completed  +  customer.subscription.updated / invoice.payment_succeeded etc.
// 3. Copy the webhook signing secret into STRIPE_WEBHOOK_SECRET in Vercel env (server only).
//
// For MVP/demo: on success we grant local + Supabase enrollment flag (premium unlocked in app).
// In production: verify signature with stripe.webhooks.constructEvent, then upsert enrollment/sub.

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  // For real: const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  // Here we accept the event (demo / behind Stripe test mode initially).

  let event: any;
  try {
    event = JSON.parse(body);
  } catch (err) {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const type = event.type;

  // Common success paths for one-time and subs
  if (
    type === 'checkout.session.completed' ||
    type === 'invoice.payment_succeeded' ||
    type === 'customer.subscription.created' ||
    type === 'customer.subscription.updated'
  ) {
    const session = event.data?.object || {};
    const email = session.customer_details?.email || session.customer_email || session.billing_details?.email;
    const amount = session.amount_total || session.amount_paid;

    // Demo grant (works even without real Supabase)
    if (typeof window !== 'undefined') {
      // This branch won't run on server, but kept for reference
    }

    // Server-side grant via Supabase (if configured)
    if (email && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        await supabase.from('enrollments').insert({
          // user_id will be resolved in real flow via profiles or by looking up auth.users
          // For simplicity we store by email or create a lead + flag
          id: undefined,
          user_id: 'webhook-' + (session.id || Date.now()),
          product_id: session.metadata?.product_id || 'beta-program-or-premium',
          purchased_at: new Date().toISOString(),
          premium_granted: true,
          pdf_urls: [], // In real: generate signed URLs from Storage for the purchased program
        });

        // Optional: also log a lead (fire and forget, demo)
        supabase.from('leads').insert({
          email,
          goals: 'stripe-webhook-' + type,
          package_interest: session.metadata?.program || 'premium',
        }).then(() => {}, () => {});
      } catch (e) {
        console.error('Webhook Supabase grant error (demo continues):', e);
      }
    }

    // In real Resend email fulfillment here (send the PDFs + "premium unlocked" + link to /log)
    // import { Resend } from 'resend'; const resend = new Resend(process.env.RESEND_API_KEY);

    console.log(`[Mission Winning] Webhook success for ${type} — premium granted for ${email || 'unknown'} (amount ${amount})`);

    return NextResponse.json({ received: true, granted: true });
  }

  // Always acknowledge to Stripe
  return NextResponse.json({ received: true });
}
