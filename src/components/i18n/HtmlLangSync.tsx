'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { htmlLangTag, isRtlLang, normalizeUiLang } from '@/i18n/appLangs';

/** @deprecated Use isRtlLang from appLangs */
export const RTL_LANGS = new Set(['ar', 'he', 'fa', 'ur']);

/** Syncs document lang and text direction with active i18n language. */
export function HtmlLangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = normalizeUiLang(i18n.language);
    document.documentElement.lang = htmlLangTag(lang);
    document.documentElement.dir = isRtlLang(lang) || RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return null;
}
