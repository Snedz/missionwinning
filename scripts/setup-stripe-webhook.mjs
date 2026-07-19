#!/usr/bin/env node
/**
 * Create (or reuse) a Stripe webhook endpoint for Mission Winning enrollments
 * and print the signing secret for Vercel.
 *
 * Requires: STRIPE_SECRET_KEY (sk_test_… or sk_live_…)
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_… node scripts/setup-stripe-webhook.mjs
 *   STRIPE_SECRET_KEY=sk_test_… node scripts/setup-stripe-webhook.mjs --url https://www.missionwinning.com/api/stripe-webhook
 *
 * Then:
 *   printf '%s' "$WHSEC" | vercel env add STRIPE_WEBHOOK_SECRET production --force
 *   # redeploy Production
 *   STRIPE_WEBHOOK_SECRET=$WHSEC SMOKE_BASE_URL=https://www.missionwinning.com \
 *     node scripts/verify-stripe-enrollment.mjs --ping-webhook
 */
const DEFAULT_URL = 'https://www.missionwinning.com/api/stripe-webhook';
const EVENT = 'checkout.session.completed';

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

async function stripe(path, { method = 'GET', body } = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('STRIPE_SECRET_KEY required');
    process.exit(1);
  }
  const headers = {
    Authorization: `Bearer ${key}`,
  };
  let payload;
  if (body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    payload = new URLSearchParams(body).toString();
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers,
    body: payload,
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message || JSON.stringify(json);
    throw new Error(`Stripe ${method} ${path} → ${res.status}: ${msg}`);
  }
  return json;
}

async function main() {
  const url = argValue('--url', process.env.STRIPE_WEBHOOK_URL || DEFAULT_URL);

  const listed = await stripe('/webhook_endpoints?limit=100');
  const existing = (listed.data || []).find(
    (ep) => ep.url === url && Array.isArray(ep.enabled_events) && ep.enabled_events.includes(EVENT)
  );

  if (existing) {
    console.log(`Found existing endpoint ${existing.id} → ${existing.url}`);
    console.log('Stripe does not re-expose signing secrets for existing endpoints.');
    console.log('Rotate in Dashboard → Developers → Webhooks → Reveal, or delete and re-run this script.');
    console.log(`Dashboard: https://dashboard.stripe.com/webhooks/${existing.id}`);
    process.exit(0);
  }

  const created = await stripe('/webhook_endpoints', {
    method: 'POST',
    body: {
      url,
      'enabled_events[]': EVENT,
      description: 'Mission Winning enrollments',
    },
  });

  const secret = created.secret || '';
  console.log(`Created webhook ${created.id}`);
  console.log(`URL: ${created.url}`);
  console.log(`Secret length: ${secret.length} (prefix ${secret.slice(0, 6)})`);
  console.log('');
  console.log('Add to Vercel Production (do not commit):');
  console.log('  printf \'%s\' \'<whsec>\' | vercel env add STRIPE_WEBHOOK_SECRET production --force');
  console.log('Then redeploy and:');
  console.log(
    '  STRIPE_WEBHOOK_SECRET=<whsec> SMOKE_BASE_URL=https://www.missionwinning.com node scripts/verify-stripe-enrollment.mjs --ping-webhook'
  );

  if (secret) {
    // Write once for operator piping; file is local tmp-style path under cwd? Prefer stdout machine line.
    console.log(`WHSEC=${secret}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
