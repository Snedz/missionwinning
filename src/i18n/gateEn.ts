/**
 * English gate + offline copy, and the first-paint floor that reads it.
 *
 * Split out of `gateLocales.ts` (`.765`) for two reasons:
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

import { LOCAL_FIRST_COPY } from '@/lib/localFirstCopy';

export const GATE_EN: Record<string, string> = {
  gateEyebrow: 'Free beta',
  gateTitle1: 'Train anywhere.',
  gateTitle2: 'Win daily.',
  gateSubtitle:
    'Free offline workout logging plus Mission Coach — weekly plans from your logs alone, no wearable. The logger stays free forever.',
  /**
   * `.766` — the mechanism, not the adjective. CN/HK respondents believed the
   * offline claim (3.97) and not the implementation; "offline" is the word an app
   * with forced sync would also use, so the poster now says what actually
   * happens. Single source: `LOCAL_FIRST_COPY.gateLocalFirst`.
   */
  gateLocalFirst: LOCAL_FIRST_COPY.gateLocalFirst,
  gateFooterTagline: 'free core forever',
  /**
   * `.770` — the gate's own way into the other 39 languages.
   *
   * Deliberately names a language rather than saying "Language": the visitor who
   * needs this one cannot necessarily read the label. Until `.770` the only route
   * was a sheet that opened itself over the poster and covered "Log a set".
   */
  gateLanguageCta: 'Language / 语言 / Español',
  /**
   * `.769` — the gate's one red action, and the only honest one it has ever had.
   *
   * The logger is free, needs no account, and `/active` is reachable while the
   * gate is up, so this is a door rather than a pitch. Shard 1 (US/LatAm) put the
   * invite wall in ~27% of rows; an email form as the only thing on offer is what
   * that wall looked like.
   */
  gateFreeLoggerEyebrow: 'Free, right now — no invite needed',
  gateFreeLoggerCta: 'Log a set',
  gateFreeLoggerFoot:
    'The workout logger is open to everyone: no account, no invite, sets written to this device. An invite adds Today, Mission Coach and sync.',
  gateWaitlistTitle: 'Get notified',
  gateWaitlistPlaceholder: 'you@example.com',
  gateWaitlistEmailLabel: 'Email',
  gateWaitlistSubmit: 'Get notified',
  gateWaitlistSubmitting: 'Joining…',
  gateWaitlistDone: "You're on the list.",
  gateWaitlistDoneFoot: "We'll email you when the beta opens.",
  gateWaitlistFoot: 'No spam — one email when the beta opens.',
  gateWaitlistFailed: 'That did not save. Check your connection and try again.',
  gateAccessSummary: 'Enter with code',
  gateAccessLabel: 'Access code',
  gateAccessPlaceholder: 'Enter your access code',
  gateAccessSubmit: 'Enter with code',
  gateAccessChecking: 'Checking…',
  gateCheckingSession: 'Confirming access…',
  gateInviteEyebrow: 'Access code',
  gateInviteHeadline: 'Enter your access code to join the beta.',
  gateInviteSubtitle:
    'Enter the access code from your email, then complete I-Day and log your first workout.',
  gateBetaGuide: 'beta start guide',
  gateBetaGuideFoot: 'Have a code? See the',
  cinePublicLine: 'Train Anywhere. Win Daily.',
  cineHeroHeadline: 'Log a set. Offline.',
  cineHeroLead: 'Mission Coach plans the week from the log. No wearable.',
  cineWeekKicker: 'Mission Coach',
  cineWeekTitle: 'A logged set is a new plan.',
  cineWeekLead:
    'Miss a day, travel, only a band — the week reshapes from the log. Not from a wearable, not from a schedule you already broke.',
  cineWeekWhy:
    'Wednesday was a gym squat. You logged travel. The session became a hotel-room push-up. The week did not fail.',
  cineAnywhereKicker: 'Anywhere',
  cineAnywhereTitle: 'Garage. Hotel carpet. A park at dusk.',
  cineAnywhereLead:
    'Sets save on the device. Signal is optional. The plan comes from what you logged, so nothing needs charging for it to work.',
  cineLater: 'Mission Winning Health. Later: an athlete page you author. Not a feed.',
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
