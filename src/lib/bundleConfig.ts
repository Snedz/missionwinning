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

export function bundleSavingsPercent(): number {
  const individual = Object.values(PILLAR_STANDALONE_PRICES).reduce((s, p) => s + parseFloat(p), 0);
  const bundle = parseFloat(SUPER_BUNDLE_PRICE);
  if (individual <= 0) return 50;
  return Math.round((1 - bundle / individual) * 100);
}
