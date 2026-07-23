'use client';

/**
 * Language switcher for public Beyond the Basics reader — all APP_LANGS.
 */

import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { track } from '@/lib/analytics';
import {
  APP_LANGS,
  APP_LANG_NATIVE_NAMES,
  normalizeAppLang,
  type AppLang,
} from '@/i18n/appLangs';

/** @deprecated Use APP_LANGS — kept for callers expecting GuidebookLocale. */
export const GUIDEBOOK_LOCALES = APP_LANGS;
export type GuidebookLocale = AppLang;

type Props = {
  className?: string;
  /** Compact label above select */
  showLabel?: boolean;
};

export function GuideLocaleSelect({ className, showLabel = true }: Props) {
  const { t } = useTranslation();
  const current = normalizeAppLang(i18n.language);

  const onChange = (lng: string) => {
    try {
      localStorage.setItem('mw_lang_explicit', '1');
    } catch {
      /* private mode */
    }
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
        {APP_LANGS.map((code) => (
          <option key={code} value={code}>
            {APP_LANG_NATIVE_NAMES[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
