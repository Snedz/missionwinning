/**
 * Gated www honesty (F-008) — EN source for PRIVATE_MODE invite surfaces.
 *
 * While the private gate is on, `/` and `/log` redirect to `/private`. Cold
 * visitors must see invite / private-beta framing — not a dead 404, not opaque
 * "Checking sign-in…", and not "open beta" / "Start free" that implies the
 * product is publicly open. One Train→Coach teaser only (no six-pillar wall).
 *
 * Does not flip PRIVATE_MODE, mint cookies, or soften the gate.
 */

export const GATED_WWW_HONESTY = {
  /** Gate eyebrow — invite-only private beta (never "open beta"). */
  gateEyebrow: 'Invite-only private beta',
  /**
   * Primary lede on `/private` — Train logging + Mission Coach from logs.
   * What you get after invite; not a pillar catalog.
   */
  gateSubtitle:
    'After your invite: log sets on Train (offline, no account). Mission Coach builds your week from those logs alone — no wearable.',
  /** Explicit one-line Train→Coach teaser under the lede. */
  gateWedgeTeaser:
    'Train logging + Mission Coach from your logs — that is what opens after invite.',
  /** Session-recovery / Suspense — honest invite gate, not opaque auth spinner. */
  gateCheckingSession: 'Confirming invite access…',
  gateLoading: 'Opening the invite gate…',
  /** Waitlist CTA framing — ask for an invite, not "doors open" public launch. */
  gateWaitlistTitle: 'Get an invite',
  /** Welcome (public while gated) — invite framing on I-Day. */
  welcomeKicker: 'Invite-only private beta · About two minutes',
  welcomeSubtitleBrief:
    'A few questions, then log your first Train session. Mission Coach shapes the week from those logs — invite required to enter the app.',
  /** Marketing / landing CTA while gate is on — not "Start free". */
  landingNavStartGated: 'Enter with invite',
} as const;

export type GatedWwwHonestyKey = keyof typeof GATED_WWW_HONESTY;

/**
 * Phrases that must not appear on gated www honesty EN copy.
 * Closed list — each spelling named for a real false-open signal.
 */
const FORBIDDEN_GATED_WWW = [
  /open\s+beta/i,
  /checking sign-in/i,
  /\bstart free\b/i,
  /we'?re live/i,
  /publicly available/i,
  /doors open/i,
] as const;

/**
 * True when every GATED_WWW_HONESTY value is free of false-open framing.
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
