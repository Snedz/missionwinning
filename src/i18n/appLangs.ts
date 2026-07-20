/**
 * Canonical app languages — single source of truth for Profile, export, /guide, and CI.
 * Order matches Profile language switcher.
 */

export const APP_LANGS = [
  'en',
  'es',
  'fr',
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

export const APP_LANG_NATIVE_NAMES: Record<AppLang, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ru: 'Русский',
  de: 'Deutsch',
  it: 'Italiano',
  ko: '한국어',
  ja: '日本語',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  hi: 'हिन्दी',
  zh: '中文',
  id: 'Bahasa Indonesia',
  ar: 'العربية',
};

/** Languages that use right-to-left layout. */
export const RTL_LANGS = new Set<string>(['ar']);

export function isAppLang(code: string): code is AppLang {
  return (APP_LANGS as readonly string[]).includes(code);
}

export function normalizeAppLang(code: string | undefined | null): AppLang {
  const base = (code || 'en').split('-')[0]?.toLowerCase() ?? 'en';
  return isAppLang(base) ? base : 'en';
}

export function isRtlLang(code: string): boolean {
  return RTL_LANGS.has(normalizeAppLang(code));
}
