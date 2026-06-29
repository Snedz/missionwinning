'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Languages that use right-to-left layout. */
export const RTL_LANGS = new Set(['ar', 'he', 'fa', 'ur']);

/** Syncs document lang and text direction with active i18n language. */
export function HtmlLangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language?.split('-')[0] || 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return null;
}
