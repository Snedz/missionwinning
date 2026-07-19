'use client';

/**
 * Language switcher for public Beyond the Basics reader.
 * Locales that ship guidebook.json under public/locales/.
 */

import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { track } from '@/lib/analytics';

/** Locales with guidebook.json present (Batch C/D + en). */
export const GUIDEBOOK_LOCALES = [
  'en',
  'es',
  'fr',
  'pt',
  'de',
  'it',
  'ko',
  'th',
  'zh',
  'id',
  'ar',
] as const;

export type GuidebookLocale = (typeof GUIDEBOOK_LOCALES)[number];

const NATIVE_NAMES: Record<GuidebookLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
  it: 'Italiano',
  ko: '한국어',
  th: 'ไทย',
  zh: '中文',
  id: 'Bahasa Indonesia',
  ar: 'العربية',
};

type Props = {
  className?: string;
  /** Compact label above select */
  showLabel?: boolean;
};

export function GuideLocaleSelect({ className, showLabel = true }: Props) {
  const { t } = useTranslation();
  const raw = (i18n.language || 'en').split('-')[0];
  const current = (GUIDEBOOK_LOCALES as readonly string[]).includes(raw)
    ? (raw as GuidebookLocale)
    : 'en';

  const onChange = (lng: string) => {
    void i18n.changeLanguage(lng);
    track('guide_locale_changed', { locale: lng });
  };

  return (
    <div className={className}>
      {showLabel && (
        <label htmlFor="guide-locale" className="eyebrow mb-2 block">
          {t('guideLanguage', { defaultValue: 'Language' })}
        </label>
      )}
      <select
        id="guide-locale"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground"
        aria-label={t('guideLanguage', { defaultValue: 'Language' })}
      >
        {GUIDEBOOK_LOCALES.map((code) => (
          <option key={code} value={code}>
            {NATIVE_NAMES[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
