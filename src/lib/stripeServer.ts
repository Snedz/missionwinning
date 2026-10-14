/**
 * Stripe Checkout is off. This module does not construct a Stripe client.
 * Webhook signature verify stays in stripeWebhook.ts (HMAC, no SDK required).
 */
import 'server-only';

/** Payments are off. A secret key in the environment does not build a client. */
export function getStripe(): null {
  return null;
}

export type CheckoutPlanId = 'monthly' | '12mo' | 'lifetime';

const PRICE_ENV: Record<CheckoutPlanId, string> = {
  monthly: 'STRIPE_PRICE_BUNDLE_MONTHLY',
  '12mo': 'STRIPE_PRICE_BUNDLE_12MO',
  lifetime: 'STRIPE_PRICE_BUNDLE_LIFETIME',
};

export function getStripePriceId(planId: CheckoutPlanId): string | null {
  const envName = PRICE_ENV[planId];
  const id = process.env[envName]?.trim();
  return id || null;
}

/** Payments are off. Price ids in the environment do not turn checkout on. */
export function isStripeCheckoutConfigured(): boolean {
  return false;
}

export function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.missionwinning.com'
  ).replace(/\/$/, '');
}
