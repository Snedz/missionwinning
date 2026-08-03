/**
 * Create Stripe Checkout Sessions and Customer Portal sessions.
 * Consumers: /api/checkout, /api/billing-portal
 */
import 'server-only';
import type Stripe from 'stripe';
import {
  appOrigin,
  getStripe,
  getStripePriceId,
  isStripeCheckoutConfigured,
  type CheckoutPlanId,
} from '@/lib/stripeServer';

import { buildCheckoutSessionParams } from '@/lib/checkout/checkoutParams';

export type { CheckoutPlanId };

export { isStripeCheckoutConfigured };

export type CreateCheckoutInput = {
  planId: CheckoutPlanId;
  userId: string;
  email: string;
};

export type CreateCheckoutResult =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; status: 503 | 500; error: string };

/** Create a hosted Checkout Session for a Super Bundle plan. */
export async function createCheckoutSession(
  input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
  const stripe = getStripe();
  if (!stripe || !isStripeCheckoutConfigured()) {
    return { ok: false, status: 503, error: 'Stripe Checkout not configured' };
  }

  const priceId = getStripePriceId(input.planId);
  if (!priceId) {
    return { ok: false, status: 503, error: `Price not configured for plan ${input.planId}` };
  }

  // Shape lives in `checkout/checkoutParams.ts` so it can be asserted without a
  // Stripe key; the SDK type is applied here, where the compiler still checks it.
  const params = buildCheckoutSessionParams({
    planId: input.planId,
    userId: input.userId,
    email: input.email,
    priceId,
    origin: appOrigin(),
  }) as Stripe.Checkout.SessionCreateParams;

  try {
    const session = await stripe.checkout.sessions.create(params);
    if (!session.url) {
      return { ok: false, status: 500, error: 'Checkout session missing URL' };
    }
    return { ok: true, url: session.url, sessionId: session.id };
  } catch (e) {
    console.error('Stripe checkout.sessions.create error:', e);
    return { ok: false, status: 500, error: 'Failed to create checkout session' };
  }
}

export type PortalResult =
  | { ok: true; url: string }
  | { ok: false; status: 503 | 404 | 500; error: string };

/** Open Stripe Customer Portal for the Customer matching this email. */
export async function createBillingPortalSession(email: string): Promise<PortalResult> {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_SECRET_KEY?.trim()) {
    return { ok: false, status: 503, error: 'Stripe not configured' };
  }

  const normalized = email.trim().toLowerCase();
  const origin = appOrigin();

  try {
    const customers = await stripe.customers.list({ email: normalized, limit: 1 });
    const customer = customers.data[0];
    if (!customer) {
      return { ok: false, status: 404, error: 'No Stripe customer for this account' };
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/profile`,
    });

    if (!portal.url) {
      return { ok: false, status: 500, error: 'Portal session missing URL' };
    }
    return { ok: true, url: portal.url };
  } catch (e) {
    console.error('Stripe billingPortal.sessions.create error:', e);
    return { ok: false, status: 500, error: 'Failed to open billing portal' };
  }
}
