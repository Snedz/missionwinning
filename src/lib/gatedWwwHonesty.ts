/**
 * Gated www honesty (F-008) — EN source for PRIVATE_MODE gate surfaces.
 *
 * While the private gate is on, `/` and `/log` redirect to `/private`. Cold
 * visitors must see Free / access-code framing — not a dead 404, not
 * opaque "Checking sign-in…", not "open beta" / "Start free" that implies
 * public open access, and not invite-only / private-beta / Free beta
 * product-status language (founder: gate stays; door pack is Free ·
 * Enter with code · Get notified). Alpha 0.1.0 stays off this door.
 * One Train→Coach teaser only (no six-pillar wall).
 *
 * Does not flip PRIVATE_MODE, mint cookies, or soften the gate.
 */

export const GATED_WWW_HONESTY = {
  /** Gate eyebrow — Free (never "open beta", "Free beta", or "invite-only"). */
  gateEyebrow: 'Free',
  /**
   * Primary lede on `/private` — locked support line.
   * Not a pillar catalog. Not Alpha chrome.
   */
  gateSubtitle: 'No account. No wearable.',
  /** Explicit one-line Train→Coach teaser under the lede. */
  gateWedgeTeaser:
    'Free forever offline logger + Mission Coach from your logs. No wearable.',
  /** Session-recovery / Suspense — honest gate, not opaque auth spinner. */
  gateCheckingSession: 'Confirming access…',
  gateLoading: 'Opening the gate…',
  /** Waitlist CTA — notify, not invite-only ask. */
  gateWaitlistTitle: 'Get notified',
  /** Welcome (public while gated) — Alpha framing on I-Day. */
  welcomeKicker: 'Alpha · About two minutes',
  welcomeSubtitleBrief:
    'A few questions, then log your first Train session. Mission Coach shapes the week from those logs — enter with your code.',
  /** Marketing / landing CTA while gate is on — not "Start free" / "Enter with invite". */
  landingNavStartGated: 'Enter with code',
} as const;

export type GatedWwwHonestyKey = keyof typeof GATED_WWW_HONESTY;

/**
 * Phrases that must not appear on gated www honesty EN copy.
 * Closed list — each spelling named for a real false-open or invite-only signal.
 */
const FORBIDDEN_GATED_WWW = [
  /open\s+beta/i, // Forbidden
  /checking sign-in/i, // Forbidden
  /\bstart free\b/i, // Forbidden
  /we'?re live/i, // Forbidden
  /publicly available/i, // Forbidden
  /doors open/i, // Forbidden
  /invite-only/i, // Forbidden
  /enter with invite/i, // Forbidden
  /get an invite/i, // Forbidden
  /after (?:your )?invite/i, // Forbidden
  /private beta/i, // Forbidden
  /free beta/i, // Forbidden
  /train anywhere\. win daily\./i, // Forbidden
] as const;

/**
 * True when every GATED_WWW_HONESTY value is free of false-open / invite-only framing.
 */
export function gatedWwwHonestyIsHonest(
  copy: Record<string, string> = GATED_WWW_HONESTY
): { ok: true } | { ok: false; key: string; hit: string } {
  for (const [key, value] of Object.entries(copy)) {
    for (const re of FORBIDDEN_GATED_WWW) {
      if (re.test(value)) {
        return { ok: false, key, hit: re.source };
      }
    }
  }
  return { ok: true };
}
