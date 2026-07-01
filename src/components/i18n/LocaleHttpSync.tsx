'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchLocaleHttpOverrides, shouldLoadLocaleHttp } from '@/lib/localeHttpLoader';

/** Merges /public/locales JSON overrides into i18n (translator hotfix path). */
export function LocaleHttpSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!shouldLoadLocaleHttp()) return;

    let cancelled = false;
    const code = i18n.language?.split('-')[0] || 'en';

    fetchLocaleHttpOverrides(code).then((overrides) => {
      if (cancelled || !overrides || Object.keys(overrides).length === 0) return;
      i18n.addResourceBundle(code, 'common', overrides, true, true);
    });

    return () => {
      cancelled = true;
    };
  }, [i18n, i18n.language]);

  return null;
}
