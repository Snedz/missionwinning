/**
 * Play purchase acknowledgment for `/api/mobile/premium/play-purchase`.
 * Payments are off. This module does not call Google Play and does not grant
 * enrollment. The free logger never depended on it.
 */
import 'server-only';

export { PLAY_PRODUCT_ALLOWLIST } from '@/lib/playBillingProducts';

export type PlayPurchaseInput = {
  userId: string;
  email: string | null;
  packageName: string;
  productId: string;
  purchaseToken: string;
  orderId?: string | null;
};

export type PlayPurchaseResult =
  | { ok: true; premium: true; source: string; duplicate?: boolean }
  | { ok: false; error: string; code: number };

/** Play Billing is not a payment rail. */
export function isPlayBillingConfigured(): boolean {
  return false;
}

export async function processPlayPurchase(
  _input: PlayPurchaseInput,
): Promise<PlayPurchaseResult> {
  return { ok: false, error: 'Payments are off', code: 410 };
}
