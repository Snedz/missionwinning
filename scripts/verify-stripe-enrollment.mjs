#!/usr/bin/env node
/**
 * Stripe enrollment + premium gate verification.
 *
 * Usage:
 *   node scripts/verify-stripe-enrollment.mjs
 *   SMOKE_BASE_URL=https://www.missionwinning.com node scripts/verify-stripe-enrollment.mjs --check-gates
 *   STRIPE_WEBHOOK_SECRET=whsec_... node scripts/verify-stripe-enrollment.mjs --ping-webhook
 *   node scripts/verify-stripe-enrollment.mjs --check-checkout
 *   node scripts/verify-stripe-enrollment.mjs --check-crypto-checkout
 *
 * --check-gates  Assert premium APIs reject unauthenticated callers (403).
 * --ping-webhook Send a signed test checkout.session.completed payload.
 * --check-checkout  POST /api/checkout without session → expect 401 (or 503 if Sessions unset).
 * --check-crypto-checkout  POST /api/crypto-checkout/* without session → expect 401/503.
 * --verify-enrollment <email>  Query Supabase enrollments for a buyer email.
 */
const base = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const ENROLLMENT_ROW = {
  user_email: 'buyer@example.com',
  user_id: 'uuid-optional-from-checkout-session',
  product_id: 'super-bundle',
  plan: 'bundle',
  status: 'active',
  premium_granted: true,
  provider: 'stripe',
  external_id: 'cs_test_...',
};

const PREMIUM_ROUTES = [
  '/api/premium/recipes',
  '/api/premium/programs',
  '/api/premium/mind',
  '/api/premium/mobility',
  '/api/premium/guidebook',
];

async function checkPremiumGates() {
  let failed = false;
  console.log(`Checking premium API gates at ${base} …\n`);

  for (const path of PREMIUM_ROUTES) {
    const res = await fetch(`${base}${path}`, { method: 'GET' });
    const ok = res.status === 403;
    console.log(`${ok ? '✓' : '✗'} GET ${path} → ${res.status}${ok ? '' : ' (expected 403)'}`);
    if (!ok) failed = true;
  }

  const statusRes = await fetch(`${base}/api/premium/status`, { method: 'GET' });
  let statusBody;
  try {
    statusBody = await statusRes.json();
  } catch {
    statusBody = {};
  }
  const statusOk =
    statusRes.status === 200 &&
    statusBody.premium === false &&
    (statusBody.source === 'anonymous' || statusBody.source === 'unconfigured');
  console.log(
    `${statusOk ? '✓' : '✗'} GET /api/premium/status → ${statusRes.status} premium=${statusBody.premium} source=${statusBody.source ?? '?'}`
  );
  if (!statusOk) failed = true;

  const sessionsOn = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT === 'true';
  const stripeLink =
    process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE || process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM;
  if (sessionsOn) {
    console.log('✓ NEXT_PUBLIC_STRIPE_CHECKOUT=true (Checkout Sessions preferred)');
  } else if (stripeLink) {
    console.log('✓ NEXT_PUBLIC_STRIPE_LINK_BUNDLE configured (Payment Link fallback)');
  } else {
    console.log(
      '⚠ Neither NEXT_PUBLIC_STRIPE_CHECKOUT nor Payment Links set — UnlockButton shows founders waitlist'
    );
  }

  if (process.env.STRIPE_SECRET_KEY) {
    console.log('✓ STRIPE_SECRET_KEY configured');
  } else {
    console.log('⚠ STRIPE_SECRET_KEY not set — /api/checkout returns 503');
  }

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('✓ STRIPE_WEBHOOK_SECRET configured');
  } else {
    console.log('⚠ STRIPE_WEBHOOK_SECRET not set — webhook returns 503');
  }

  if (failed) process.exit(1);
  console.log('\nPremium gates OK (unenrolled callers blocked on content APIs).\n');
}

async function checkCheckout() {
  console.log(`Checking POST /api/checkout at ${base} …\n`);
  const res = await fetch(`${base}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId: 'lifetime' }),
  });
  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  // Unauthenticated: 401. Sessions unconfigured after auth would be 503 — without session always 401.
  const ok = res.status === 401 || res.status === 503;
  console.log(
    `${ok ? '✓' : '✗'} POST /api/checkout → ${res.status} ${JSON.stringify(body).slice(0, 120)}`
  );
  if (!ok) process.exit(1);

  const portalRes = await fetch(`${base}/api/billing-portal`, { method: 'POST' });
  const portalOk = portalRes.status === 401 || portalRes.status === 503;
  console.log(
    `${portalOk ? '✓' : '✗'} POST /api/billing-portal → ${portalRes.status} (expect 401 without session)`
  );
  if (!portalOk) process.exit(1);

  console.log('\nCheckout routes respond as expected without a session.\n');
}

async function checkCryptoCheckout() {
  console.log(`Checking POST /api/crypto-checkout/* at ${base} …\n`);

  const intentRes = await fetch(`${base}/api/crypto-checkout/intent`, { method: 'POST' });
  let intentBody;
  try {
    intentBody = await intentRes.json();
  } catch {
    intentBody = {};
  }
  const intentOk = intentRes.status === 401 || intentRes.status === 503;
  console.log(
    `${intentOk ? '✓' : '✗'} POST /api/crypto-checkout/intent → ${intentRes.status} ${JSON.stringify(intentBody).slice(0, 120)}`
  );
  if (!intentOk) process.exit(1);

  const confirmRes = await fetch(`${base}/api/crypto-checkout/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intentId: '00000000-0000-4000-8000-000000000000',
      signature: '1111111111111111111111111111111111111111111111111111111111111111',
    }),
  });
  const confirmOk = confirmRes.status === 401 || confirmRes.status === 503 || confirmRes.status === 400;
  console.log(
    `${confirmOk ? '✓' : '✗'} POST /api/crypto-checkout/confirm → ${confirmRes.status} (expect 401 without session)`
  );
  if (!confirmOk) process.exit(1);

  if (process.env.NEXT_PUBLIC_CRYPTO_CHECKOUT === 'true') {
    console.log('✓ NEXT_PUBLIC_CRYPTO_CHECKOUT=true');
  } else {
    console.log('· NEXT_PUBLIC_CRYPTO_CHECKOUT unset — Phantom CTA hidden');
  }

  console.log('\nCrypto checkout routes respond as expected without a session.\n');
}

async function pingWebhook() {
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
        client_reference_id: 'verify-user-id',
        metadata: { product_id: 'super-bundle', user_id: 'verify-user-id', plan_id: 'lifetime' },
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
  console.log('\nWebhook accepted. Confirm Supabase enrollments row for verify-test@missionwinning.com\n');
}

async function verifyEnrollment(email) {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(
    /\/$/,
    ''
  );
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_SERVICE_ROLE_KEY + URL required for --verify-enrollment');
    process.exit(1);
  }

  const res = await fetch(
    `${url}/rest/v1/enrollments?user_email=eq.${encodeURIComponent(email)}&select=user_email,user_id,product_id,premium_granted,status,provider,external_id&order=created_at.desc&limit=1`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    }
  );

  if (!res.ok) {
    console.error(`enrollments query failed: HTTP ${res.status}`);
    process.exit(1);
  }

  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error(`No enrollment row for ${email}`);
    process.exit(1);
  }

  const row = rows[0];
  const ok =
    row.premium_granted === true &&
    row.status === 'active' &&
    (row.product_id === 'super-bundle' || String(row.product_id || '').includes('bundle'));

  console.log('Latest enrollment row:\n');
  console.log(JSON.stringify(row, null, 2));
  if (!ok) {
    console.error('\nEnrollment row missing premium_granted=true or active status.');
    process.exit(1);
  }
  console.log(`\n✓ Enrollment verified for ${email}\n`);
}

async function main() {
  const ping = process.argv.includes('--ping-webhook');
  const checkGates = process.argv.includes('--check-gates');
  const checkCheckoutFlag = process.argv.includes('--check-checkout');
  const checkCryptoFlag = process.argv.includes('--check-crypto-checkout');
  const verifyIdx = process.argv.indexOf('--verify-enrollment');
  const verifyEmail = verifyIdx >= 0 ? process.argv[verifyIdx + 1] : null;

  if (verifyEmail) {
    await verifyEnrollment(verifyEmail);
    return;
  }

  if (checkGates) {
    await checkPremiumGates();
    return;
  }

  if (checkCheckoutFlag) {
    await checkCheckout();
    return;
  }

  if (checkCryptoFlag) {
    await checkCryptoCheckout();
    return;
  }

  console.log('Expected Supabase enrollments row after checkout.session.completed:\n');
  console.log(JSON.stringify(ENROLLMENT_ROW, null, 2));
  console.log('\nPremium gate: GET /api/premium/status (signed-in cookie) → { premium: true }');
  console.log(`Coach unlock: ${base}/coach — useCoachPlan locked=false when premium`);
  console.log(`Bundle return: ${base}/bundle?checkout=success\n`);

  if (ping) {
    await pingWebhook();
    return;
  }

  console.log('Next steps:');
  console.log('  --check-gates          Verify premium APIs return 403 without enrollment');
  console.log('  --check-checkout       POST /api/checkout + /api/billing-portal without session');
  console.log('  --check-crypto-checkout  POST /api/crypto-checkout/* without session');
  console.log('  --ping-webhook         Send signed test event (needs STRIPE_WEBHOOK_SECRET)');
  console.log('  --verify-enrollment <email>  Confirm Supabase enrollments row after purchase');
  console.log('  Or use Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe-webhook');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
