/**
 * English gate + offline copy, and the first-paint floor that reads it.
 *
 * Split out of `gateLocales.ts` (`.745`) for two reasons:
 *
 * 1. **One home for the words.** The gate's components used hand-typed
 *    `defaultValue:` strings, which is what SSR paints, while the pack held
 *    different sentences, which is what appears when `hydrateI18nResources`
 *    lands ~2.8s later. A cold visitor read *"Private beta in progress"* and
 *    then *"Invite-only open beta"*; *"Get notified at launch"* became *"Get an
 *    invite"*. Two claims, one page, no edit in between. Flooring from this
 *    table means first paint and hydrated paint cannot disagree — the `.653`
 *    fix for legal pages ({@link ./infoEnFloor.ts}), applied to the front door.
 * 2. **English only.** `/private` is the whole of www while `PRIVATE_MODE` is
 *    on; importing `gateLocales` for the floor would put fourteen other
 *    language packs in that route's bundle.
 */

export const GATE_EN: Record<string, string> = {
  gateEyebrow: 'Invite-only open beta',
  gateTitle1: 'Train anywhere.',
  gateTitle2: 'Win daily.',
  gateSubtitle:
    'Free offline workout logging plus Mission Coach — weekly plans from your logs alone, no wearable. Full tools free for invited testers; the logger stays free forever.',
  gateFooterTagline: 'free core forever',
  gateWaitlistTitle: 'Get an invite',
  gateWaitlistPlaceholder: 'you@example.com',
  gateWaitlistSubmit: 'Notify me',
  gateWaitlistSubmitting: 'Joining…',
  gateWaitlistDone: "You're on the list.",
  gateWaitlistDoneFoot: "We'll email you when a seat opens.",
  gateWaitlistFoot: 'No spam — one email when your invite is ready, one if the waitlist moves.',
  gateWaitlistFailed: 'That did not save. Check your connection and try again.',
  gateAccessSummary: 'Have a beta access code?',
  gateAccessLabel: 'Access code',
  gateAccessPlaceholder: 'Enter code from your invite',
  gateAccessSubmit: 'Enter the beta',
  gateAccessChecking: 'Checking…',
  gateCheckingSession: 'Checking sign-in…',
  gateInviteEyebrow: 'Beta invite',
  gateInviteHeadline: "You're invited — enter your access code to join the beta.",
  gateInviteSubtitle:
    "You're invited — enter the access code from your invite email, then complete I-Day and log your first workout.",
  gateBetaGuide: 'beta start guide',
  gateBetaGuideFoot: 'Invited testers: see the',
  offlineEyebrow: 'No connection',
  offlineTitle: "You're offline. The log isn't.",
  offlineBody:
    "This page isn't cached yet, but everything you've already used keeps working — your workouts live on this device and sync when you're back online.",
  offlineCta: 'Open Today',
};

/**
 * First-paint value for a gate key. Returns the key only if it does not exist,
 * which `gateFirstPaint.test.ts` forbids for every call site in the gate.
 */
export function gateEnFloor(key: string): string {
  return GATE_EN[key] ?? key;
}
