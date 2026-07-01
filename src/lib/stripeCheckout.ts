import 'server-only';
import type { BundlePlanId } from '@/lib/bundleConfig';
import { getStripePriceIdForPlan } from '@/lib/stripeCheckoutConfig';

const STRIPE_API = 'https://api.stripe.com/v1';

export { isStripeCheckoutConfigured, getStripePriceIdForPlan } from '@/lib/stripeCheckoutConfig';

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  );
}

function encodeForm(body: Record<string, string>): string {
  return new URLSearchParams(body).toString();
}

export interface CreateCheckoutSessionInput {
  planId: BundlePlanId;
  customerEmail?: string;
}

export interface CreateCheckoutSessionResult {
  url: string;
  sessionId: string;
}

/** Create a Stripe Checkout Session via REST (no stripe npm dependency). */
export async function createStripeCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CreateCheckoutSessionResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  const priceId = getStripePriceIdForPlan(input.planId);
  if (!priceId) {
    throw new Error(`No Stripe price configured for plan ${input.planId}`);
  }

  const base = appBaseUrl();
  const mode = input.planId === 'lifetime' ? 'payment' : 'subscription';

  const form: Record<string, string> = {
    mode,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${base}/bundle?checkout=success&plan=${input.planId}`,
    cancel_url: `${base}/bundle?checkout=cancel&plan=${input.planId}`,
    'metadata[plan_id]': input.planId,
    'metadata[product_id]': 'super-bundle',
    'client_reference_id': `super-bundle-${input.planId}`,
  };

  if (input.customerEmail?.trim()) {
    form.customer_email = input.customerEmail.trim();
  }

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodeForm(form),
  });

  const data = (await res.json()) as { url?: string; id?: string; error?: { message?: string } };
  if (!res.ok) {
    const msg = data.error?.message || `Stripe API ${res.status}`;
    throw new Error(msg);
  }

  if (!data.url || !data.id) {
    throw new Error('Stripe checkout session missing url');
  }

  return { url: data.url, sessionId: data.id };
}
