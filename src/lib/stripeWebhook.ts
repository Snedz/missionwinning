import { createHmac, timingSafeEqual } from 'crypto';

export type StripeWebhookEvent = {
  type?: string;
  data?: { object?: Record<string, unknown> };
};

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

export function parseStripeWebhookPayload(raw: string): StripeWebhookEvent | null {
  try {
    return JSON.parse(raw) as StripeWebhookEvent;
  } catch {
    return null;
  }
}

/** Events that grant Super Bundle enrollment after verified payment. */
export const STRIPE_ENROLLMENT_EVENTS = ['checkout.session.completed'] as const;

export function parseCheckoutSessionEnrollment(
  session: Record<string, unknown>
): { user_email: string; product_id: string; external_id: string } | null {
  const email =
    (session.customer_details as { email?: string } | undefined)?.email ??
    (session.customer_email as string | undefined) ??
    null;
  const sessionId = String(session.id ?? '');

  if (!email || !sessionId) return null;

  const metadata = (session.metadata as Record<string, string> | undefined) ?? {};
  const productId = metadata.product_id || metadata.productId || 'super-bundle';

  return {
    user_email: email,
    product_id: productId,
    external_id: sessionId,
  };
}
