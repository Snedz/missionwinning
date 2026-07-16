#!/usr/bin/env node
/**
 * Quick env sanity check — run: npm run check-env
 * Production launch: npm run check-env -- --launch
 * Does not print secret values.
 */
const launch = process.argv.includes('--launch');

const required = [
  ['PRIVATE_ACCESS_SECRET', 'Private gate password (Vercel + .env.local)'],
  ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase project URL'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anon key'],
];

const launchRequired = [
  ['SUPABASE_SERVICE_ROLE_KEY', 'Webhooks, enrollments, admin APIs'],
  ['STRIPE_WEBHOOK_SECRET', 'Stripe checkout.session.completed'],
  ['YOUTH_CONSENT_SECRET', 'Dedicated — never reuse PRIVATE_ACCESS_SECRET'],
  ['NUDGE_SECRET', 'Journey email unsubscribe HMAC'],
];

const launchRecommended = [
  ['CRON_SECRET', 'Vercel cron auth for /api/cron/* (reminders)'],
  ['STRIPE_SECRET_KEY', 'Checkout Sessions + Billing Portal'],
  ['STRIPE_PRICE_BUNDLE_12MO', 'Founders annual Price ID'],
  ['STRIPE_PRICE_BUNDLE_LIFETIME', 'Founders lifetime Price ID'],
  ['NEXT_PUBLIC_STRIPE_CHECKOUT', 'true when Sessions are live'],
  ['NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME', 'Founders lifetime payment link (fallback)'],
];

const optional = [
  ['PRIVATE_MODE', 'true/false — gate on in production by default'],
  ['PRIVATE_ALLOW_AUTH_BYPASS', 'Leave unset/false — magic link should not bypass gate'],
  ['DEMO_PREMIUM', 'Must be false (or unset) in production'],
  ['BETA_ADMIN_EMAILS', 'Comma-separated founder emails for beta panel'],
  ['RESEND_API_KEY', 'Parent consent + nudge emails'],
  ['CRON_SECRET', 'Vercel cron auth for reminder nudges'],
  ['UPSTASH_REDIS_REST_URL', 'Distributed rate limits (recommended prod)'],
  ['UPSTASH_REDIS_REST_TOKEN', 'Paired with UPSTASH_REDIS_REST_URL'],
  ['STRIPE_PRICE_BUNDLE_MONTHLY', 'Monthly Super Bundle Price ID'],
  ['NEXT_PUBLIC_STRIPE_LINK_BUNDLE', 'Payment Link fallback (or NEXT_PUBLIC_STRIPE_LINK_PREMIUM)'],
  ['NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME', 'Founders lifetime checkout link'],
  ['NEXT_PUBLIC_SENTRY_DSN', 'Error monitoring (optional)'],
  ['NEXT_PUBLIC_POSTHOG_KEY', 'Product analytics (optional)'],
  ['NEXT_PUBLIC_COUNCIL_STATUS', 'aspirational | pending | member'],
  ['NEXT_PUBLIC_SHOW_MAHA_COPY', 'true only after legal sign-off'],
  ['NEXT_PUBLIC_AMERICA_TRACK_ENABLED', 'true to enable /america PFT track (default off)'],
];

const PLACEHOLDER_SECRETS = new Set(['done', 'change-me', 'your-secret', 'test-gate-secret-32chars-min!!']);

function isWeakSecret(val) {
  if (!val || val.length < 16) return true;
  return PLACEHOLDER_SECRETS.has(val.trim().toLowerCase());
}

let ok = true;
let warn = 0;

console.log(`\nMission Winning — environment check${launch ? ' (launch)' : ''}\n`);

for (const [key, hint] of required) {
  const val = process.env[key];
  if (!val || val.includes('YOUR-PROJECT') || val.includes('your-anon-key')) {
    console.log(`  ✗ ${key} — missing or placeholder (${hint})`);
    ok = false;
  } else if (key === 'PRIVATE_ACCESS_SECRET' && isWeakSecret(val)) {
    console.log(`  ✗ ${key} — rotate before production (weak or dev placeholder)`);
    ok = false;
  } else {
    console.log(`  ✓ ${key}`);
  }
}

if (launch) {
  for (const [key, hint] of launchRequired) {
    const val =
      key === 'NEXT_PUBLIC_STRIPE_LINK_BUNDLE'
        ? process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE || process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM
        : process.env[key];
    if (!val || val.includes('YOUR-') || val === 'whsec_...' || val.includes('pk_live_...')) {
      console.log(`  ✗ ${key} — required for go-live (${hint})`);
      ok = false;
    } else if ((key === 'YOUTH_CONSENT_SECRET' || key === 'NUDGE_SECRET') && isWeakSecret(val)) {
      console.log(`  ✗ ${key} — use openssl rand -base64 32 (dedicated secret)`);
      ok = false;
    } else {
      console.log(`  ✓ ${key}`);
    }
  }

  for (const [key, hint] of launchRecommended) {
    const val = process.env[key];
    if (!val) {
      console.log(`  ⚠ ${key} — recommended for go-live (${hint})`);
      warn++;
    } else {
      console.log(`  ✓ ${key}`);
    }
  }

  const hasSessions =
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PRICE_BUNDLE_12MO &&
    process.env.NEXT_PUBLIC_STRIPE_CHECKOUT === 'true';
  const hasPaymentLink =
    process.env.NEXT_PUBLIC_STRIPE_LINK_BUNDLE || process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM;
  if (!hasSessions && !hasPaymentLink) {
    console.log(
      '  ✗ Checkout — set Checkout Sessions (STRIPE_SECRET_KEY + prices + NEXT_PUBLIC_STRIPE_CHECKOUT=true) or NEXT_PUBLIC_STRIPE_LINK_BUNDLE'
    );
    ok = false;
  } else if (hasSessions) {
    console.log('  ✓ Checkout Sessions path configured');
  } else {
    console.log('  ✓ Payment Link fallback configured');
  }
}

for (const [key, hint] of optional) {
  const val = process.env[key];
  console.log(val ? `  ✓ ${key}=${val}` : `  · ${key} (optional) — ${hint}`);
}

if (process.env.DEMO_PREMIUM === 'true') {
  console.log('  ✗ DEMO_PREMIUM=true — must be false before public production deploy');
  ok = false;
}

if (launch && process.env.PRIVATE_MODE !== 'false') {
  console.log('  ⚠ PRIVATE_MODE is not false — OK for pre-launch gate verify; set false for §5 go-public');
  warn++;
}

if (process.env.NEXT_PUBLIC_SHOW_MAHA_COPY === 'true') {
  console.log('  ⚠ NEXT_PUBLIC_SHOW_MAHA_COPY=true — confirm legal review for MAHA copy');
  warn++;
}

console.log(
  ok
    ? `\n${launch ? 'Launch env looks ready.' : 'Ready for private gated deploy.'}${warn ? ` (${warn} warning(s))` : ''}\n`
    : '\nFix the items above, then redeploy Vercel.\n'
);
process.exit(ok ? 0 : 1);
