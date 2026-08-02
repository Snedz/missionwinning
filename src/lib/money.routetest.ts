/**
 * The revenue path's server half — configuration, and the webhook that grants it.
 *
 * `.224` — `stripeServer.ts`, `checkoutServer.ts`, `premiumServer.ts` and
 * `stripeDisputeNotify.ts` were **loaded by no test at all**. They are
 * `server-only`, which throws under plain `tsx`, so they sat in the one lane
 * nothing reached: 408 lines deciding whether an athlete can pay and whether a
 * payment becomes premium.
 *
 * This runs in `npm run test:routes`, where node's `react-server` export condition
 * resolves `server-only` to an empty module — the same lane and the same reason as
 * `llmRoutesQuota.routetest.ts`.
 *
 * **No network is involved.** Every case is either pure env logic or a refusal
 * that happens before any client is constructed: an unconfigured Stripe returns
 * 503 without calling Stripe, and an absent service role makes the enrollment
 * throw without calling Supabase. That is not a limitation — the refusals *are*
 * the contract, and they are what nothing was checking.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { POST as stripeWebhookPost } from '../../app/api/stripe-webhook/route.ts';
import { makeNextRequest } from '@/lib/api/testRequest';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';
import { getStripePriceId, isStripeCheckoutConfigured, appOrigin } from '@/lib/stripeServer';
import { createCheckoutSession } from '@/lib/checkoutServer';
import { isDemoPremiumEnabled } from '@/lib/premiumServer';
import { notifyFounderOfStripeDispute } from '@/lib/stripeDisputeNotify';

const SECRET = 'whsec_test_secret_at_least_32_chars!!';
const UUID = '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b';

let snapshot: NodeJS.ProcessEnv;
beforeEach(() => {
  snapshot = snapshotEnv();
});
afterEach(() => {
  restoreEnv(snapshot);
});

/** A genuine Stripe `v1` signature header over this payload. */
function sign(payload: string, secret = SECRET, tSeconds = Math.floor(Date.now() / 1000)): string {
  const sig = createHmac('sha256', secret).update(`${tSeconds}.${payload}`, 'utf8').digest('hex');
  return `t=${tSeconds},v1=${sig}`;
}

async function post(body: string, sigHeader?: string) {
  const res = await stripeWebhookPost(
    makeNextRequest('https://www.missionwinning.com/api/stripe-webhook', {
      method: 'POST',
      body,
      headers: sigHeader ? { 'stripe-signature': sigHeader } : {},
    })
  );
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

describe('Stripe configuration gates', () => {
  it('reads each plan price from its own env var', () => {
    setTestEnv('STRIPE_PRICE_BUNDLE_MONTHLY', 'price_m');
    setTestEnv('STRIPE_PRICE_BUNDLE_12MO', 'price_12');
    setTestEnv('STRIPE_PRICE_BUNDLE_LIFETIME', 'price_life');
    assert.equal(getStripePriceId('monthly'), 'price_m');
    assert.equal(getStripePriceId('12mo'), 'price_12');
    assert.equal(getStripePriceId('lifetime'), 'price_life');
  });

  it('treats a blank price as unset rather than as a price id', () => {
    setTestEnv('STRIPE_PRICE_BUNDLE_MONTHLY', '   ');
    assert.equal(
      getStripePriceId('monthly'),
      null,
      'a whitespace value would otherwise be sent to Stripe as a price id and fail at the checkout'
    );
  });

  /**
   * The partial-configuration case is the one that bites: two of three prices set
   * reads as "Stripe works" to anyone eyeballing the env, and the third plan is
   * simply unbuyable. Requiring all three makes the failure loud and total instead
   * of silent and per-plan.
   */
  it('is configured only when the secret key and all three prices are present', () => {
    setTestEnv('STRIPE_SECRET_KEY', 'sk_test_1');
    setTestEnv('STRIPE_PRICE_BUNDLE_MONTHLY', 'price_m');
    setTestEnv('STRIPE_PRICE_BUNDLE_12MO', 'price_12');
    setTestEnv('STRIPE_PRICE_BUNDLE_LIFETIME', 'price_life');
    assert.equal(isStripeCheckoutConfigured(), true);

    for (const missing of [
      'STRIPE_PRICE_BUNDLE_MONTHLY',
      'STRIPE_PRICE_BUNDLE_12MO',
      'STRIPE_PRICE_BUNDLE_LIFETIME',
      'STRIPE_SECRET_KEY',
    ]) {
      const saved = process.env[missing];
      setTestEnv(missing, undefined);
      assert.equal(isStripeCheckoutConfigured(), false, `${missing} unset must disable checkout entirely`);
      setTestEnv(missing, saved);
    }
  });

  it('appOrigin prefers APP_URL, falls back to SITE_URL, and never keeps a trailing slash', () => {
    setTestEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.com/');
    setTestEnv('NEXT_PUBLIC_SITE_URL', 'https://site.example.com');
    assert.equal(appOrigin(), 'https://app.example.com', 'a kept slash yields //bundle in every return URL');

    setTestEnv('NEXT_PUBLIC_APP_URL', undefined);
    assert.equal(appOrigin(), 'https://site.example.com');

    setTestEnv('NEXT_PUBLIC_SITE_URL', undefined);
    assert.equal(appOrigin(), 'https://www.missionwinning.com', 'production default');
  });

  it('refuses to create a session when Stripe is not configured, without calling Stripe', async () => {
    setTestEnv('STRIPE_SECRET_KEY', undefined);
    const r = await createCheckoutSession({ planId: 'lifetime', userId: UUID, email: 'buyer@example.com' });
    assert.equal(r.ok, false);
    assert.equal(!r.ok && r.status, 503, 'an unconfigured Stripe is unavailable, not a 500');
  });
});

describe('premium bypass', () => {
  /**
   * The security rule with the largest blast radius in the file: `DEMO_PREMIUM`
   * unlocks every paid pillar for everyone. In production it must be inert no
   * matter what the environment says, because the failure mode is giving the whole
   * product away silently.
   */
  it('DEMO_PREMIUM cannot unlock premium in production', () => {
    setTestEnv('NODE_ENV', 'production');
    setTestEnv('DEMO_PREMIUM', 'true');
    assert.equal(isDemoPremiumEnabled(), false, 'a production env var must never grant premium to everyone');
  });

  it('is on in development unless explicitly switched off', () => {
    setTestEnv('NODE_ENV', 'development');
    setTestEnv('DEMO_PREMIUM', undefined);
    assert.equal(isDemoPremiumEnabled(), true, 'dev default');

    setTestEnv('DEMO_PREMIUM', 'false');
    assert.equal(isDemoPremiumEnabled(), false, 'the explicit off switch has to work in dev too');
  });

  it('is off in test/staging unless opted in', () => {
    setTestEnv('NODE_ENV', 'test');
    setTestEnv('DEMO_PREMIUM', undefined);
    assert.equal(isDemoPremiumEnabled(), false);

    setTestEnv('DEMO_PREMIUM', 'true');
    assert.equal(isDemoPremiumEnabled(), true, 'opt-in still works outside production');
  });
});

describe('Stripe webhook — signature is the only thing standing between a POST and premium', () => {
  const completed = (over: Record<string, unknown> = {}) =>
    JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer_details: { email: 'buyer@example.com' },
          metadata: { user_id: UUID, product_id: 'super-bundle' },
          ...over,
        },
      },
    });

  it('503s when no webhook secret is configured', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', undefined);
    const r = await post(completed(), 'anything');
    assert.equal(r.status, 503);
  });

  it('401s with no signature header at all', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    const r = await post(completed());
    assert.equal(r.status, 401);
  });

  it('401s on a forged signature', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    const body = completed();
    assert.equal((await post(body, 't=1,v1=deadbeef')).status, 401);
    assert.equal(
      (await post(body, sign(body, 'the-wrong-secret'))).status,
      401,
      'a well-formed signature under another secret must not pass'
    );
  });

  /**
   * The replay window. A captured webhook is a valid signature forever without
   * this — and the body it carries grants premium.
   */
  it('401s on a correctly signed but stale timestamp', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    const body = completed();
    const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
    assert.equal(
      (await post(body, sign(body, SECRET, tenMinutesAgo))).status,
      401,
      'outside the 300s window a replayed event must be refused'
    );
  });

  it('401s when the signature is valid for a different body', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    const header = sign(completed());
    const tampered = completed({ customer_details: { email: 'attacker@example.com' } });
    assert.equal(await post(tampered, header).then((r) => r.status), 401);
  });

  it('400s on a signed body that is not JSON', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    const body = 'not json';
    assert.equal((await post(body, sign(body))).status, 400);
  });

  it('accepts an unrelated event without touching enrollment', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    setTestEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);
    const body = JSON.stringify({ type: 'customer.created', data: { object: { id: 'cus_1' } } });
    const r = await post(body, sign(body));
    assert.equal(r.status, 200, 'no grant is attempted, so the missing service role cannot matter');
    assert.deepEqual(r.json, { received: true });
  });

  /**
   * A verified purchase that cannot be recorded must fail loudly — Stripe retries
   * on non-2xx, and that retry is the only thing that eventually gives the buyer
   * what they paid for. Answering 200 here would drop the enrollment forever.
   */
  it('500s when a verified purchase cannot be enrolled', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    setTestEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);
    setTestEnv('NEXT_PUBLIC_SUPABASE_URL', undefined);
    const body = completed();
    const r = await post(body, sign(body));
    assert.equal(r.status, 500, 'a 200 here tells Stripe never to retry a purchase that was never granted');
  });

  it('accepts a completed session with no email without attempting a grant', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    setTestEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);
    const body = completed({ customer_details: {}, customer_email: undefined });
    const r = await post(body, sign(body));
    assert.equal(r.status, 200, 'nothing to enroll, so nothing to fail');
  });

  /**
   * Both of these are deliberately non-fatal: the enrollment path has to stay
   * healthy, and a 500 from a side channel would make Stripe retry the whole
   * event — including any grant it carries.
   */
  it('never 500s on a dispute alert it cannot send', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    setTestEnv('FOUNDER_DIGEST_EMAIL', undefined);
    for (const type of ['charge.dispute.created', 'charge.dispute.updated', 'charge.dispute.closed']) {
      const body = JSON.stringify({ type, data: { object: { id: 'dp_1', amount: 1199, currency: 'usd' } } });
      assert.equal((await post(body, sign(body))).status, 200, type);
    }
  });

  it('never 500s on an expired-session recovery it cannot record', async () => {
    setTestEnv('STRIPE_WEBHOOK_SECRET', SECRET);
    setTestEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);
    const body = JSON.stringify({
      type: 'checkout.session.expired',
      data: { object: { id: 'cs_exp_1', customer_details: { email: 'buyer@example.com' } } },
    });
    assert.equal((await post(body, sign(body))).status, 200, 'Stripe retries non-2xx; a lost recovery row is not worth that');
  });
});

describe('dispute alerts', () => {
  it('reports skipped rather than throwing when no founder address is set', async () => {
    setTestEnv('FOUNDER_DIGEST_EMAIL', undefined);
    const r = await notifyFounderOfStripeDispute({
      eventType: 'charge.dispute.created',
      dispute: { id: 'dp_1', amount: 1199, currency: 'usd', reason: 'fraudulent' },
    });
    assert.deepEqual(
      r,
      { ok: true, skipped: true },
      'the webhook treats a throw here as non-fatal anyway, but ok:false would read as a send failure in logs'
    );
  });
});
