/** Map locale / browser hints → region + country for leaderboard scopes. */

export type MacroRegion = 'Americas' | 'Europe' | 'Asia-Pacific' | 'Middle East & Africa';

const LOCALE_COUNTRY: Record<string, { code: string; name: string; region: MacroRegion }> = {
  en: { code: 'US', name: 'United States', region: 'Americas' },
  es: { code: 'ES', name: 'Spain', region: 'Europe' },
  fr: { code: 'FR', name: 'France', region: 'Europe' },
  pt: { code: 'BR', name: 'Brazil', region: 'Americas' },
  ru: { code: 'RU', name: 'Russia', region: 'Europe' },
  de: { code: 'DE', name: 'Germany', region: 'Europe' },
  it: { code: 'IT', name: 'Italy', region: 'Europe' },
  ko: { code: 'KR', name: 'South Korea', region: 'Asia-Pacific' },
  ja: { code: 'JP', name: 'Japan', region: 'Asia-Pacific' },
  th: { code: 'TH', name: 'Thailand', region: 'Asia-Pacific' },
  vi: { code: 'VN', name: 'Vietnam', region: 'Asia-Pacific' },
  hi: { code: 'IN', name: 'India', region: 'Asia-Pacific' },
  zh: { code: 'CN', name: 'China', region: 'Asia-Pacific' },
  id: { code: 'ID', name: 'Indonesia', region: 'Asia-Pacific' },
};

export function resolveGeoFromLocale(locale?: string | null): {
  locale: string;
  countryCode: string;
  countryName: string;
  region: MacroRegion;
} {
  const code = (locale || 'en').split('-')[0].toLowerCase();
  const mapped = LOCALE_COUNTRY[code] ?? LOCALE_COUNTRY.en;
  return {
    locale: code,
    countryCode: mapped.code,
    countryName: mapped.name,
    region: mapped.region,
  };
}

export function scopeLabel(
  scope: import('./types').LeaderboardScope,
  geo: ReturnType<typeof resolveGeoFromLocale>,
  classCode?: string
): string {
  switch (scope) {
    case 'global':
      return 'Worldwide';
    case 'regional':
      return geo.region;
    case 'national':
      return geo.countryName;
    case 'local':
      return `${geo.countryName} · Local`;
    case 'friends':
      return geo.countryName + ' · Squad';
    case 'class':
      return classCode ? `Class ${classCode}` : 'PE Class';
  }
}
