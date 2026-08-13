/**
 * Country picker for first-visit chooser.
 *
 * Policy is NOT invented here. Hosted-service territory is
 * {@link isHostedServiceSupportedCountry} in
 * `src/lib/legal/supportedRegions.ts` (and `/regions`).
 *
 * This file only holds an ISO 3166-1 display universe (UN members + common
 * territories) and filters it through that function. IL stays. FR/DE/GB/CA/ID/
 * SA/TR/UA and the rest of Europe/OIC are excluded because the existing
 * geo-block says so — not because a second list was written.
 */

import { normalizeCountryCode } from '@/lib/regionDefaults';
import {
  getTerritoryBlockReason,
  isHostedServiceSupportedCountry,
  TERRITORY_BLOCK_MESSAGES,
  type TerritoryBlockReason,
} from '@/lib/legal/supportedRegions';

/**
 * ISO 3166-1 alpha-2 display universe. Not a payment or block list.
 * Includes IL, HK, TW, and other common territories. XX/T1 are not countries.
 */
export const ISO_3166_DISPLAY_UNIVERSE = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU',
  'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL',
  'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC',
  'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV',
  'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG',
  'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD',
  'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT',
  'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM',
  'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH',
  'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK',
  'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH',
  'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW',
  'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR',
  'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR',
  'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC',
  'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL',
  'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY',
  'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA',
  'ZM', 'ZW',
] as const;

/** Served hosted-service countries only. Derived — do not hand-edit this list. */
export function servedCountryCodes(): string[] {
  return ISO_3166_DISPLAY_UNIVERSE.filter((code) => isHostedServiceSupportedCountry(code));
}

export function isServedPickerCountry(code: string | null | undefined): boolean {
  return isHostedServiceSupportedCountry(code);
}

export function isIsoCountry(code: string): boolean {
  const iso = normalizeCountryCode(code);
  return iso != null && (ISO_3166_DISPLAY_UNIVERSE as readonly string[]).includes(iso);
}

export function countryDisplayName(code: string, locale = 'en'): string {
  const iso = normalizeCountryCode(code);
  if (!iso) return code;
  try {
    const names = new Intl.DisplayNames([locale, 'en'], { type: 'region' });
    const label = names.of(iso);
    if (label) return label;
  } catch {
    /* Intl missing */
  }
  return iso;
}

export function territoryMessageForCountry(
  code: string | null | undefined
): { reason: TerritoryBlockReason; message: string } | null {
  const reason = getTerritoryBlockReason(code);
  if (!reason) return null;
  return { reason, message: TERRITORY_BLOCK_MESSAGES[reason] };
}

/** IANA timezone → ISO country. Hint only. Ambiguous zones omitted. */
const TZ_COUNTRY: Record<string, string> = {
  'Asia/Seoul': 'KR',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Chongqing': 'CN',
  'Asia/Taipei': 'TW',
  'Asia/Hong_Kong': 'HK',
  'Asia/Macau': 'MO',
  'Asia/Singapore': 'SG',
  'Asia/Jerusalem': 'IL',
  'Asia/Tel_Aviv': 'IL',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Sao_Paulo': 'BR',
  'America/Mexico_City': 'MX',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Santiago': 'CL',
  'America/Bogota': 'CO',
  'America/Lima': 'PE',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Bangkok': 'TH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Manila': 'PH',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Pacific/Auckland': 'NZ',
  'Europe/Moscow': 'RU',
  'Europe/Minsk': 'BY',
  'Africa/Johannesburg': 'ZA',
  'Africa/Nairobi': 'KE',
  'Africa/Addis_Ababa': 'ET',
  'America/Toronto': 'CA',
  'Europe/London': 'GB',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Lisbon': 'PT',
  'Europe/Kyiv': 'UA',
  'Europe/Kiev': 'UA',
  'Asia/Jakarta': 'ID',
  'Asia/Kuala_Lumpur': 'MY',
  'Europe/Istanbul': 'TR',
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
};

export function countryFromTimeZone(timeZone?: string | null): string | null {
  let tz = timeZone;
  if (!tz) {
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return null;
    }
  }
  if (!tz) return null;
  return TZ_COUNTRY[tz] ?? null;
}

/** Region subtag from a BCP 47 tag (en-US → US). Hint only. */
export function countryFromLocaleTag(tag: string | null | undefined): string | null {
  if (!tag) return null;
  const parts = tag.trim().replace(/_/g, '-').split('-');
  for (const part of parts) {
    if (/^[A-Za-z]{2}$/.test(part) && part === part.toUpperCase()) {
      return normalizeCountryCode(part);
    }
    if (/^[A-Za-z]{2}$/.test(part)) {
      const upper = part.toUpperCase();
      if ((ISO_3166_DISPLAY_UNIVERSE as readonly string[]).includes(upper)) {
        return normalizeCountryCode(upper);
      }
    }
  }
  return null;
}

export { isHostedServiceSupportedCountry, TERRITORY_BLOCK_MESSAGES };
