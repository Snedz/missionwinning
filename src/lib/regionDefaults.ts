/**
 * Map CDN country (ISO 3166-1 alpha-2) → default app language + units.
 * First-visit only — never overrides explicit Profile choices.
 */

import { isAppLang, type AppLang, normalizeAppLang } from '@/i18n/appLangs';
import type { UnitsPref } from '@/lib/units';
import { STORAGE_KEYS } from '@/lib/storage/keys';

/** Liberia, Myanmar, United States — customary imperial for bodyweight/gym. */
const IMPERIAL_COUNTRIES = new Set(['US', 'LR', 'MM']);

/** Country → preferred app language (must be in APP_LANGS). */
const COUNTRY_LANG: Record<string, AppLang> = {
  US: 'en',
  GB: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
  CA: 'en',
  IN: 'hi',
  PK: 'en',
  NG: 'en',
  ZA: 'en',
  PH: 'en',
  SG: 'en',
  MY: 'en',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
  VE: 'es',
  EC: 'es',
  GT: 'es',
  CU: 'es',
  DO: 'es',
  HN: 'es',
  BO: 'es',
  PY: 'es',
  SV: 'es',
  NI: 'es',
  CR: 'es',
  PA: 'es',
  UY: 'es',
  CH: 'de',
  BR: 'pt',
  PT: 'pt',
  AO: 'pt',
  MZ: 'pt',
  DE: 'de',
  AT: 'de',
  LI: 'de',
  IT: 'it',
  SM: 'it',
  VA: 'it',
  RU: 'ru',
  BY: 'ru',
  KZ: 'ru',
  KG: 'ru',
  KR: 'ko',
  JP: 'ja',
  TH: 'th',
  VN: 'vi',
  CN: 'zh',
  TW: 'zh',
  HK: 'zh',
  MO: 'zh',
  ID: 'id',
  SA: 'ar',
  AE: 'ar',
  EG: 'ar',
  IQ: 'ar',
  JO: 'ar',
  KW: 'ar',
  LB: 'ar',
  MA: 'ar',
  OM: 'ar',
  QA: 'ar',
  BH: 'ar',
  DZ: 'ar',
  TN: 'ar',
  YE: 'ar',
  SY: 'ar',
  LY: 'ar',
  SD: 'ar',
};

export type RegionDefaults = {
  country: string;
  language: AppLang;
  units: UnitsPref;
};

export function normalizeCountryCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cc = raw.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc) || cc === 'XX' || cc === 'T1') return null;
  return cc;
}

export function unitsForCountry(country: string | null): UnitsPref {
  if (country && IMPERIAL_COUNTRIES.has(country)) return 'imperial';
  return 'metric';
}

export function languageForCountry(country: string | null): AppLang {
  if (!country) return 'en';
  const mapped = COUNTRY_LANG[country];
  if (mapped && isAppLang(mapped)) return mapped;
  return 'en';
}

export function regionDefaultsForCountry(countryRaw: string | null | undefined): RegionDefaults {
  const country = normalizeCountryCode(countryRaw) ?? 'XX';
  const resolved = country === 'XX' ? null : country;
  return {
    country: resolved ?? 'XX',
    language: languageForCountry(resolved),
    units: unitsForCountry(resolved),
  };
}

/** Prefer Accept-Language when it maps to an app lang and country is unknown/ambiguous. */
export function languageFromAcceptLanguage(header: string | null | undefined): AppLang | null {
  if (!header) return null;
  for (const part of header.split(',')) {
    const tag = part.trim().split(';')[0]?.trim();
    if (!tag) continue;
    const normalized = normalizeAppLang(tag);
    if (isAppLang(normalized)) return normalized;
  }
  return null;
}

export function resolveRegionDefaults(opts: {
  countryHeader?: string | null;
  acceptLanguage?: string | null;
}): RegionDefaults {
  const country = normalizeCountryCode(opts.countryHeader);
  const fromCountry = regionDefaultsForCountry(country);
  // When CDN has no country, fall back to Accept-Language for language only.
  if (!country) {
    const fromAl = languageFromAcceptLanguage(opts.acceptLanguage ?? null);
    return {
      country: 'XX',
      language: fromAl ?? 'en',
      units: 'metric',
    };
  }
  return fromCountry;
}

export const REGION_DEFAULTS_APPLIED_KEY = STORAGE_KEYS.regionDefaults;
export const UNITS_EXPLICIT_KEY = STORAGE_KEYS.unitsExplicit;
export const LANG_EXPLICIT_KEY = STORAGE_KEYS.langExplicit;
export const UNITS_STORAGE_KEY = STORAGE_KEYS.units;
