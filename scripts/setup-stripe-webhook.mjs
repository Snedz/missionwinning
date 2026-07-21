#!/usr/bin/env node
/**
 * Create (or reuse) a Stripe webhook endpoint for Mission Winning enrollments
 * + dispute alerts, and print the signing secret for Vercel.
 *
 * Requires: STRIPE_SECRET_KEY (sk_test_… or sk_live_…)
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_… node scripts/setup-stripe-webhook.mjs
 *   STRIPE_SECRET_KEY=sk_test_… node scripts/setup-stripe-webhook.mjs --url https://www.missionwinning.com/api/stripe-webhook
 *
 * Existing endpoints: Stripe Dashboard → Developers → Webhooks → add missing
 * events from ENABLED_EVENTS below (script only creates new endpoints).
 *
 * Then:
 *   printf '%s' "$WHSEC" | vercel env add STRIPE_WEBHOOK_SECRET production --force
 *   # redeploy Production
 *   STRIPE_WEBHOOK_SECRET=$WHSEC SMOKE_BASE_URL=https://www.missionwinning.com \
 *     node scripts/verify-stripe-enrollment.mjs --ping-webhook
 */
const DEFAULT_URL = 'https://www.missionwinning.com/api/stripe-webhook';
const ENABLED_EVENTS = [
  'checkout.session.completed',
  'checkout.session.expired',
  'charge.dispute.created',
  'charge.dispute.updated',
  'charge.dispute.closed',
];

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

function hasAllEvents(ep) {
  const enabled = Array.isArray(ep.enabled_events) ? ep.enabled_events : [];
  if (enabled.includes('*')) return true;
  return ENABLED_EVENTS.every((e) => enabled.includes(e));
}

async function main() {
  const url = argValue('--url', process.env.STRIPE_WEBHOOK_URL || DEFAULT_URL);

  const listed = await stripe('/webhook_endpoints?limit=100');
  const existing = (listed.data || []).find((ep) => ep.url === url);

  if (existing) {
    console.log(`Found existing endpoint ${existing.id} → ${existing.url}`);
    if (hasAllEvents(existing)) {
      console.log('All required events already enabled.');
    } else {
      console.log('Missing events — add in Dashboard (or delete endpoint and re-run this script):');
      const enabled = Array.isArray(existing.enabled_events) ? existing.enabled_events : [];
      for (const e of ENABLED_EVENTS) {
        if (!enabled.includes('*') && !enabled.includes(e)) {
          console.log(`  - ${e}`);
        }
      }
    }
    console.log('Stripe does not re-expose signing secrets for existing endpoints.');
    console.log('Rotate in Dashboard → Developers → Webhooks → Reveal, or delete and re-run this script.');
    console.log(`Dashboard: https://dashboard.stripe.com/webhooks/${existing.id}`);
    process.exit(0);
  }

  const body = {
    url,
    description: 'Mission Winning enrollments + disputes',
  };
  ENABLED_EVENTS.forEach((e, i) => {
    body[`enabled_events[${i}]`] = e;
  });

  const created = await stripe('/webhook_endpoints', {
    method: 'POST',
    body,
  });

  const secret = created.secret || '';
  console.log(`Created webhook ${created.id}`);
  console.log(`URL: ${created.url}`);
  console.log(`Events: ${ENABLED_EVENTS.join(', ')}`);
  console.log(`Secret length: ${secret.length} (prefix ${secret.slice(0, 6)})`);
  console.log('');
  console.log('Add to Vercel Production (do not commit):');
  console.log('  printf \'%s\' \'<whsec>\' | vercel env add STRIPE_WEBHOOK_SECRET production --force');
  console.log('Then redeploy and:');
  console.log(
    '  STRIPE_WEBHOOK_SECRET=<whsec> SMOKE_BASE_URL=https://www.missionwinning.com node scripts/verify-stripe-enrollment.mjs --ping-webhook'
  );
  console.log('Also set FOUNDER_DIGEST_EMAIL for dispute email alerts.');

  if (secret) {
    console.log(`WHSEC=${secret}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
