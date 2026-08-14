/**
 * The cookie / device-storage inventory the `/cookies` page renders.
 *
 * Data, not prose, so a test can cross-check every named key against the
 * registries that own them (`STORAGE_KEYS`, `PRIVATE_ACCESS_COOKIE`) — a policy
 * page that names keys nobody sets, or misses keys the app does set, attests to
 * the wrong thing.
 *
 * Deliberately does not import `privateSession.ts` (it pulls node `crypto`,
 * which cannot ride into a client bundle) — the gate cookie name is pinned here
 * and `cookiePolicy.test.ts` asserts it equals `PRIVATE_ACCESS_COOKIE`.
 */

import {
  I18N_LANG_KEY,
  MW_PREFIX,
  STORAGE_KEYS,
  WORKOUT_STORE_KEY,
} from "@/lib/storage/keys";

export type StorageEntryKind = "cookie" | "localStorage";

export type StorageCategory = "necessary" | "functional" | "consent";

export type StorageEntry = {
  /** Exact name, or a documented pattern for families (marked `isPattern`). */
  name: string;
  isPattern?: boolean;
  kind: StorageEntryKind;
  category: StorageCategory;
  purpose: string;
  retention: string;
};

/** Pinned copy of `PRIVATE_ACCESS_COOKIE` — equality asserted by the test. */
export const GATE_COOKIE_NAME = "mw_private_access";

export const STORAGE_INVENTORY: StorageEntry[] = [
  {
    name: "sb-*-auth-token",
    isPattern: true,
    kind: "cookie",
    category: "necessary",
    purpose:
      "Sign-in session (Supabase Auth). httpOnly — not readable by page scripts.",
    retention: "Until sign-out or token expiry",
  },
  {
    name: GATE_COOKIE_NAME,
    kind: "cookie",
    category: "necessary",
    purpose:
      "Private-beta gate session. httpOnly, HMAC-signed — proves gate access only.",
    retention: "30 days",
  },
  {
    name: STORAGE_KEYS.privacyConsent,
    kind: "localStorage",
    category: "necessary",
    purpose: "Records the Terms & Privacy version you accepted before sign-in.",
    retention: "Until you clear site data",
  },
  {
    name: STORAGE_KEYS.analyticsPref,
    kind: "localStorage",
    category: "necessary",
    purpose:
      "Stores your analytics choice (allow / stay private) so we can honor it.",
    retention: "Until you clear site data",
  },
  {
    name: STORAGE_KEYS.attribution,
    kind: "localStorage",
    category: "consent",
    purpose:
      "First-touch attribution. Referral/invite codes are stored to honor the link you clicked; campaign fields (utm, referrer, landing page) are stored only after you allow analytics.",
    retention: "Until you clear site data",
  },
  {
    name: STORAGE_KEYS.deviceId,
    kind: "localStorage",
    category: "functional",
    purpose:
      "Random device identifier for optional push scheduling and AI usage metering without an account. Never linked to your workout history.",
    retention: "Until you clear site data",
  },
  {
    name: `${MW_PREFIX}*`,
    isPattern: true,
    kind: "localStorage",
    category: "functional",
    purpose:
      "Your app data — workouts, nutrition, journey, preferences. Local-first: it leaves this device only when you sign in to sync.",
    retention:
      "Until you clear it (non-training history trims itself after 90 days)",
  },
  {
    name: WORKOUT_STORE_KEY,
    kind: "localStorage",
    category: "functional",
    purpose:
      "Active workout session state, so an in-progress session survives a reload.",
    retention: "Until you clear site data",
  },
  {
    name: I18N_LANG_KEY,
    kind: "localStorage",
    category: "functional",
    purpose: "Your language choice.",
    retention: "Until you clear site data",
  },
  {
    name: "mw_locale",
    kind: "cookie",
    category: "necessary",
    purpose:
      "Remembers the language you confirmed on first visit (display preference only — not a served-market claim).",
    retention: "1 year",
  },
  {
    name: "mw_country",
    kind: "cookie",
    category: "necessary",
    purpose:
      "Remembers the country you confirmed, or a detected blocked territory so hosted signup/checkout stay closed.",
    retention: "1 year",
  },
  {
    name: STORAGE_KEYS.localeChoice,
    kind: "localStorage",
    category: "necessary",
    purpose: "Records that the first-visit language and country chooser was confirmed.",
    retention: "Until you clear site data",
  },
  {
    name: STORAGE_KEYS.countryPref,
    kind: "localStorage",
    category: "necessary",
    purpose: "ISO country preference paired with the language choice.",
    retention: "Until you clear site data",
  },
  {
    name: "ph_*",
    isPattern: true,
    kind: "localStorage",
    category: "consent",
    purpose:
      "PostHog product-analytics state (EU-hosted). Exists only if you allow analytics; never session recording.",
    retention: "Until you clear site data or opt out",
  },
];
