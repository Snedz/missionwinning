/**
 * The client half of checkout — the functions that start a payment.
 *
 * `.262` — `payments.ts` measured **73.54% lines / 33.33% functions**, and the
 * covered part was the price constants: something imports `SUPER_BUNDLE_PRICE`, so
 * the file's top level runs and three quarters of its lines are "covered" while
 * `createCheckoutForPlan`, `openBillingPortal` and `getStripeCheckoutUrl` had never
 * been called. Exactly the skew `scripts/coverage.mjs` now ratchets on.
 *
 * These functions are the athlete's error messages. Every branch below is a
 * different thing the UI says when a payment cannot start, and getting one wrong
 * means a signed-out user is told "Checkout failed" instead of "Sign in", or an
 * unconfigured Stripe reads as a broken app.
 */

import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCheckoutForPlan,
  openBillingPortal,
  isCheckoutSessionsEnabled,
  getStripeCheckoutUrl,
  PROGRAM_PRICES,
  SUPER_BUNDLE_PRICE,
  BUNDLE_PILLARS,
} from './payments.ts';
import { CONTENT_FLOORS } from './contentFloors.ts';
import { setTestEnv } from './testEnv.ts';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** Stub `fetch` with one canned response. */
function stubFetch(status: number, body: unknown, opts?: { throws?: boolean; badJson?: boolean }) {
  const calls: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    if (opts?.throws) throw new TypeError('Failed to fetch');
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (opts?.badJson) throw new SyntaxError('Unexpected token');
        return body;
      },
    };
  }) as unknown as typeof fetch;
  return calls;
}

test('a successful checkout returns the URL the caller redirects to', async () => {
  const calls = stubFetch(200, { url: 'https://checkout.stripe.com/c/pay/cs_test_1' });
  const r = await createCheckoutForPlan('lifetime');
  assert.deepEqual(r, { ok: true, url: 'https://checkout.stripe.com/c/pay/cs_test_1' });

  assert.equal(calls[0].url, '/api/checkout');
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal(
    (calls[0].init as RequestInit & { credentials?: string }).credentials,
    'include',
    'the route requires the session cookie — without credentials every checkout is a 401'
  );
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { planId: 'lifetime' });
});

/**
 * 401 and 503 are different sentences to a human. "Sign in to continue" is
 * actionable; "Checkout not configured" is not the user's problem. Collapsing
 * either into the generic error is a conversion bug, not a cosmetic one.
 */
test('401 is auth_required — by status or by code', async () => {
  stubFetch(401, { error: 'Sign in required to checkout' });
  assert.deepEqual(await createCheckoutForPlan('monthly'), {
    ok: false,
    code: 'auth_required',
    message: 'Sign in required to checkout',
  });

  // Some routes answer 200-with-code rather than 401.
  stubFetch(200, { code: 'auth_required', error: 'Sign in first' });
  const byCode = await createCheckoutForPlan('monthly');
  assert.equal(byCode.ok, false);
  assert.equal(!byCode.ok && byCode.code, 'auth_required');
});

test('503 is unavailable, not a generic failure', async () => {
  stubFetch(503, { error: 'Checkout not configured' });
  assert.deepEqual(await createCheckoutForPlan('12mo'), {
    ok: false,
    code: 'unavailable',
    message: 'Checkout not configured',
  });
});

test('a 200 with no url is an error, never a silent success', async () => {
  stubFetch(200, {});
  const r = await createCheckoutForPlan('monthly');
  assert.equal(r.ok, false, 'ok:true with an undefined url would redirect the athlete to nowhere');
  assert.equal(!r.ok && r.code, 'error');
});

test('a network failure is reported, not thrown at the component', async () => {
  stubFetch(0, null, { throws: true });
  const r = await createCheckoutForPlan('monthly');
  assert.deepEqual(r, { ok: false, code: 'error', message: 'Network error starting checkout' });
});

test('an unparseable body still yields a shaped result', async () => {
  stubFetch(500, null, { badJson: true });
  const r = await createCheckoutForPlan('monthly');
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.code, 'error');
});

test('the billing portal maps 404 and 503 to unavailable, not error', async () => {
  const calls = stubFetch(200, { url: 'https://billing.stripe.com/p/session/1' });
  assert.deepEqual(await openBillingPortal(), { ok: true, url: 'https://billing.stripe.com/p/session/1' });
  assert.equal(calls[0].url, '/api/billing-portal');

  // 404 = "no Stripe customer for this account", which is a state, not a fault.
  stubFetch(404, { error: 'No Stripe customer for this account' });
  const missing = await openBillingPortal();
  assert.equal(!missing.ok && missing.code, 'unavailable');

  stubFetch(503, { error: 'Stripe not configured' });
  const unconfigured = await openBillingPortal();
  assert.equal(!unconfigured.ok && unconfigured.code, 'unavailable');

  stubFetch(500, { error: 'boom' });
  const broken = await openBillingPortal();
  assert.equal(!broken.ok && broken.code, 'error', '500 is a fault and must not read as unavailable');
});

test('the billing portal reports 401 as auth_required', async () => {
  stubFetch(401, {});
  const r = await openBillingPortal();
  assert.equal(!r.ok && r.code, 'auth_required');
});

test('isCheckoutSessionsEnabled is true only for the exact string', () => {
  for (const [value, want] of [['true', true], ['false', false], ['TRUE', false], ['1', false], [undefined, false]] as const) {
    setTestEnv('NEXT_PUBLIC_STRIPE_CHECKOUT', value);
    assert.equal(isCheckoutSessionsEnabled(), want, `NEXT_PUBLIC_STRIPE_CHECKOUT=${String(value)}`);
  }
});

/**
 * The link map is built once at module load from static `process.env.X` reads,
 * because a dynamic `process.env[key]` lookup is always undefined in the browser —
 * NEXT_PUBLIC_* is inlined at build time only for static property access. So this
 * asserts the lookup behaviour and the aliasing, not the values.
 */
test('an unknown product has no link, and a missing id falls back to the bundle', () => {
  assert.equal(getStripeCheckoutUrl('no-such-product'), null);
  assert.equal(getStripeCheckoutUrl(''), getStripeCheckoutUrl(undefined), 'empty id is treated as absent');
  // Aliases must resolve identically or two buttons for one product diverge.
  assert.equal(getStripeCheckoutUrl('super-bundle'), getStripeCheckoutUrl('bundle'));
  assert.equal(getStripeCheckoutUrl('bundle-monthly'), getStripeCheckoutUrl('bundle-3mo'));
});

test('the advertised bundle price is a plain decimal string', () => {
  assert.match(SUPER_BUNDLE_PRICE, /^\d+\.\d{2}$/, 'rendered directly into copy and Stripe metadata');
  for (const [id, p] of Object.entries(PROGRAM_PRICES)) {
    assert.match(p.price, /^\d+(\.\d{2})?$/, `${id} price`);
    assert.ok(p.title.length > 0, `${id} title`);
    assert.match(p.currency, /^[a-z]{3}$/i, `${id} currency`);
  }
});

/**
 * `.605` — the bundle page understated everything it sells.
 *
 * `BUNDLE_PILLARS` carried hand-typed counts, and every one of them had drifted
 * *downward* against shipped content: 40 free recipes against 48, 102+ premium
 * against 110, 24 mobility flows against 32, 40 premium flows against 48, 24 mind
 * sessions against 32. Six content ships (`.583`–`.588`) each raised a floor and
 * none of them touched the page that advertises the floor.
 *
 * Two halves, because either alone can pass over the defect.
 *
 * The **source** half is the one that generalises: no digit may be typed into a
 * `free:`/`premium:` blurb at all. That fails on the *next* hand-typed count
 * whatever its value, which a value-comparison test cannot do — a test asserting
 * "the string says 48" goes green the moment someone writes 48 by hand, and then
 * red for the wrong reason on the next content ship. Prices (`standalone:`) are
 * excluded on purpose: they are not counts and do not track a catalog.
 *
 * The **runtime** half catches the opposite mutation — deleting the count from a
 * blurb entirely, which the source scan would happily call clean.
 */
test('bundle pillar copy derives its counts and never hard-codes one', async () => {
  const { readFileSync } = await import('node:fs');
  const path = await import('node:path');
  const src = readFileSync(
    path.join(import.meta.dirname, 'payments.ts'),
    'utf8'
  );
  const block = src.slice(
    src.indexOf('export const BUNDLE_PILLARS'),
    src.indexOf('] as const', src.indexOf('export const BUNDLE_PILLARS'))
  );
  assert.ok(block.length > 0, 'BUNDLE_PILLARS block not found — this guard is reading nothing');

  const blurbs = [...block.matchAll(/^\s*(free|premium):\s*(.+?),\s*$/gm)];
  assert.ok(blurbs.length >= 12, `expected both blurbs for all six pillars, found ${blurbs.length}`);

  for (const [, field, value] of blurbs) {
    // Strip every `${...}` interpolation, then any surviving digit was typed by hand.
    const literalOnly = value.replace(/\$\{[^}]*\}/g, '');
    assert.doesNotMatch(
      literalOnly,
      /\d/,
      `${field} blurb hard-codes a number (${value.trim()}) — interpolate CONTENT_FLOORS instead. ` +
        'Every hand-typed count in this array had gone stale against the catalog by .605.'
    );
  }
});

test('the derived counts actually reach the rendered blurbs', () => {
  const byId = Object.fromEntries(BUNDLE_PILLARS.map((p) => [p.id, p]));
  const expectations: [string, 'free' | 'premium', number][] = [
    ['fuel', 'free', CONTENT_FLOORS.recipesFree],
    ['fuel', 'premium', CONTENT_FLOORS.recipesPremium],
    ['move', 'free', CONTENT_FLOORS.moveFree],
    ['move', 'premium', CONTENT_FLOORS.movePremium],
    ['mind', 'free', CONTENT_FLOORS.mindFree],
    ['mind', 'premium', CONTENT_FLOORS.mindPremium],
    ['learn', 'premium', CONTENT_FLOORS.learnPremiumSections],
  ];
  for (const [id, field, count] of expectations) {
    const pillar = byId[id];
    assert.ok(pillar, `${id} pillar missing from BUNDLE_PILLARS`);
    assert.match(
      pillar[field],
      new RegExp(`\\b${count}\\b`),
      `${id}.${field} should state the ${count} from CONTENT_FLOORS — got "${pillar[field]}"`
    );
  }
});
