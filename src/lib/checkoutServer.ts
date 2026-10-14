/**
 * Create Stripe Checkout Sessions and Customer Portal sessions.
 * Consumers: /api/checkout, /api/billing-portal
 */
import 'server-only';
import {
  isStripeCheckoutConfigured,
  type CheckoutPlanId,
} from '@/lib/stripeServer';

export type { CheckoutPlanId };

export { isStripeCheckoutConfigured };

export type CreateCheckoutInput = {
  planId: CheckoutPlanId;
  userId: string;
  email: string;
};

export type CreateCheckoutResult =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; status: 503 | 500; error: string };

/** Checkout is off. Keys in the environment do not open a session. */
export async function createCheckoutSession(
  _input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
  return { ok: false, status: 503, error: 'Payments are off' };
}

export type PortalResult =
  | { ok: true; url: string }
  | { ok: false; status: 503 | 404 | 500; error: string };

/** Customer portal is off. */
export async function createBillingPortalSession(_email: string): Promise<PortalResult> {
  return { ok: false, status: 503, error: 'Payments are off' };
}
