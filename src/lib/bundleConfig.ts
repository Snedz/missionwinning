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

export type BundlePlanId = '3mo' | '12mo' | 'lifetime';

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

/** Freeletics-style duration tiers — illustrative until Stripe links per plan. */
export const BUNDLE_PLANS: Record<BundlePlanId, BundlePlan> = {
  '3mo': {
    id: '3mo',
    price: '33',
    strikePrice: '36',
    perMonth: '11',
    isSubscription: true,
    savingsPercent: 8,
  },
  '12mo': {
    id: '12mo',
    price: '96',
    strikePrice: '144',
    perMonth: '8',
    badge: 'popular',
    isSubscription: true,
    savingsPercent: 33,
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
