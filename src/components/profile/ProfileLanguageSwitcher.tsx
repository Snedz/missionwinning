'use client';

import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { scheduleJourneyPush } from '@/lib/journeySync';
import { APP_LANGS, APP_LANG_NATIVE_NAMES, normalizeAppLang } from '@/i18n/appLangs';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { writeRaw } from '@/lib/storage/safeStorage';

export function ProfileLanguageSwitcher() {
  const { t } = useTranslation();
  const currentLang = normalizeAppLang(i18n.language);
  const changeLanguage = (lng: string) => {
    // Explicit choice blocks RegionDefaultsBoot from overriding it on the next visit.
    writeRaw(STORAGE_KEYS.langExplicit, '1');
    i18n.changeLanguage(lng);
    scheduleJourneyPush();
  };
  return (
    <div className="space-y-1">
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="w-full text-sm bg-background border-2 border-border rounded px-3 py-2"
        aria-label={t('changeLanguage', { defaultValue: 'Change language' })}
      >
        {APP_LANGS.map((l) => (
          <option key={l} value={l}>
            {APP_LANG_NATIVE_NAMES[l]}
          </option>
        ))}
      </select>
    </div>
  );
}
