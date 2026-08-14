/**
 * Athlete-local storage scope (P1-5).
 *
 * Sign-out used to leave every `mw_*` key in place. The next account then
 * OR-merged `readiness.parq` and pushed it to that profile. Wipe athlete
 * keys on sign-out, bind an owner on sign-in, and never merge foreign or
 * guest health into another account.
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
] as const;

const KEEP = new Set<string>(ATHLETE_LOCAL_KEEP);

const RESTRICTED_HEALTH_KEYS = [
  STORAGE_KEYS.lastAssessment,
  STORAGE_KEYS.pregnancyFlag,
  STORAGE_KEYS.mindCheckIns,
  STORAGE_KEYS.bodyMetrics,
  STORAGE_KEYS.sessionJournal,
] as const;

export type SignInStoragePlan = 'merge' | 'replace-from-cloud' | 'adopt-guest-sans-health';

export function planSignInStorage(
  owner: string | null | undefined,
  userId: string,
  cloudHasJourney: boolean
): SignInStoragePlan {
  if (owner === userId) return 'merge';
  if (owner && owner !== userId) return 'replace-from-cloud';
  return cloudHasJourney ? 'replace-from-cloud' : 'adopt-guest-sans-health';
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
