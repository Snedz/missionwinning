/**
 * What the athlete is actually charged, and what comes back with the receipt.
 *
 * `.225` — lifted out of `checkoutServer.createCheckoutSession`, whose first line
 * is `getStripe()`, so none of this was reachable without a Stripe secret key and
 * none of it had ever been executed by a test. `payments.ts` measured 73.54% lines
 * / 33.33% functions and the covered third was the price constants; this is the
 * part that decides the charge.
 *
 * Nothing about the params changed. What changed is that the three decisions
 * inside them can now be stated:
 *
 * 1. **Mode follows the plan, not the caller.** `lifetime` is a one-off
 *    `payment`; the other two are `subscription`. Getting this backwards does not
 *    fail — Stripe happily bills a lifetime purchase monthly, forever.
 * 2. **The metadata triple rides the right carrier.** `session.metadata` is what
 *    `checkout.session.completed` carries, but a subscription's later invoices
 *    carry `subscription_data.metadata` and a one-off carries
 *    `payment_intent_data.metadata`. The webhook reads `user_id` off the object
 *    it is handed, so a triple on the wrong carrier is an entitlement that cannot
 *    be attributed to anyone.
 * 3. **Lifetime forces a Customer.** `customer_creation: 'always'` exists so the
 *    Billing Portal works later — a one-off payment does not create one by
 *    default, and without it a lifetime buyer has nothing to manage.
 *
 * Pure and dependency-free on purpose (the `journey/basicComplete.ts` shape):
 * `checkoutServer.ts` is `server-only`, so a test that imported it to reach this
 * object would need the whole Stripe client.
 */

export type CheckoutPlanId = 'monthly' | '12mo' | 'lifetime';

/** Subscription vs one-off. `lifetime` is bought once. */
export const PLAN_MODE: Record<CheckoutPlanId, 'subscription' | 'payment'> = {
  monthly: 'subscription',
  '12mo': 'subscription',
  lifetime: 'payment',
};

export type BuildCheckoutParamsInput = {
  planId: CheckoutPlanId;
  userId: string;
  email: string;
  priceId: string;
  origin: string;
};

/** The metadata every carrier gets — what the webhook attributes the payment by. */
function attribution(planId: CheckoutPlanId, userId: string) {
  return {
    user_id: userId,
    product_id: 'super-bundle',
    plan_id: planId,
  };
}

/**
 * Stripe Checkout Session params for a Super Bundle plan.
 *
 * Typed loosely rather than against `Stripe.Checkout.SessionCreateParams` so this
 * module stays dependency-free; `checkoutServer.ts` applies the SDK type at the
 * call site, where the compiler still checks it.
 */
export function buildCheckoutSessionParams(
  input: BuildCheckoutParamsInput
): Record<string, unknown> {
  const mode = PLAN_MODE[input.planId];
  const metadata = attribution(input.planId, input.userId);

  const params: Record<string, unknown> = {
    mode,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: `${input.origin}/bundle?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/bundle`,
    client_reference_id: input.userId,
    customer_email: input.email.trim().toLowerCase(),
    metadata,
    // Automatic payment methods (card, Link, wallets, PayPal, crypto when enabled in Dashboard).
    // Do not set payment_method_types — lets Dashboard config control the list.
  };

  if (mode === 'payment') {
    // Lifetime: create a Customer so Billing Portal works later.
    params.customer_creation = 'always';
    params.payment_intent_data = { metadata };
  } else {
    params.subscription_data = { metadata };
  }

  return params;
}
