import { TIER1_LANGS } from '@/i18n/coreLocales';
import { TIER2_LANGS } from '@/i18n/tier2Locales';
import { MEA_LANGS } from '@/i18n/meaLocales';
import type { Metadata } from 'next';

/** BCP-47 tags for hreflang / OpenGraph alternateLocale. */
export const MARKETING_HREFLANG_TAGS: Record<string, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  pt: 'pt-BR',
  de: 'de',
  it: 'it',
  ko: 'ko',
  ja: 'ja',
  ru: 'ru',
  zh: 'zh',
  id: 'id',
  th: 'th',
  ar: 'ar',
};

export const MARKETING_OG_ALTERNATE_LOCALES = [
  'es_ES',
  'fr_FR',
  'de_DE',
  'pt_BR',
  'it_IT',
  'ja_JP',
  'ko_KR',
  'ru_RU',
] as const;

const ALL_MARKETING_LANGS = [...TIER1_LANGS, ...TIER2_LANGS, ...MEA_LANGS];

/** Same-URL hreflang map — language is switched client-side via i18n. */
export function marketingLanguageAlternates(path: string): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = { 'x-default': path };
  for (const code of ALL_MARKETING_LANGS) {
    const tag = MARKETING_HREFLANG_TAGS[code] ?? code;
    languages[tag] = path;
  }
  return { canonical: path, languages };
}
