/**
 * Hosted Mission Winning service territory (consumer product).
 * Founder policy 2026-08: **Europe is not supported**.
 *
 * Not legal advice. Maps ISO 3166-1 alpha-2 → supported / excluded for
 * product copy, signup honesty, and future billing-country checks.
 */

/** EEA + UK + Switzerland + common associated European microstates/territories. */
export const EUROPE_UNSUPPORTED_ISO2 = [
  // EEA / EU core
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czechia
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
  // EEA non-EU
  'IS', // Iceland
  'LI', // Liechtenstein
  'NO', // Norway
  // UK + CH
  'GB', // United Kingdom
  'UK', // alias sometimes seen in billing
  'CH', // Switzerland
  // Microstates / commonly treated with Europe for consumer geo policy
  'AD', // Andorra
  'MC', // Monaco
  'SM', // San Marino
  'VA', // Vatican
  'AX', // Åland
  'FO', // Faroe Islands
  'GI', // Gibraltar
  'GG', // Guernsey
  'IM', // Isle of Man
  'JE', // Jersey
  'SJ', // Svalbard and Jan Mayen
] as const;

export type EuropeUnsupportedIso2 = (typeof EUROPE_UNSUPPORTED_ISO2)[number];

const EUROPE_SET = new Set<string>(EUROPE_UNSUPPORTED_ISO2.map((c) => c.toUpperCase()));

/** Normalize free-text / billing country codes. */
export function normalizeCountryIso2(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim().toUpperCase();
  if (!t) return null;
  // common aliases
  if (t === 'UK') return 'GB';
  if (t.length === 2 && /^[A-Z]{2}$/.test(t)) return t;
  return null;
}

/** True if ISO2 is in the Europe-not-supported set. */
export function isEuropeanTerritory(countryRaw: string | null | undefined): boolean {
  const iso = normalizeCountryIso2(countryRaw);
  if (!iso) return false;
  return EUROPE_SET.has(iso) || EUROPE_SET.has(countryRaw!.trim().toUpperCase());
}

/**
 * Hosted consumer service (accounts, cloud sync, Super Bundle checkout, Android
 * store product as we distribute it) is offered only outside Europe.
 * Unknown / missing country → treat as *not confirmed supported* for gated
 * actions that require a jurisdiction (payments); local free logger remains
 * available on device without an account.
 */
export function isHostedServiceSupportedCountry(countryRaw: string | null | undefined): boolean {
  const iso = normalizeCountryIso2(countryRaw);
  if (!iso) return false;
  return !isEuropeanTerritory(iso);
}

/** Human-readable short labels for the Supported Regions page. */
export const REGION_POLICY = {
  primaryMarket: 'United States',
  /** One-line product posture */
  summary:
    'Mission Winning’s hosted consumer service is offered outside Europe. Residents of the EEA, the United Kingdom, Switzerland, and listed associated territories are not supported.',
  excludedLabel: 'Europe (EEA, United Kingdom, Switzerland, and associated territories)',
  supportEmail: 'support@missionwinning.com',
} as const;
