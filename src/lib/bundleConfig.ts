import {
  SUPER_BUNDLE_PRICE,
  SUPER_BUNDLE_TITLE,
  BUNDLE_DISCOUNT_NOTE,
  BUNDLE_PILLARS,
  getStripeCheckoutUrl,
} from '@/lib/payments';

export { SUPER_BUNDLE_PRICE, SUPER_BUNDLE_TITLE, BUNDLE_DISCOUNT_NOTE, BUNDLE_PILLARS, getStripeCheckoutUrl };

/** Individual pillar standalone monthly reference prices (for comparison table). */
export const PILLAR_STANDALONE_PRICES: Record<string, string> = {
  train: '15',
  fuel: '10',
  move: '9',
  mind: '7',
  track: '8',
  learn: '12',
};

/**
 * Plan IDs aligned with STRATEGY.md:
 * monthly $11.99 · 12-month founders $59 · lifetime $149
 * (`monthly` replaces the old 3-month tier.)
 */
export type BundlePlanId = 'monthly' | '12mo' | 'lifetime';

export type BundlePlanBadge = 'popular' | 'bestValue' | 'limited';

export interface BundlePlan {
  id: BundlePlanId;
  /** Display price (total for term or one-time). */
  price: string;
  /** Reference price before discount (strike-through). */
  strikePrice: string;
  /** Effective monthly for subscriptions. */
  perMonth?: string;
  badge?: BundlePlanBadge;
  isSubscription: boolean;
  savingsPercent: number;
}

/** Single source of truth for Super Bundle merchandising (STRATEGY.md). */
export const BUNDLE_PLANS: Record<BundlePlanId, BundlePlan> = {
  monthly: {
    id: 'monthly',
    price: '11.99',
    strikePrice: '24',
    perMonth: '11.99',
    isSubscription: true,
    savingsPercent: 50,
  },
  '12mo': {
    id: '12mo',
    price: '59',
    strikePrice: '143.88',
    perMonth: '4.92',
    badge: 'popular',
    isSubscription: true,
    savingsPercent: 59,
  },
  lifetime: {
    id: 'lifetime',
    price: '149',
    strikePrice: '299',
    badge: 'bestValue',
    isSubscription: false,
    savingsPercent: 50,
  },
};

export const DEFAULT_BUNDLE_PLAN: BundlePlanId = '12mo';

export function bundleSavingsPercent(): number {
  const individual = Object.values(PILLAR_STANDALONE_PRICES).reduce((s, p) => s + parseFloat(p), 0);
  const bundle = parseFloat(SUPER_BUNDLE_PRICE);
  if (individual <= 0) return 50;
  return Math.round((1 - bundle / individual) * 100);
}

export function standaloneTotalMonthly(): number {
  return Object.values(PILLAR_STANDALONE_PRICES).reduce((s, p) => s + parseFloat(p), 0);
}
