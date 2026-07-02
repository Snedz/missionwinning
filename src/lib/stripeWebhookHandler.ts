import 'server-only';
import { grantEnrollmentFromWebhook } from '@/lib/premiumServer';
import {
  parseCheckoutSessionEnrollment,
  STRIPE_ENROLLMENT_EVENTS,
  type StripeWebhookEvent,
} from '@/lib/stripeWebhook';

/** Handle verified Stripe webhook events — idempotent via enrollments.external_id. */
export async function handleStripeWebhookEvent(
  event: StripeWebhookEvent
): Promise<'granted' | 'duplicate' | 'ignored'> {
  if (!STRIPE_ENROLLMENT_EVENTS.includes(event.type as (typeof STRIPE_ENROLLMENT_EVENTS)[number])) {
    return 'ignored';
  }

  const session = event.data?.object ?? {};
  const enrollment = parseCheckoutSessionEnrollment(session);
  if (!enrollment) return 'ignored';

  const result = await grantEnrollmentFromWebhook({
    ...enrollment,
    provider: 'stripe',
  });

  return result.duplicate ? 'duplicate' : 'granted';
}
