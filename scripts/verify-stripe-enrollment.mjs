#!/usr/bin/env node
/**
 * Stripe enrollment verification helper.
 *
 * Usage:
 *   SMOKE_BASE_URL=https://www.missionwinning.com node scripts/verify-stripe-enrollment.mjs
 *   STRIPE_WEBHOOK_SECRET=whsec_... node scripts/verify-stripe-enrollment.mjs --ping-webhook
 *
 * --ping-webhook sends a signed test payload (Stripe CLI recommended for real events).
 * Without flags, prints expected enrollments row shape and premium status check URLs.
 */
const base = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const ENROLLMENT_ROW = {
  user_email: 'buyer@example.com',
  product_id: 'super-bundle',
  plan: 'bundle',
  status: 'active',
  premium_granted: true,
  provider: 'stripe',
  external_id: 'cs_test_...',
};

async function main() {
  const ping = process.argv.includes('--ping-webhook');

  console.log('Expected Supabase enrollments row after checkout.session.completed:\n');
  console.log(JSON.stringify(ENROLLMENT_ROW, null, 2));
  console.log('\nPremium gate: GET /api/premium/status (signed-in cookie) → { premium: true }');
  console.log(`Coach unlock: ${base}/coach — useCoachPlan locked=false when premium\n`);

  if (!ping) {
    console.log('Tip: run with --ping-webhook after setting STRIPE_WEBHOOK_SECRET (or use Stripe CLI:');
    console.log('  stripe listen --forward-to localhost:3000/api/stripe-webhook)');
    return;
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET required for --ping-webhook');
    process.exit(1);
  }

  const payload = JSON.stringify({
    id: 'evt_verify_test',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_verify_test',
        customer_email: 'verify-test@missionwinning.com',
        metadata: { product_id: 'super-bundle' },
      },
    },
  });

  const crypto = await import('node:crypto');
  const timestamp = Math.floor(Date.now() / 1000);
  const signed = `${timestamp}.${payload}`;
  const sig = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  const header = `t=${timestamp},v1=${sig}`;

  const res = await fetch(`${base}/api/stripe-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': header,
    },
    body: payload,
  });

  const text = await res.text();
  console.log(`Webhook POST ${res.status}: ${text.slice(0, 200)}`);
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
