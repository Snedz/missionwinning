/**
 * Free-first beta window (LLC / EIN pending — no business Stripe/PayPal yet).
 *
 * When true:
 * - Mute live checkout (isPaidCheckoutAllowed is false) — waitlist only
 * - Unlock premium depth (chat, Fuel Coach, GPS catalogs, etc.) for everyone
 * - /bundle still merchandises Super Bundle (no trial, no à la carte SKUs)
 *
 * Flip off after business payments are live: NEXT_PUBLIC_FREE_BETA=false
 *
 * Default ON unless explicitly disabled — founders chose hard-no on charges
 * until entity clears (overrides LLC_AND_PAYMENTS §1d individual Stripe).
 */

export function isFreeBeta(): boolean {
  const raw = process.env.NEXT_PUBLIC_FREE_BETA?.trim().toLowerCase();
  if (raw === '0' || raw === 'false' || raw === 'off') return false;
  if (raw === '1' || raw === 'true' || raw === 'on') return true;
  return true;
}

/** True when depth features should be treated as entitled (no enrollment). */
export function isFreeBetaPremiumUnlocked(): boolean {
  return isFreeBeta();
}
