#!/usr/bin/env node
/**
 * Quick env sanity check — run: npm run check-env
 *
 * Horizon 0 (free-first public flip, FREE_BETA on):
 *   npm run check-env -- --launch
 *   Stripe webhook + Checkout are not required. MAIL_POSTAL_ADDRESS is.
 *
 * Horizon 1 (pay unmuted / EIN):
 *   npm run check-env -- --launch --paid
 *   LAUNCH_PAID=true npm run check-env -- --launch
 *   Keeps today’s Stripe webhook + Checkout hard-fails.
 *
 * If NEXT_PUBLIC_FREE_BETA is false/0/off, --launch is Horizon 1 even without
 * --paid (pay is unmuted). Does not print secret values.
 *
 * evaluateCheckEnv is the one implementation; the CLI prints and exits.
 * Tests import this module — a top-level process.exit would kill npm test.
 */
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

/** Same off-tokens as `isFreeBeta` in src/lib/freeBeta.ts — do not drift. */
export const FREE_BETA_OFF = new Set(['0', 'false', 'off']);
export const FREE_BETA_ON = new Set(['1', 'true', 'on']);

const PLACEHOLDER_SECRETS = new Set([
  'done',
  'change-me',
  'your-secret',
  'test-gate-secret-32chars-min!!',
]);

const required = [
  ['PRIVATE_ACCESS_SECRET', 'Private gate password (Vercel + .env.local)'],
  ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase project URL'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anon key'],
];

const launchAlways = [
  ['SUPABASE_SERVICE_ROLE_KEY', 'Webhooks, enrollments, admin APIs'],
  ['YOUTH_CONSENT_SECRET', 'Dedicated — never reuse PRIVATE_ACCESS_SECRET'],
  ['NUDGE_SECRET', 'Journey email unsubscribe HMAC'],
  ['MAIL_POSTAL_ADDRESS', 'CAN-SPAM postal — invite + list mail hard-refuse without it'],
];

const launchPaidKeys = [
  ['STRIPE_WEBHOOK_SECRET', 'Stripe checkout.session.completed'],
];

const launchRecommended = [
  ['CRON_SECRET', 'Vercel cron auth for /api/cron/* (reminders)'],
  ['STRIPE_SECRET_KEY', 'Checkout Sessions + Billing Portal'],
  ['STRIPE_PRICE_BUNDLE_12MO', 'Founders annual Price ID'],
  ['STRIPE_PRICE_BUNDLE_LIFETIME', 'Founders lifetime Price ID'],
  ['NEXT_PUBLIC_STRIPE_CHECKOUT', 'true when Sessions are live'],
  ['NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME', 'Founders lifetime payment link (fallback)'],
  ['UPSTASH_REDIS_REST_URL', 'Distributed rate limits — required before public (PRODUCTION_STACK L9)'],
  ['UPSTASH_REDIS_REST_TOKEN', 'Paired with UPSTASH_REDIS_REST_URL'],
  ['NEXT_PUBLIC_SENTRY_DSN', 'Error monitoring — required before public (PRODUCTION_STACK L12)'],
];

const optional = [
  ['PRIVATE_MODE', 'true/false — gate on in production by default'],
  ['PRIVATE_ACCESS_CODES', 'Comma-separated /private aliases (e.g. Done) — set for Production AND Preview'],
  ['PRIVATE_ALLOW_AUTH_BYPASS', 'Leave unset/false — magic link should not bypass gate'],
  ['DEMO_PREMIUM', 'Must be false (or unset) in production'],
  ['BETA_ADMIN_EMAILS', 'Comma-separated founder emails for beta panel'],
  ['RESEND_API_KEY', 'Parent consent + nudge + waitlist emails'],
  ['RESEND_FROM', 'Mission Winning <hello@missionwinning.com> — verified domain'],
  ['NEXT_PUBLIC_SITE_URL', 'https://www.missionwinning.com — canonicals + OG'],
  ['CRON_SECRET', 'Vercel cron auth for reminder nudges'],
  ['UPSTASH_REDIS_REST_URL', 'Distributed rate limits (required before public)'],
  ['UPSTASH_REDIS_REST_TOKEN', 'Paired with UPSTASH_REDIS_REST_URL'],
  ['STRIPE_PRICE_BUNDLE_MONTHLY', 'Monthly Super Bundle Price ID'],
  ['NEXT_PUBLIC_STRIPE_LINK_BUNDLE', 'Payment Link fallback (or NEXT_PUBLIC_STRIPE_LINK_PREMIUM)'],
  ['NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME', 'Founders lifetime checkout link'],
  ['NEXT_PUBLIC_SENTRY_DSN', 'Error monitoring (required before public)'],
  ['NEXT_PUBLIC_POSTHOG_KEY', 'Product analytics (optional)'],
  ['NEXT_PUBLIC_COUNCIL_STATUS', 'aspirational | pending | member'],
  ['NEXT_PUBLIC_SHOW_MAHA_COPY', 'true only after legal sign-off'],
  ['NEXT_PUBLIC_AMERICA_TRACK_ENABLED', 'true to enable /america PFT track (default off)'],
  ['NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'Web push public key (promote required at public flip)'],
  ['VAPID_PRIVATE_KEY', 'Web push private key (server only)'],
  ['VAPID_SUBJECT', 'mailto:… for VAPID'],
  ['COACH_LLM_API_URL', 'Optional coach LLM (prefer api.x.ai chat completions)'],
  ['COACH_LLM_REQUIRE_ZDR', 'true recommended when using xAI'],
  ['FOUNDER_DIGEST_EMAIL', 'Monday founder digest recipient'],
  ['NEXT_PUBLIC_WEARABLES', 'true to enable wearables UI (Profile + Track)'],
  ['STRAVA_CLIENT_ID', 'Strava OAuth (optional; pair with STRAVA_CLIENT_SECRET)'],
  ['STRAVA_CLIENT_SECRET', 'Strava OAuth secret (server only)'],
  ['MEAL_VISION_API_URL', 'Optional multimodal meal vision API URL'],
  ['MEAL_VISION_API_KEY', 'Meal vision API key (server only)'],
  ['MEAL_VISION_MODEL', 'Meal vision model id (optional)'],
];

export function isWeakSecret(val) {
  if (!val || val.length < 16) return true;
  return PLACEHOLDER_SECRETS.has(val.trim().toLowerCase());
}

/** Mirror of `isFreeBeta` — .mjs cannot import the TS module. */
export function isFreeBetaFromEnv(env) {
  const raw = String(env.NEXT_PUBLIC_FREE_BETA ?? '')
    .trim()
    .toLowerCase();
  if (FREE_BETA_OFF.has(raw)) return false;
  if (FREE_BETA_ON.has(raw)) return true;
  return true;
}

export function launchPaidRequested(argv, env = {}) {
  return argv.includes('--paid') || env.LAUNCH_PAID === 'true';
}

export function parseCheckEnvArgs(argv, env = {}) {
  const paid = launchPaidRequested(argv, env);
  const launch = argv.includes('--launch') || paid;
  return { launch, paid };
}

/** Args `node` receives to run this script from launch-verify. */
export function checkEnvNodeArgs({ envFile, paid }) {
  const args = envFile
    ? ['--env-file', envFile, 'scripts/check-env.mjs', '--launch']
    : ['scripts/check-env.mjs', '--launch'];
  if (paid) args.push('--paid');
  return args;
}

function raw(env, key) {
  const v = env[key];
  return v == null ? '' : String(v);
}

function missingOrPlaceholder(key, val) {
  if (!val) return true;
  if (key === 'NEXT_PUBLIC_SUPABASE_URL' && val.includes('YOUR-PROJECT')) return true;
  if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && val.includes('your-anon-key')) return true;
  if (val.includes('YOUR-') || val === 'whsec_...' || val.includes('pk_live_...')) return true;
  return false;
}

function launchBanner(profile) {
  if (profile === 'h1') return ' (launch · Horizon 1 paid)';
  if (profile === 'h0') return ' (launch · Horizon 0)';
  return '';
}

function successCopy(profile, warn) {
  const warnBit = warn ? ` (${warn} warning(s))` : '';
  if (profile === 'h0') {
    return `\nHorizon 0 launch env looks ready (FREE_BETA — Stripe not required).${warnBit}\n`;
  }
  if (profile === 'h1') {
    return `\nHorizon 1 paid launch env looks ready.${warnBit}\n`;
  }
  return `\nReady for private gated deploy.${warnBit}\n`;
}

/**
 * Pure check. Does not print or exit.
 *
 * @param {NodeJS.Dict<string | undefined>} env
 * @param {{ launch?: boolean, paid?: boolean }} [opts]
 */
export function evaluateCheckEnv(env, opts = {}) {
  const paidRequested = opts.paid === true;
  const launch = opts.launch === true || paidRequested;
  const freeBeta = isFreeBetaFromEnv(env);
  const requirePaid = launch && (paidRequested || !freeBeta);
  const profile = !launch ? 'dev' : requirePaid ? 'h1' : 'h0';

  const lines = [];
  const failures = [];
  let ok = true;
  let warn = 0;
  const log = (s) => {
    lines.push(s);
  };
  const fail = (key, msg) => {
    ok = false;
    failures.push(key);
    log(msg);
  };

  log(`\nMission Winning — environment check${launchBanner(profile)}\n`);

  for (const [key, hint] of required) {
    const val = raw(env, key);
    if (missingOrPlaceholder(key, val)) {
      fail(key, `  ✗ ${key} — missing or placeholder (${hint})`);
    } else if (key === 'PRIVATE_ACCESS_SECRET' && isWeakSecret(val)) {
      fail(key, `  ✗ ${key} — rotate before production (weak or dev placeholder)`);
    } else {
      log(`  ✓ ${key}`);
    }
  }

  if (launch) {
    const prodVerified = env.LAUNCH_PROD_VERIFIED === '1';
    const launchRequired = requirePaid ? [...launchAlways, ...launchPaidKeys] : launchAlways;

    for (const [key, hint] of launchRequired) {
      const val = raw(env, key).trim();
      if (
        !val &&
        prodVerified &&
        (key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'STRIPE_WEBHOOK_SECRET')
      ) {
        log(`  ✓ ${key} (Production-verified — local Sensitive pull redacted)`);
        continue;
      }
      if (missingOrPlaceholder(key, val)) {
        fail(key, `  ✗ ${key} — required for go-live (${hint})`);
      } else if ((key === 'YOUTH_CONSENT_SECRET' || key === 'NUDGE_SECRET') && isWeakSecret(val)) {
        fail(key, `  ✗ ${key} — use openssl rand -base64 32 (dedicated secret)`);
      } else {
        log(`  ✓ ${key}`);
      }
    }

    for (const [key, hint] of launchRecommended) {
      const val = raw(env, key);
      if (!val) {
        log(`  ⚠ ${key} — recommended for go-live (${hint})`);
        warn++;
      } else {
        log(`  ✓ ${key}`);
      }
    }

    if (requirePaid) {
      const hasSessions =
        raw(env, 'STRIPE_SECRET_KEY') &&
        raw(env, 'STRIPE_PRICE_BUNDLE_12MO') &&
        env.NEXT_PUBLIC_STRIPE_CHECKOUT === 'true';
      const hasPaymentLink =
        raw(env, 'NEXT_PUBLIC_STRIPE_LINK_BUNDLE') || raw(env, 'NEXT_PUBLIC_STRIPE_LINK_PREMIUM');
      if (!hasSessions && !hasPaymentLink) {
        fail(
          'Checkout',
          '  ✗ Checkout — set Checkout Sessions (STRIPE_SECRET_KEY + prices + NEXT_PUBLIC_STRIPE_CHECKOUT=true) or NEXT_PUBLIC_STRIPE_LINK_BUNDLE'
        );
      } else if (hasSessions) {
        log('  ✓ Checkout Sessions path configured');
      } else {
        log('  ✓ Payment Link fallback configured');
      }
    }
  }

  for (const [key, hint] of optional) {
    const val = raw(env, key);
    if (!val) {
      log(`  · ${key} (optional) — ${hint}`);
      continue;
    }
    const redact = /SECRET|KEY|TOKEN|PASSWORD|PRIVATE/i.test(key) && !key.startsWith('NEXT_PUBLIC_');
    log(redact ? `  ✓ ${key}=<set>` : `  ✓ ${key}=${val}`);
  }

  if (env.DEMO_PREMIUM === 'true') {
    fail('DEMO_PREMIUM', '  ✗ DEMO_PREMIUM=true — must be false before public production deploy');
  }

  if (launch && env.PRIVATE_MODE !== 'false') {
    log('  ⚠ PRIVATE_MODE is not false — OK for pre-launch gate verify; set false for §5 go-public');
    warn++;
  }

  if (launch && freeBeta && !paidRequested) {
    log(
      '  · FREE_BETA is on (default) — Bundle/checkout muted, premium depth unlocked; Stripe not required for Horizon 0. Use --paid or LAUNCH_PAID=true for Horizon 1.'
    );
  } else if (launch && freeBeta && paidRequested) {
    log(
      '  · FREE_BETA is on, but --paid requested — Horizon 1 Stripe webhook + Checkout are required.'
    );
  } else if (launch && !freeBeta) {
    log('  · FREE_BETA is off — pay unmuted; Horizon 1 Stripe webhook + Checkout are required.');
  }

  const resendFrom = raw(env, 'RESEND_FROM');
  if (launch && (!resendFrom || /@resend\.dev\b/i.test(resendFrom))) {
    log('  ⚠ RESEND_FROM — set a verified domain From (not onboarding@resend.dev) for launch mail');
    warn++;
  }

  const siteUrl = raw(env, 'NEXT_PUBLIC_SITE_URL');
  if (launch && !siteUrl) {
    log('  ⚠ NEXT_PUBLIC_SITE_URL unset — set https://www.missionwinning.com for canonicals/OG');
    warn++;
  } else if (siteUrl) {
    try {
      const { hostname } = new URL(siteUrl);
      if (
        (hostname === 'missionwinning.com' || hostname.endsWith('.missionwinning.com')) &&
        hostname !== 'www.missionwinning.com'
      ) {
        log('  ⚠ NEXT_PUBLIC_SITE_URL is non-www — prefer https://www.missionwinning.com');
        warn++;
      }
    } catch {
      // invalid URL — ignore
    }
  }

  if (launch && !raw(env, 'UPSTASH_REDIS_REST_URL')) {
    log('  ⚠ UPSTASH_REDIS_REST_URL unset — required before public (PRODUCTION_STACK L9)');
    warn++;
  }
  if (launch && !raw(env, 'NEXT_PUBLIC_SENTRY_DSN')) {
    log('  ⚠ NEXT_PUBLIC_SENTRY_DSN unset — required before public (PRODUCTION_STACK L12)');
    warn++;
  }

  if (env.NEXT_PUBLIC_SHOW_MAHA_COPY === 'true') {
    log('  ⚠ NEXT_PUBLIC_SHOW_MAHA_COPY=true — confirm legal review for MAHA copy');
    warn++;
  }

  log(ok ? successCopy(profile, warn) : '\nFix the items above, then redeploy Vercel.\n');

  return { ok, warn, lines, profile, requirePaid, freeBeta, launch, failures };
}

function isDirectCli() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

function main() {
  const { launch, paid } = parseCheckEnvArgs(process.argv, process.env);
  const result = evaluateCheckEnv(process.env, { launch, paid });
  for (const line of result.lines) console.log(line);
  process.exit(result.ok ? 0 : 1);
}

if (isDirectCli()) {
  main();
}
