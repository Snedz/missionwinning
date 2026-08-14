/**
 * Hosted Mission Winning service territory (consumer product).
 * Global product with founder commercial exclusions (2026-08):
 * - Europe not supported (EEA, UK, CH + associated)
 * - Organisation of Islamic Cooperation (OIC) 57 member states not supported
 * - Canada not supported
 * - Ukraine not supported (commercial product exclusion — not marketed as
 *   single-country sanctions compliance)
 * - France not supported (also in Europe list)
 *
 * Cloudflare already blocks many of these at the edge; this module is the
 * in-app hard block for signup + checkout (defense in depth).
 *
 * Not legal advice. Consumer-facing copy uses multi-jurisdiction sanctions /
 * trade-control language (global platform posture). Do not market the UA
 * commercial block as “sanctions compliance.” RU/BY remain open by founder choice.
 */

/** EEA + UK + Switzerland + common associated European microstates/territories. */
export const EUROPE_UNSUPPORTED_ISO2 = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR', // France (explicit founder exclusion)
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'IS',
  'LI',
  'NO',
  'GB',
  'UK',
  'CH',
  'AD',
  'MC',
  'SM',
  'VA',
  'AX',
  'FO',
  'GI',
  'GG',
  'IM',
  'JE',
  'SJ',
] as const;

/**
 * Organisation of Islamic Cooperation — 57 member states (ISO 3166-1 alpha-2).
 * Palestine uses PS. Türkiye uses TR.
 */
export const OIC_UNSUPPORTED_ISO2 = [
  'AF', // Afghanistan
  'AL', // Albania
  'DZ', // Algeria
  'AZ', // Azerbaijan
  'BH', // Bahrain
  'BD', // Bangladesh
  'BJ', // Benin
  'BN', // Brunei
  'BF', // Burkina Faso
  'CM', // Cameroon
  'TD', // Chad
  'KM', // Comoros
  'CI', // Côte d'Ivoire
  'DJ', // Djibouti
  'EG', // Egypt
  'GA', // Gabon
  'GM', // Gambia
  'GN', // Guinea
  'GW', // Guinea-Bissau
  'GY', // Guyana
  'ID', // Indonesia
  'IR', // Iran
  'IQ', // Iraq
  'JO', // Jordan
  'KZ', // Kazakhstan
  'KW', // Kuwait
  'KG', // Kyrgyzstan
  'LB', // Lebanon
  'LY', // Libya
  'MY', // Malaysia
  'MV', // Maldives
  'ML', // Mali
  'MR', // Mauritania
  'MA', // Morocco
  'MZ', // Mozambique
  'NE', // Niger
  'NG', // Nigeria
  'OM', // Oman
  'PK', // Pakistan
  'PS', // Palestine
  'QA', // Qatar
  'SA', // Saudi Arabia
  'SN', // Senegal
  'SL', // Sierra Leone
  'SO', // Somalia
  'SD', // Sudan
  'SR', // Suriname
  'SY', // Syria
  'TJ', // Tajikistan
  'TG', // Togo
  'TN', // Tunisia
  'TR', // Türkiye
  'TM', // Turkmenistan
  'UG', // Uganda
  'AE', // United Arab Emirates
  'UZ', // Uzbekistan
  'YE', // Yemen
] as const;

/**
 * Additional founder commercial exclusions outside Europe/OIC.
 * Reasons are mapped per-code in {@link getTerritoryBlockReason} — do not assume
 * every entry is "canada".
 */
export const EXTRA_UNSUPPORTED_ISO2 = [
  'CA', // Canada
  'UA', // Ukraine (commercial exclusion — not marketed as sanctions)
] as const;

export type TerritoryBlockReason =
  | 'europe'
  | 'oic'
  | 'canada'
  | 'ukraine'
  | 'unknown_edge';

const EUROPE_SET = new Set<string>(EUROPE_UNSUPPORTED_ISO2.map((c) => c.toUpperCase()));
const OIC_SET = new Set<string>(OIC_UNSUPPORTED_ISO2.map((c) => c.toUpperCase()));
const EXTRA_SET = new Set<string>(EXTRA_UNSUPPORTED_ISO2.map((c) => c.toUpperCase()));

/** Normalize free-text / billing / CDN country codes. */
export function normalizeCountryIso2(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim().toUpperCase();
  if (!t) return null;
  if (t === 'UK') return 'GB';
  if (t === 'XX' || t === 'T1') return t; // Cloudflare unknown / Tor
  if (t.length === 2 && /^[A-Z]{2}$/.test(t)) return t;
  return null;
}

export function isEuropeanTerritory(countryRaw: string | null | undefined): boolean {
  const iso = normalizeCountryIso2(countryRaw);
  if (!iso || iso === 'XX' || iso === 'T1') return false;
  return EUROPE_SET.has(iso);
}

export function isOicMemberTerritory(countryRaw: string | null | undefined): boolean {
  const iso = normalizeCountryIso2(countryRaw);
  if (!iso || iso === 'XX' || iso === 'T1') return false;
  return OIC_SET.has(iso);
}

export function getTerritoryBlockReason(
  countryRaw: string | null | undefined
): TerritoryBlockReason | null {
  const iso = normalizeCountryIso2(countryRaw);
  if (!iso) return null;
  if (iso === 'XX' || iso === 'T1') return 'unknown_edge';
  if (iso === 'CA') return 'canada';
  if (iso === 'UA') return 'ukraine';
  if (EXTRA_SET.has(iso)) {
    // Future EXTRA codes must get an explicit branch above — never silently
    // mislabel (the prior bug mapped every EXTRA entry to "canada").
    return 'unknown_edge';
  }
  if (EUROPE_SET.has(iso)) return 'europe';
  if (OIC_SET.has(iso)) return 'oic';
  return null;
}

/** True when this ISO is on the founder hard-block list (incl. CF unknown/Tor). */
export function isHostedServiceTerritoryBlocked(countryRaw: string | null | undefined): boolean {
  return getTerritoryBlockReason(countryRaw) != null;
}

/**
 * Hosted consumer service allowed for known, non-blocked countries only.
 * Unknown/missing country → not confirmed supported (strict for payments UI that
 * already has a CDN country; APIs use {@link hostedServiceAccessFromHeaders}).
 */
export function isHostedServiceSupportedCountry(countryRaw: string | null | undefined): boolean {
  const iso = normalizeCountryIso2(countryRaw);
  if (!iso || iso === 'XX' || iso === 'T1') return false;
  return !isHostedServiceTerritoryBlocked(iso);
}

export type HostedServiceAccess =
  | { allowed: true; country: string | null }
  | {
      allowed: false;
      country: string | null;
      reason: TerritoryBlockReason;
      code: 'territory_blocked';
      message: string;
    };

export const TERRITORY_BLOCK_MESSAGES: Record<TerritoryBlockReason, string> = {
  europe:
    'Mission Winning’s hosted service is not available in Europe (including France, the EEA, the UK, and Switzerland).',
  oic: 'Mission Winning’s hosted service is not available in Organisation of Islamic Cooperation member states.',
  canada: 'Mission Winning’s hosted service is not available in Canada.',
  ukraine: 'Mission Winning’s hosted service is not available in Ukraine.',
  /**
   * `.769` — the cause, not just the verdict.
   *
   * Shard 1 (US/LatAm, ops #16) reports the geo-block reading as a broken page,
   * and US/LatAm are **supported** territories — so the state these respondents
   * hit is almost certainly this one: Cloudflare could not place the connection
   * (`XX`/`T1`), which a VPN, a privacy browser or a carrier proxy will do
   * routinely on mobile networks in the region. "We could not confirm a supported
   * region" told them nothing they could act on, and the old sentence read like a
   * rejection of *them* rather than a limit of *us*.
   */
  unknown_edge:
    'We could not tell which country this connection is coming from — a VPN, a privacy browser or a carrier proxy will do that. Hosted signup and checkout stay unavailable until we can, and turning a VPN off usually resolves it.',
};

/** Platform-set country headers. `x-country-code` is not trusted for access. */
const PLATFORM_COUNTRY_HEADER_NAMES = ['cf-ipcountry', 'x-vercel-ip-country'] as const;

function countriesFromNamedHeaders(
  headers: { get(name: string): string | null },
  names: readonly string[]
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    const iso = normalizeCountryIso2(headers.get(name));
    if (iso && !seen.has(iso)) {
      seen.add(iso);
      out.push(iso);
    }
  }
  return out;
}

/** Platform CDN countries only (Cloudflare / Vercel). Used for the hard block. */
export function countriesFromRequestHeaders(headers: {
  get(name: string): string | null;
}): string[] {
  return countriesFromNamedHeaders(headers, PLATFORM_COUNTRY_HEADER_NAMES);
}

/** Read CDN country from request headers. Display hint — may include `x-country-code`. */
/**
 * Re-exported from [territoryCopy.ts](./territoryCopy.ts) so client components can
 * render the sentence without pulling ~100 ISO codes into their route (`.769`).
 */
export { TERRITORY_STILL_WORKS } from '@/lib/legal/territoryCopy';

/** Read CDN country from request headers (Cloudflare / Vercel). */
export function countryFromRequestHeaders(headers: {
  get(name: string): string | null;
}): string | null {
  return (
    countriesFromNamedHeaders(headers, [
      ...PLATFORM_COUNTRY_HEADER_NAMES,
      'x-country-code',
    ])[0] ?? null
  );
}

/**
 * Hard block for signup + checkout APIs.
 * - Known blocked country on **any** platform CDN header → deny (a supported
 *   ISO on another header does not override)
 * - XX / T1 (CF unknown / Tor) → deny
 * - Missing header locally / on `next start` → allow
 * - Missing header on Vercel production (`VERCEL_ENV=production`) → deny
 */
export function hostedServiceAccessFromHeaders(headers: {
  get(name: string): string | null;
}): HostedServiceAccess {
  const countries = countriesFromRequestHeaders(headers);

  if (countries.length === 0) {
    if (process.env.VERCEL_ENV === 'production') {
      return {
        allowed: false,
        country: null,
        reason: 'unknown_edge',
        code: 'territory_blocked',
        message: TERRITORY_BLOCK_MESSAGES.unknown_edge,
      };
    }
    return { allowed: true, country: null };
  }

  for (const country of countries) {
    const reason = getTerritoryBlockReason(country);
    if (reason) {
      return {
        allowed: false,
        country,
        reason,
        code: 'territory_blocked',
        message: TERRITORY_BLOCK_MESSAGES[reason],
      };
    }
  }

  return { allowed: true, country: countries[0] };
}

export const REGION_POLICY = {
  /** Platform posture for consumer Regions page — not a single-country “home market.” */
  marketPosture: 'Global',
  summary:
    'Mission Winning’s hosted consumer service is a global product with commercial exclusions in Europe (including France), Canada, Ukraine, and Organisation of Islamic Cooperation (OIC) member states. Edge blocking (Cloudflare) plus in-app signup/checkout hard blocks enforce this.',
  excludedLabel:
    'Europe (EEA, UK, Switzerland, France), Canada, Ukraine, and OIC member states (57)',
  supportEmail: 'support@missionwinning.com',
} as const;

/** Count pin — OIC membership is 57. */
export const OIC_MEMBER_COUNT = 57;
