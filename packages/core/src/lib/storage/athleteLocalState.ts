/**
 * Athlete-local storage scope (P1-5).
 *
 * Sign-out used to leave every `mw_*` key in place. The next account then
 * OR-merged `readiness.parq` and pushed it to that profile. Wipe athlete
 * keys on **explicit** sign-out, bind an owner on sign-in, and never merge
 * foreign or guest health into another account.
 *
 * `.941` — Supabase also emits `SIGNED_OUT` on boot-with-no-session, expired
 * JWT, and demo mode. Those are not a leave. Wiping there deletes a guest's
 * local log (the product promise). Wipe only when `planSignedOutStorage`
 * says so.
 *
 * `.949` — unbound guest `SIGNED_IN` adopts without wiping `WORKOUT_STORE_KEY`.
 * Foreign owner still replaces. Restricted health still strips on adopt.
 */
import {
  MW_PREFIX,
  STORAGE_KEYS,
  STORAGE_KEY_PREFIXES,
  WORKOUT_STORE_KEY,
} from '@/lib/storage/keys';
import { keysWithPrefix, readRaw, remove, writeRaw } from '@/lib/storage/safeStorage';

/** Device / consent keys that are not one athlete's health or logs. */
export const ATHLETE_LOCAL_KEEP = [
  STORAGE_KEYS.privacyConsent,
  STORAGE_KEYS.analyticsPref,
  STORAGE_KEYS.localeChoice,
  STORAGE_KEYS.langExplicit,
  STORAGE_KEYS.countryPref,
  STORAGE_KEYS.regionDefaults,
  STORAGE_KEYS.privateAccess,
  STORAGE_KEYS.whatsNewSeenLabel,
  STORAGE_KEYS.explicitSignOut,
] as const;

/** How long an explicit sign-out mark stays valid across tabs. */
export const EXPLICIT_SIGN_OUT_FRESH_MS = 30_000;

export type SignedOutStoragePlan = 'wipe-athlete' | 'keep-local';

/**
 * `SIGNED_OUT` is not "the athlete asked to leave".
 * Boot / expiry / demo keep the device log. Only an explicit mark wipes.
 */
export function planSignedOutStorage(opts: {
  explicitSignOut: boolean;
}): SignedOutStoragePlan {
  return opts.explicitSignOut ? 'wipe-athlete' : 'keep-local';
}

export function markExplicitSignOut(now = Date.now()): void {
  writeRaw(STORAGE_KEYS.explicitSignOut, String(now));
}

export function hasFreshExplicitSignOut(now = Date.now()): boolean {
  const raw = readRaw(STORAGE_KEYS.explicitSignOut);
  const at = raw ? Number(raw) : NaN;
  if (!Number.isFinite(at) || at <= 0) return false;
  const age = now - at;
  return age >= 0 && age < EXPLICIT_SIGN_OUT_FRESH_MS;
}

export function applySignedOutStorage(opts: {
  explicitSignOut: boolean;
}): SignedOutStoragePlan {
  const plan = planSignedOutStorage(opts);
  if (plan === 'wipe-athlete') clearAthleteLocalState();
  return plan;
}

const KEEP = new Set<string>(ATHLETE_LOCAL_KEEP);

const RESTRICTED_HEALTH_KEYS = [
  STORAGE_KEYS.lastAssessment,
  STORAGE_KEYS.pregnancyFlag,
  STORAGE_KEYS.mindCheckIns,
  STORAGE_KEYS.bodyMetrics,
  STORAGE_KEYS.sessionJournal,
] as const;

export type SignInStoragePlan = 'merge' | 'replace-from-cloud' | 'adopt-guest-sans-health';

/**
 * Unbound guest is always adopt — even when the account already has a cloud
 * journey. `replace-from-cloud` used to wipe `WORKOUT_STORE_KEY` on that path,
 * so a guest who logged then signed in lost the log (`.949`).
 *
 * `cloudHasJourney` stays on the signature so callers share one plan; it does
 * not choose wipe-vs-keep. Journey/prefs apply mode is decided after this.
 */
export function planSignInStorage(
  owner: string | null | undefined,
  userId: string,
  _cloudHasJourney: boolean
): SignInStoragePlan {
  if (owner === userId) return 'merge';
  if (owner && owner !== userId) return 'replace-from-cloud';
  return 'adopt-guest-sans-health';
}

/** Guest or same-owner local history is this athlete. Foreign leftover is not. */
export function shouldAdoptGuestHistory(plan: SignInStoragePlan): boolean {
  return plan === 'adopt-guest-sans-health' || plan === 'merge';
}

/**
 * Local mutation only. Cloud apply / bind / push stay in `syncJourneyOnSignIn`.
 * Adopt strips restricted health and **keeps** the workout store.
 */
export function applySignInStoragePlan(plan: SignInStoragePlan): void {
  if (plan === 'replace-from-cloud') {
    clearAthleteLocalState();
    return;
  }
  if (plan === 'adopt-guest-sans-health') {
    stripRestrictedHealthLocal();
  }
}

export function readStorageOwner(): string | null {
  const raw = readRaw(STORAGE_KEYS.storageOwner);
  return raw && raw.length > 0 ? raw : null;
}

export function bindStorageOwner(userId: string): void {
  writeRaw(STORAGE_KEYS.storageOwner, userId);
}

/** Drop PAR-Q / pregnancy / mind / body so a guest device cannot attach them. */
export function stripRestrictedHealthLocal(): void {
  for (const key of RESTRICTED_HEALTH_KEYS) remove(key);
  const raw = readRaw(STORAGE_KEYS.journeyState);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { readiness?: { parq?: boolean } };
    if (parsed.readiness) parsed.readiness.parq = false;
    writeRaw(STORAGE_KEYS.journeyState, JSON.stringify(parsed));
  } catch {
    remove(STORAGE_KEYS.journeyState);
  }
}

/**
 * Remove athlete-owned keys. Consent, analytics choice, locale, region, and
 * the local gate flag stay. Prefix families (`mw_event_*`, …) go too.
 */
export function clearAthleteLocalState(): void {
  for (const key of keysWithPrefix(MW_PREFIX)) {
    if (!KEEP.has(key)) remove(key);
  }
  remove(WORKOUT_STORE_KEY);
  for (const prefix of Object.values(STORAGE_KEY_PREFIXES)) {
    for (const key of keysWithPrefix(prefix)) remove(key);
  }
}
