/**
 * First-visit language + country preference.
 * Persist: safeStorage + strictly-necessary first-party cookies.
 * Country policy: supportedRegions.ts — language never unlocks hosted service.
 */

import {
  htmlLangTag,
  isRtlLang,
  normalizeUiLang,
  type UiLang,
} from '@/i18n/appLangs';
import {
  countryFromLocaleTag,
  countryFromTimeZone,
  isIsoCountry,
} from '@/lib/i18n/countries';
import {
  getTerritoryBlockReason,
  isHostedServiceSupportedCountry,
} from '@/lib/legal/supportedRegions';
import { normalizeCountryCode } from '@/lib/regionDefaults';
import {
  COUNTRY_COOKIE,
  LOCALE_COOKIE,
  readPrefCookie,
  writePrefCookie,
} from '@/lib/storage/prefCookie';
import { I18N_LANG_KEY, STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export type LocaleCountryPref = {
  language: UiLang;
  country: string;
};

export function hasConfirmedLocaleChoice(): boolean {
  if (readRaw(STORAGE_KEYS.localeChoice) === '1') return true;
  if (readRaw(STORAGE_KEYS.langExplicit) === '1' && readRaw(STORAGE_KEYS.countryPref)) {
    return true;
  }
  const cookieLang = readPrefCookie(LOCALE_COOKIE);
  const cookieCountry = readPrefCookie(COUNTRY_COOKIE);
  return Boolean(cookieLang && cookieCountry);
}

export function loadLocaleCountryPref(): LocaleCountryPref | null {
  const langRaw =
    readRaw(STORAGE_KEYS.localeChoice) === '1'
      ? readPrefCookie(LOCALE_COOKIE) ?? readRaw(I18N_LANG_KEY)
      : readPrefCookie(LOCALE_COOKIE) ??
        (readRaw(STORAGE_KEYS.langExplicit) === '1' ? readRaw(I18N_LANG_KEY) : null);
  const countryRaw = readRaw(STORAGE_KEYS.countryPref) ?? readPrefCookie(COUNTRY_COOKIE);
  if (!langRaw && !countryRaw) return null;
  return {
    language: normalizeUiLang(langRaw),
    country: normalizeCountryCode(countryRaw) ?? 'XX',
  };
}

export function persistLocaleCountryPref(pref: LocaleCountryPref): void {
  const language = normalizeUiLang(pref.language);
  const country = normalizeCountryCode(pref.country) ?? pref.country.trim().toUpperCase();
  writeRaw(STORAGE_KEYS.langExplicit, '1');
  writeRaw(STORAGE_KEYS.localeChoice, '1');
  writeRaw(STORAGE_KEYS.countryPref, country);
  writeRaw(I18N_LANG_KEY, language);
  writePrefCookie(LOCALE_COOKIE, language);
  writePrefCookie(COUNTRY_COOKIE, country);
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('mw-locale-pref', { detail: { language, country } })
      );
    }
  } catch {
    /* tests */
  }
}

export function detectLanguageHint(opts?: {
  acceptLanguage?: string | null;
  queryHl?: string | null;
}): UiLang {
  if (opts?.queryHl) return normalizeUiLang(opts.queryHl);
  const saved = readPrefCookie(LOCALE_COOKIE);
  if (saved) return normalizeUiLang(saved);
  const stored = readRaw(I18N_LANG_KEY);
  if (stored) return normalizeUiLang(stored);
  const header = opts?.acceptLanguage;
  if (header) {
    for (const part of header.split(',')) {
      const tag = part.trim().split(';')[0]?.trim();
      if (tag) return normalizeUiLang(tag);
    }
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.languages?.length) {
      for (const tag of navigator.languages) {
        const ui = normalizeUiLang(tag);
        if (ui !== 'en' || tag.toLowerCase().startsWith('en')) return ui;
      }
      return normalizeUiLang(navigator.languages[0]);
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      return normalizeUiLang(navigator.language);
    }
  } catch {
    /* */
  }
  return 'en';
}

/**
 * Country hint only. Does not unlock hosted service.
 * Prefer geo / tz / locale region — never invent a served country to hide a block.
 */
export function detectCountryHint(opts?: {
  acceptLanguage?: string | null;
  geoCountry?: string | null;
  languageTag?: string | null;
}): string {
  const saved = readRaw(STORAGE_KEYS.countryPref) ?? readPrefCookie(COUNTRY_COOKIE);
  const fromSaved = normalizeCountryCode(saved);
  if (fromSaved) return fromSaved;

  const fromGeo = normalizeCountryCode(opts?.geoCountry);
  if (fromGeo) return fromGeo;
  if (opts?.geoCountry === 'XX' || opts?.geoCountry === 'T1') return opts.geoCountry;

  const fromTz = countryFromTimeZone();
  if (fromTz) return fromTz;

  const fromTag = countryFromLocaleTag(opts?.languageTag ?? opts?.acceptLanguage?.split(',')[0]);
  if (fromTag) return fromTag;

  try {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const fromNav = countryFromLocaleTag(navigator.language);
      if (fromNav) return fromNav;
    }
  } catch {
    /* */
  }
  return 'US';
}

export function applyDocumentLang(language: UiLang): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.lang = htmlLangTag(language);
  html.dir = isRtlLang(language) ? 'rtl' : 'ltr';
}

export function countryBlocksHosted(country: string | null | undefined): boolean {
  return getTerritoryBlockReason(country) != null;
}

export function countryAllowsHosted(country: string | null | undefined): boolean {
  return isHostedServiceSupportedCountry(country);
}

/**
 * Persist country: geo-block wins. A served picker choice cannot hide a
 * detected blocked territory.
 */
export function resolvePersistCountry(opts: {
  detected?: string | null;
  picked?: string | null;
}): string {
  const rawDetected = opts.detected?.trim().toUpperCase() ?? '';
  const detected =
    rawDetected === 'XX' || rawDetected === 'T1'
      ? rawDetected
      : normalizeCountryCode(opts.detected);
  if (detected && getTerritoryBlockReason(detected)) return detected;

  const picked = normalizeCountryCode(opts.picked);
  if (picked && isHostedServiceSupportedCountry(picked)) return picked;
  if (detected) return detected;
  return 'US';
}

export { isIsoCountry };
