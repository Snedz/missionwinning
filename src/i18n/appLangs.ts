/**
 * Canonical pack languages + first-class UI locales (BCP 47).
 *
 * APP_LANGS — 14 pack / i18n:parity / guidebook keys. Do not invent a second
 * pack list. UI_LANGS — language picker + <html lang>. Country policy is
 * NOT here — import isHostedServiceSupportedCountry from supportedRegions.ts.
 * French is not a pack or picker language — France is founder-excluded.
 *
 * Never split('-')[0] for zh-Hant / pt-PT / zh-Hans — that silently merges siblings.
 */

export const APP_LANGS = [
  'en',
  'es',
  'pt',
  'ru',
  'de',
  'it',
  'ko',
  'ja',
  'th',
  'vi',
  'hi',
  'zh',
  'id',
  'ar',
] as const;

export type AppLang = (typeof APP_LANGS)[number];

/**
 * Language picker + html lang. 39 BCP 47 rows. Siblings never merge.
 * zh-Hans / pt-BR are picker tags; packs stay zh / pt.
 */
export const UI_LANGS = [
  'en',
  'ko',
  'ja',
  'zh-Hans',
  'zh-Hant',
  'yue',
  'th',
  'vi',
  'id',
  'ms',
  'fil',
  'hi',
  'bn',
  'ta',
  'te',
  'ur',
  'ar',
  'he',
  'fa',
  'tr',
  'es',
  'pt-BR',
  'pt-PT',
  'de',
  'it',
  'nl',
  'pl',
  'uk',
  'ru',
  'cs',
  'ro',
  'el',
  'sv',
  'da',
  'nb',
  'fi',
  'hu',
  'sw',
  'am',
] as const;

export type UiLang = (typeof UI_LANGS)[number];

/**
 * Languages of served markets (country still independent).
 * KE/ET are served so sw/am belong here. Diaspora prefs are the rest of UI_LANGS.
 */
export const SERVED_MARKET_LANGS = [
  'en',
  'ja',
  'ko',
  'zh-Hans',
  'zh-Hant',
  'yue',
  'he',
  'es',
  'pt-BR',
  'hi',
  'bn',
  'ta',
  'te',
  'th',
  'vi',
  'fil',
  'ru',
  'sw',
  'am',
] as const;

export type ServedMarketLang = (typeof SERVED_MARKET_LANGS)[number];

/** Native endonym + English name. Never one “Chinese” row. */
export const UI_LANG_PICKER_LABELS: Record<UiLang, string> = {
  en: 'English',
  ko: '한국어 · Korean',
  ja: '日本語 · Japanese',
  'zh-Hans': '简体中文 · Mandarin (Simplified)',
  'zh-Hant': '繁體中文 · Mandarin (Traditional)',
  yue: '廣東話 · Cantonese',
  th: 'ไทย · Thai',
  vi: 'Tiếng Việt · Vietnamese',
  id: 'Bahasa Indonesia · Indonesian',
  ms: 'Bahasa Melayu · Malay',
  fil: 'Filipino · Filipino',
  hi: 'हिन्दी · Hindi',
  bn: 'বাংলা · Bengali',
  ta: 'தமிழ் · Tamil',
  te: 'తెలుగు · Telugu',
  ur: 'اردو · Urdu',
  ar: 'العربية · Arabic',
  he: 'עברית · Hebrew',
  fa: 'فارسی · Persian',
  tr: 'Türkçe · Turkish',
  es: 'Español · Spanish',
  'pt-BR': 'Português (Brasil) · Portuguese (Brazil)',
  'pt-PT': 'Português (Portugal) · Portuguese (Portugal)',
  de: 'Deutsch · German',
  it: 'Italiano · Italian',
  nl: 'Nederlands · Dutch',
  pl: 'Polski · Polish',
  uk: 'Українська · Ukrainian',
  ru: 'Русский · Russian',
  cs: 'Čeština · Czech',
  ro: 'Română · Romanian',
  el: 'Ελληνικά · Greek',
  sv: 'Svenska · Swedish',
  da: 'Dansk · Danish',
  nb: 'Norsk bokmål · Norwegian',
  fi: 'Suomi · Finnish',
  hu: 'Magyar · Hungarian',
  sw: 'Kiswahili · Swahili',
  am: 'አማርኛ · Amharic',
};

/** @deprecated Profile used this; prefer UI_LANG_PICKER_LABELS. */
export const APP_LANG_NATIVE_NAMES: Record<AppLang, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  de: 'Deutsch',
  it: 'Italiano',
  ko: '한국어',
  ja: '日本語',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  hi: 'हिन्दी',
  zh: '简体中文',
  id: 'Bahasa Indonesia',
  ar: 'العربية',
};

export const RTL_LANGS = new Set<string>(['ar', 'he', 'fa', 'ur']);

export function isAppLang(code: string): code is AppLang {
  return (APP_LANGS as readonly string[]).includes(code);
}

export function isUiLang(code: string): code is UiLang {
  return (UI_LANGS as readonly string[]).includes(code);
}

export function isServedMarketLang(code: string): boolean {
  return (SERVED_MARKET_LANGS as readonly string[]).includes(code);
}

/**
 * Map Accept-Language / BCP 47 → UI locale.
 * zh-HK and yue → Cantonese. zh-TW → Traditional Mandarin. Never yue→zh-Hant.
 * Bare `pt` → pt-BR (served). `pt-PT` stays European Portuguese (language pref).
 */
export function normalizeUiLang(code: string | undefined | null): UiLang {
  if (!code) return 'en';
  const raw = code.trim().replace(/_/g, '-');
  const lower = raw.toLowerCase();

  if (lower === 'zh-hant' || lower === 'zh-tw' || lower === 'zh-mo') return 'zh-Hant';
  if (lower === 'yue' || lower === 'yue-hant' || lower === 'zh-hk' || lower === 'zh-yue') {
    return 'yue';
  }
  if (lower === 'zh-hans' || lower === 'zh-cn' || lower === 'zh-sg' || lower === 'zh') {
    return 'zh-Hans';
  }
  if (lower === 'pt-pt') return 'pt-PT';
  if (lower === 'pt-br' || lower === 'pt') return 'pt-BR';
  if (lower === 'fr' || lower.startsWith('fr-')) return 'en';
  if (lower === 'tl' || lower === 'fil') return 'fil';
  if (lower === 'nb' || lower === 'no' || lower.startsWith('nb-') || lower.startsWith('no-')) {
    return 'nb';
  }
  if (lower === 'iw' || lower.startsWith('he')) return 'he';
  if (lower.startsWith('ar')) return 'ar';
  if (lower.startsWith('fa')) return 'fa';
  if (lower.startsWith('ur')) return 'ur';

  if (isUiLang(raw)) return raw;
  const titled = raw
    .split('-')
    .map((p, i) => (i === 0 ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()))
    .join('-');
  if (isUiLang(titled)) return titled;

  const base = lower.split('-')[0] ?? 'en';
  if (base === 'zh' || base === 'pt') {
    return base === 'zh' ? 'zh-Hans' : 'pt-BR';
  }
  if (isUiLang(base)) return base;
  return 'en';
}

/** Pack key for *Locales.ts / packs / guidebook. Extras start from English. */
export function packLangForUi(code: string | undefined | null): AppLang {
  const ui = normalizeUiLang(code);
  if (ui === 'zh-Hans') return 'zh';
  if (ui === 'pt-BR') return 'pt';
  if (isAppLang(ui)) return ui;
  return 'en';
}

/**
 * Overlay / resource-bundle lookup key.
 * zh-Hans → zh (pack). pt-BR → pt (pack). zh-Hant / yue / he stay themselves.
 */
export function resourceLang(code: string | undefined | null): string {
  const ui = normalizeUiLang(code);
  if (ui === 'zh-Hans') return 'zh';
  if (ui === 'pt-BR') return 'pt';
  return ui;
}

/** Pack-only normalize (parity / export). pt-BR → pt. zh-Hant does not become zh. */
export function normalizeAppLang(code: string | undefined | null): AppLang {
  return packLangForUi(code);
}

export function htmlLangTag(code: string | undefined | null): string {
  return normalizeUiLang(code);
}

export function isRtlLang(code: string): boolean {
  return RTL_LANGS.has(normalizeUiLang(code));
}

export function uiLangCount(): number {
  return UI_LANGS.length;
}
