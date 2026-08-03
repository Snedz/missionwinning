import { createHmac, timingSafeEqual } from 'crypto';
import { asAuthUserId } from '@/lib/authUserId';

/** Verify Stripe webhook signature (v1 scheme) without adding stripe npm dependency. */
export function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
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
        const age = Math.abs(Date.now() / 1000 - Number(parts.t));
        if (age <= 300) return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

export type StripeCheckoutSession = {
  id?: string;
  customer_email?: string;
  customer_details?: { email?: string };
  client_reference_id?: string | null;
  metadata?: {
    user_id?: string;
    product_id?: string;
    plan_id?: string;
  } | null;
};

export function emailFromCheckoutSession(session: StripeCheckoutSession): string | null {
  return session.customer_details?.email ?? session.customer_email ?? null;
}

/** Prefer metadata.user_id, then client_reference_id (Checkout Sessions). Ignores non-UUID junk. */
export function userIdFromCheckoutSession(session: StripeCheckoutSession): string | null {
  return asAuthUserId(session.metadata?.user_id) ?? asAuthUserId(session.client_reference_id);
}
