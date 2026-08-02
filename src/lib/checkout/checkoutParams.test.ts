/**
 * What the athlete is charged, and whether the payment can be attributed to them.
 *
 * `.226` — `createCheckoutSession` calls `getStripe()` on its first line, so this
 * object had never been built by a test. Every assertion here is about a mistake
 * that **does not fail**: Stripe accepts all of these params and bills accordingly.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCheckoutSessionParams, PLAN_MODE, type CheckoutPlanId } from './checkoutParams.ts';

const PLANS: CheckoutPlanId[] = ['monthly', '12mo', 'lifetime'];

const input = {
  userId: '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b',
  email: 'buyer@example.com',
  priceId: 'price_123',
  origin: 'https://www.missionwinning.com',
};

const build = (planId: CheckoutPlanId, over: Partial<typeof input> = {}) =>
  buildCheckoutSessionParams({ planId, ...input, ...over });

/**
 * The one that silently bills forever. `lifetime` in `subscription` mode is a
 * recurring charge on a product sold as a one-off, and nothing in Stripe objects.
 */
test('lifetime is a one-off payment; the other two are subscriptions', () => {
  assert.equal(build('lifetime').mode, 'payment');
  assert.equal(build('monthly').mode, 'subscription');
  assert.equal(build('12mo').mode, 'subscription');
  assert.deepEqual(PLAN_MODE, { monthly: 'subscription', '12mo': 'subscription', lifetime: 'payment' });
});

/**
 * The metadata triple has to ride the carrier the webhook will actually read.
 * `session.metadata` covers `checkout.session.completed`; later subscription
 * invoices carry `subscription_data.metadata` and a one-off carries
 * `payment_intent_data.metadata`. On the wrong carrier it is a payment that
 * cannot be attributed to a user.
 */
test('every plan carries the attribution triple on the session', () => {
  for (const plan of PLANS) {
    assert.deepEqual(
      build(plan).metadata,
      { user_id: input.userId, product_id: 'super-bundle', plan_id: plan },
      `${plan}: session metadata`
    );
  }
});

test('the triple also rides the carrier that matches the mode, and only that one', () => {
  const lifetime = build('lifetime');
  assert.deepEqual(
    (lifetime.payment_intent_data as { metadata: unknown }).metadata,
    { user_id: input.userId, product_id: 'super-bundle', plan_id: 'lifetime' }
  );
  assert.ok(
    !('subscription_data' in lifetime),
    'a one-off must not carry subscription_data — Stripe rejects it against mode: payment'
  );

  for (const plan of ['monthly', '12mo'] as const) {
    const sub = build(plan);
    assert.deepEqual(
      (sub.subscription_data as { metadata: unknown }).metadata,
      { user_id: input.userId, product_id: 'super-bundle', plan_id: plan },
      `${plan}: subscription metadata`
    );
    assert.ok(
      !('payment_intent_data' in sub),
      `${plan}: a subscription must not carry payment_intent_data`
    );
  }
});

/**
 * `customer_creation: 'always'` is the only reason a lifetime buyer has anything
 * for the Billing Portal to open. A one-off payment does not create a Customer by
 * default, and `createBillingPortalSession` looks one up by email — so without
 * this the portal 404s for exactly the people who paid the most.
 */
test('lifetime forces a Customer so the Billing Portal works later', () => {
  assert.equal(build('lifetime').customer_creation, 'always');
  for (const plan of ['monthly', '12mo'] as const) {
    assert.ok(
      !('customer_creation' in build(plan)),
      `${plan}: subscriptions create a Customer on their own`
    );
  }
});

test('the email is normalized — it is what the portal looks the Customer up by', () => {
  assert.equal(build('monthly', { email: '  Buyer@Example.COM ' }).customer_email, 'buyer@example.com');
});

test('client_reference_id is the user id, as the webhook fallback expects', () => {
  // `userIdFromCheckoutSession` reads metadata.user_id, then this.
  assert.equal(build('monthly').client_reference_id, input.userId);
});

test('the price is the one passed, at quantity one', () => {
  assert.deepEqual(build('monthly').line_items, [{ price: 'price_123', quantity: 1 }]);
});

test('return URLs are built off the given origin', () => {
  const p = build('monthly', { origin: 'https://staging.example.com' });
  assert.equal(p.success_url, 'https://staging.example.com/bundle?checkout=success&session_id={CHECKOUT_SESSION_ID}');
  assert.equal(p.cancel_url, 'https://staging.example.com/bundle');
});

/**
 * Setting `payment_method_types` pins the list in code and silently disables
 * everything enabled in the Dashboard afterwards — wallets, Link, PayPal, crypto.
 * The comment at the constructor says so; this is the assertion.
 */
test('payment_method_types is never set, so the Dashboard controls the list', () => {
  for (const plan of PLANS) {
    assert.ok(
      !('payment_method_types' in build(plan)),
      `${plan}: pinning payment_method_types turns off every method added in the Dashboard later`
    );
  }
});
