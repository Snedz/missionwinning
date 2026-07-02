import type { BundlePlanId } from '@/lib/bundleConfig';

export function isStripeCheckoutConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** Map bundle plan → Stripe Price ID (Dashboard → Products → Prices). */
export function getStripePriceIdForPlan(planId: BundlePlanId): string | null {
  const byPlan: Record<BundlePlanId, string | undefined> = {
    '3mo': process.env.STRIPE_PRICE_ID_BUNDLE_3MO,
    '12mo': process.env.STRIPE_PRICE_ID_BUNDLE_12MO,
    lifetime: process.env.STRIPE_PRICE_ID_BUNDLE_LIFETIME,
  };
  const direct = byPlan[planId]?.trim();
  if (direct) return direct;

  const fallback = process.env.STRIPE_PRICE_ID_SUPER_BUNDLE?.trim();
  return fallback || null;
}
