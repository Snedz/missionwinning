'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { scheduleJourneyPush } from '@/lib/journeySync';
import { UI_LANGS, UI_LANG_PICKER_LABELS, normalizeUiLang } from '@/i18n/appLangs';
import {
  applyDocumentLang,
  detectCountryHint,
  loadLocaleCountryPref,
  persistLocaleCountryPref,
} from '@/lib/i18n/localePreference';

export function ProfileLanguageSwitcher() {
  const { t } = useTranslation();
  const currentLang = normalizeUiLang(i18n.language);
  const changeLanguage = (lng: string) => {
    const language = normalizeUiLang(lng);
    const country = loadLocaleCountryPref()?.country ?? detectCountryHint();
    persistLocaleCountryPref({ language, country });
    void i18n.changeLanguage(language);
    applyDocumentLang(language);
    scheduleJourneyPush();
  };
  return (
    <div className="space-y-1">
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="w-full min-h-[44px] text-sm bg-background border-2 border-border px-3 py-2"
        aria-label={t('changeLanguage', { defaultValue: 'Change language' })}
      >
        {UI_LANGS.map((l) => (
          <option key={l} value={l}>
            {UI_LANG_PICKER_LABELS[l]}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        {t('languageNotAvailability', {
          defaultValue:
            'Choosing a language does not change where the hosted service is offered.',
        })}{' '}
        <Link href="/regions" className="underline underline-offset-2">
          {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
        </Link>
      </p>
    </div>
  );
}
