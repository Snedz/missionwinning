/**
 * Super Bundle shop merchandising — one paid SKU, honest catalog floors.
 *
 * Counts are CONTENT_FLOORS (under-promise). contentInventory.test.ts already
 * asserts actual catalog sizes are ≥ these floors. Do not import contentInventory
 * here — that pulls the catalog graph onto /bundle for a number the floor already
 * states. See contentFloors.ts.
 */

import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { BUNDLE_PLANS, DEFAULT_BUNDLE_PLAN, type BundlePlanId } from '@/lib/bundleConfig';

/** Illustrative competitor stack — not live SKUs, not à la carte pillars. */
export const BUNDLE_VS_STACK = ['Strong', 'MyFitnessPal', 'Pliability', 'Calm'] as const;

export type BundlePaidInventoryLine = {
  id: 'coach' | 'recipes' | 'move' | 'mind' | 'learn';
  i18nKey: string;
  /** Honest floor from CONTENT_FLOORS. Coach has no countable catalog. */
  count?: number;
};

export const BUNDLE_PAID_INVENTORY: readonly BundlePaidInventoryLine[] = [
  { id: 'coach', i18nKey: 'bundleShopPaidCoach' },
  { id: 'recipes', i18nKey: 'bundleShopPaidRecipes', count: CONTENT_FLOORS.recipesPremium },
  { id: 'move', i18nKey: 'bundleShopPaidMove', count: CONTENT_FLOORS.movePremium },
  { id: 'mind', i18nKey: 'bundleShopPaidMind', count: CONTENT_FLOORS.mindPremium },
  { id: 'learn', i18nKey: 'bundleShopPaidLearn', count: CONTENT_FLOORS.learnPremiumSections },
];

export type BundleShopCta = 'subscribe' | 'notify' | 'included';

/**
 * Shop CTA. Free-beta depth unlock is not a purchase — `purchased` is real enrollment.
 */
export function bundleShopCta(input: {
  freeBeta: boolean;
  checkoutConfigured: boolean;
  purchased: boolean;
}): BundleShopCta {
  if (input.purchased && !input.freeBeta) return 'included';
  if (input.freeBeta || !input.checkoutConfigured) return 'notify';
  return 'subscribe';
}

export { BUNDLE_PLANS, DEFAULT_BUNDLE_PLAN };
export type { BundlePlanId };
