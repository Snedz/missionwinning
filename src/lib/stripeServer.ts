/**
 * Server-only Stripe client for Checkout Sessions + Customer Portal.
 * Webhook signature verify stays in stripeWebhook.ts (HMAC, no SDK required).
 */
import 'server-only';
import Stripe from 'stripe';

let stripeSingleton: Stripe | null | undefined;

/** Lazy Stripe SDK — null when STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe | null {
  if (stripeSingleton !== undefined) return stripeSingleton;
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    stripeSingleton = null;
    return null;
  }
  stripeSingleton = new Stripe(key, {
    apiVersion: '2026-06-24.dahlia',
    typescript: true,
  });
  return stripeSingleton;
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

/** True when secret key + all three Super Bundle price IDs are set. */
export function isStripeCheckoutConfigured(): boolean {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) return false;
  return (
    Boolean(getStripePriceId('monthly')) &&
    Boolean(getStripePriceId('12mo')) &&
    Boolean(getStripePriceId('lifetime'))
  );
}

export function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.missionwinning.com'
  ).replace(/\/$/, '');
}
