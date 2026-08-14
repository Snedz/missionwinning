/**
 * `LAUNCH_STRICT` could not succeed on the planned free-first public flip.
 *
 * Horizon 0 is during FREE_BETA: mute pay, unlock depth, recruit testers.
 * `check-env --launch` still demanded `STRIPE_WEBHOOK_SECRET` and a Checkout
 * path, and only *warned* on missing `MAIL_POSTAL_ADDRESS` — the actual
 * invite hard-exit. A check that stays red until Horizon 1 (EIN / unmute pay)
 * is a check nobody can use on flip day. That is `.200` / `.219`: saturated
 * red measures nothing.
 *
 * One implementation: `evaluateCheckEnv` in `scripts/check-env.mjs`. The CLI
 * prints and exits; this file imports the function so a top-level
 * `process.exit` cannot hide behind `npm run check-env`.
 *
 * Falsified by (1) H0 still requiring Stripe while FREE_BETA is on, (2) H0
 * still only warning on missing postal.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  FREE_BETA_OFF,
  checkEnvNodeArgs,
  evaluateCheckEnv,
  isFreeBetaFromEnv,
  launchPaidRequested,
  parseCheckEnvArgs,
} from '../../scripts/check-env.mjs';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/** Length ≥16, not in PLACEHOLDER_SECRETS. Never a production value. */
const H0_ENV = {
  PRIVATE_ACCESS_SECRET: 'h02-private-access-secret!',
  NEXT_PUBLIC_SUPABASE_URL: 'https://h02fixture.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_h02fixtureanonkeyok',
  SUPABASE_SERVICE_ROLE_KEY: 'h02-service-role-key-ok!!',
  YOUTH_CONSENT_SECRET: 'h02-youth-consent-secret!!',
  NUDGE_SECRET: 'h02-nudge-hmac-secret-ok!!',
  MAIL_POSTAL_ADDRESS: 'PO Box 1, Austin, TX 78701',
};

const FIXTURE_SECRETS = [
  H0_ENV.PRIVATE_ACCESS_SECRET,
  H0_ENV.SUPABASE_SERVICE_ROLE_KEY,
  H0_ENV.YOUTH_CONSENT_SECRET,
  H0_ENV.NUDGE_SECRET,
];

function assertNoSecretLeak(lines: string[]) {
  const blob = lines.join('\n');
  for (const secret of FIXTURE_SECRETS) {
    assert.equal(blob.includes(secret), false, 'check-env must not print secret values');
  }
}

test('H0 fixture (postal + core, no Stripe) passes launch and fails paid', () => {
  const h0 = evaluateCheckEnv(H0_ENV, { launch: true, paid: false });
  assert.equal(h0.profile, 'h0');
  assert.equal(h0.requirePaid, false);
  assert.equal(h0.ok, true, h0.failures.join(', ') || h0.lines.join('\n'));
  assert.equal(h0.failures.includes('STRIPE_WEBHOOK_SECRET'), false);
  assert.equal(h0.failures.includes('Checkout'), false);
  assert.match(h0.lines.join('\n'), /Horizon 0 launch env looks ready/);
  assert.doesNotMatch(h0.lines.join('\n'), /Horizon 1 paid launch env looks ready/);
  assertNoSecretLeak(h0.lines);

  const h1 = evaluateCheckEnv(H0_ENV, { launch: true, paid: true });
  assert.equal(h1.profile, 'h1');
  assert.equal(h1.requirePaid, true);
  assert.equal(h1.ok, false);
  assert.ok(h1.failures.includes('STRIPE_WEBHOOK_SECRET'), h1.failures.join(', '));
  assert.ok(h1.failures.includes('Checkout'), h1.failures.join(', '));
  assertNoSecretLeak(h1.lines);
});

test('H0 fails on missing MAIL_POSTAL_ADDRESS (not a warning)', () => {
  const result = evaluateCheckEnv(
    { ...H0_ENV, MAIL_POSTAL_ADDRESS: '' },
    { launch: true, paid: false }
  );
  assert.equal(result.ok, false);
  assert.ok(result.failures.includes('MAIL_POSTAL_ADDRESS'), result.failures.join(', '));
  const blob = result.lines.join('\n');
  assert.match(blob, /✗ MAIL_POSTAL_ADDRESS/);
  assert.doesNotMatch(blob, /⚠ MAIL_POSTAL_ADDRESS/);
});

test('whitespace-only MAIL_POSTAL_ADDRESS is missing', () => {
  const result = evaluateCheckEnv(
    { ...H0_ENV, MAIL_POSTAL_ADDRESS: '   ' },
    { launch: true, paid: false }
  );
  assert.equal(result.ok, false);
  assert.ok(result.failures.includes('MAIL_POSTAL_ADDRESS'));
});

test('H1 passes with webhook + Payment Link and still requires postal', () => {
  const paidEnv = {
    ...H0_ENV,
    STRIPE_WEBHOOK_SECRET: 'whsec_h02fixturewebhooksecret',
    NEXT_PUBLIC_STRIPE_LINK_BUNDLE: 'https://buy.stripe.com/h02fixture',
  };
  const ok = evaluateCheckEnv(paidEnv, { launch: true, paid: true });
  assert.equal(ok.ok, true, ok.failures.join(', '));
  assert.equal(ok.profile, 'h1');
  assert.match(ok.lines.join('\n'), /Horizon 1 paid launch env looks ready/);
  assert.doesNotMatch(ok.lines.join('\n'), /Horizon 0 launch env looks ready/);

  const missing = evaluateCheckEnv(
    { ...paidEnv, MAIL_POSTAL_ADDRESS: '' },
    { launch: true, paid: true }
  );
  assert.equal(missing.ok, false);
  assert.ok(missing.failures.includes('MAIL_POSTAL_ADDRESS'));
});

test('H1 Checkout Sessions path does not need a Payment Link', () => {
  const sessions = evaluateCheckEnv(
    {
      ...H0_ENV,
      STRIPE_WEBHOOK_SECRET: 'whsec_h02fixturewebhooksecret',
      STRIPE_SECRET_KEY: 'sk_test_h02fixturesecretkey',
      STRIPE_PRICE_BUNDLE_12MO: 'price_h02fixture12mo',
      NEXT_PUBLIC_STRIPE_CHECKOUT: 'true',
    },
    { launch: true, paid: true }
  );
  assert.equal(sessions.ok, true, sessions.failures.join(', '));
  assert.match(sessions.lines.join('\n'), /Checkout Sessions path configured/);
});

test('FREE_BETA off makes --launch require Stripe without --paid', () => {
  for (const off of ['false', '0', 'off']) {
    const result = evaluateCheckEnv(
      { ...H0_ENV, NEXT_PUBLIC_FREE_BETA: off },
      { launch: true, paid: false }
    );
    assert.equal(isFreeBetaFromEnv({ NEXT_PUBLIC_FREE_BETA: off }), false, off);
    assert.equal(result.profile, 'h1', off);
    assert.equal(result.ok, false, off);
    assert.ok(result.failures.includes('STRIPE_WEBHOOK_SECRET'), off);
    assert.ok(result.failures.includes('Checkout'), off);
  }
});

test('unset and on-tokens keep H0 (Stripe not required)', () => {
  assert.equal(isFreeBetaFromEnv({}), true);
  for (const on of ['true', '1', 'on', undefined]) {
    const env =
      on === undefined ? H0_ENV : { ...H0_ENV, NEXT_PUBLIC_FREE_BETA: on };
    const result = evaluateCheckEnv(env, { launch: true, paid: false });
    assert.equal(result.profile, 'h0', String(on));
    assert.equal(result.ok, true, String(on));
  }
});

test('parseCheckEnvArgs: --paid implies launch; LAUNCH_PAID is paid', () => {
  assert.deepEqual(parseCheckEnvArgs(['node', 'scripts/check-env.mjs']), {
    launch: false,
    paid: false,
  });
  assert.deepEqual(parseCheckEnvArgs(['node', 'x', '--launch']), {
    launch: true,
    paid: false,
  });
  assert.deepEqual(parseCheckEnvArgs(['node', 'x', '--paid']), {
    launch: true,
    paid: true,
  });
  assert.deepEqual(parseCheckEnvArgs(['node', 'x', '--launch', '--paid']), {
    launch: true,
    paid: true,
  });
  assert.deepEqual(parseCheckEnvArgs(['node', 'x', '--launch'], { LAUNCH_PAID: 'true' }), {
    launch: true,
    paid: true,
  });
  assert.equal(launchPaidRequested(['node', 'x'], {}), false);
  assert.equal(launchPaidRequested(['node', 'x', '--paid'], {}), true);
  assert.equal(launchPaidRequested(['node', 'x'], { LAUNCH_PAID: 'true' }), true);
});

test('checkEnvNodeArgs default is H0 --launch without --paid', () => {
  const h0 = checkEnvNodeArgs({ envFile: null, paid: false });
  assert.deepEqual(h0, ['scripts/check-env.mjs', '--launch']);
  assert.equal(h0.includes('--paid'), false);

  const withEnv = checkEnvNodeArgs({ envFile: '/tmp/.env.local', paid: false });
  assert.deepEqual(withEnv, [
    '--env-file',
    '/tmp/.env.local',
    'scripts/check-env.mjs',
    '--launch',
  ]);
  assert.equal(withEnv.includes('--paid'), false);

  const h1 = checkEnvNodeArgs({ envFile: null, paid: true });
  assert.ok(h1.includes('--launch'));
  assert.ok(h1.includes('--paid'));
});

test('launch-verify cannot hardcode --paid; it uses the helper', () => {
  const src = stripComments(read('scripts/launch-verify.mjs'));
  assert.match(src, /from '\.\/check-env\.mjs'/);
  assert.match(src, /checkEnvNodeArgs/);
  assert.match(src, /launchPaidRequested/);
  assert.doesNotMatch(
    src,
    /['"]--paid['"]/,
    'launch-verify must not embed --paid; checkEnvNodeArgs is the one home'
  );
});

test('FREE_BETA_OFF matches isFreeBeta off tokens (closed list)', () => {
  const src = read('src/lib/freeBeta.ts');
  const start = src.indexOf('export function isFreeBeta');
  const end = src.indexOf('export function isFreeBetaPremiumUnlocked');
  assert.ok(start >= 0 && end > start, 'isFreeBeta body not found');
  const body = src.slice(start, end);
  assert.match(
    body,
    /if \(raw === '0' \|\| raw === 'false' \|\| raw === 'off'\) return false;/
  );
  assert.deepEqual([...FREE_BETA_OFF].sort(), ['0', 'false', 'off']);
});

test('LAUNCH_PROD_VERIFIED still skips redacted service role on H0', () => {
  const result = evaluateCheckEnv(
    { ...H0_ENV, SUPABASE_SERVICE_ROLE_KEY: '', LAUNCH_PROD_VERIFIED: '1' },
    { launch: true, paid: false }
  );
  assert.equal(result.ok, true, result.failures.join(', '));
  assert.match(result.lines.join('\n'), /SUPABASE_SERVICE_ROLE_KEY \(Production-verified/);
});
