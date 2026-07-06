import { verifyStripeSignature } from '@/lib/stripeWebhook';

export type StripeWebhookAuthResult =
  | { ok: true }
  | { ok: false; status: 503 | 401 | 400; error: string };

/** Auth + signature checks for Stripe webhook POST (no enrollment side effects). */
export function validateStripeWebhookRequest(
  secret: string | undefined,
  signatureHeader: string | null,
  rawBody: string
): StripeWebhookAuthResult {
  if (!secret) {
    return { ok: false, status: 503, error: 'Stripe webhook not configured' };
  }
  if (!signatureHeader) {
    return { ok: false, status: 401, error: 'Missing stripe-signature header' };
  }
  if (!verifyStripeSignature(rawBody, signatureHeader, secret)) {
    return { ok: false, status: 401, error: 'Invalid signature' };
  }
  try {
    JSON.parse(rawBody);
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON' };
  }
  return { ok: true };
}
