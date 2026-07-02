import { createHmac, timingSafeEqual } from 'crypto';

/** Max accepted age (seconds) for a webhook timestamp — replay protection. */
export const STRIPE_SIGNATURE_TOLERANCE_SECONDS = 300;

/**
 * Verify a Stripe webhook signature (v1 scheme) without the stripe npm dependency.
 * Header format: `t=<unix>,v1=<hex hmac>[,v1=<hex hmac>...]`
 * @see https://docs.stripe.com/webhooks#verify-manually
 */
export function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  nowMs: number = Date.now()
): boolean {
  const parts = header.split(',').reduce(
    (acc, part) => {
      const [k, v] = part.split('=');
      if (k === 't') acc.t = v;
      if (k === 'v1') acc.v1.push(v);
      return acc;
    },
    { t: '', v1: [] as string[] }
  );

  if (!parts.t || parts.v1.length === 0) return false;

  const signed = `${parts.t}.${payload}`;
  const expected = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');

  for (const sig of parts.v1) {
    try {
      const a = Buffer.from(sig, 'hex');
      const b = Buffer.from(expected, 'hex');
      if (a.length === b.length && timingSafeEqual(a, b)) {
        const age = Math.abs(nowMs / 1000 - Number(parts.t));
        if (age <= STRIPE_SIGNATURE_TOLERANCE_SECONDS) return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}
