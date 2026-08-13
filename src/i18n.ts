/**
 * i18next bootstrap — minimal EN first paint; full catalogs hydrate async.
 * See: src/i18n/INDEX.md, hydrateResources.ts
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { BOOTSTRAP_EN } from './i18n/bootstrapResources';
import { UI_LANGS, normalizeUiLang } from './i18n/appLangs';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: { ...BOOTSTRAP_EN } },
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    supportedLngs: [...UI_LANGS],
    nonExplicitSupportedLngs: false,
    load: 'currentOnly',
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      lookupQuerystring: 'hl',
      lookupCookie: 'mw_locale',
      caches: ['localStorage'],
      convertDetectedLanguage: (lng: string) => normalizeUiLang(lng),
    },
    ns: ['common'],
    defaultNS: 'common',
    // Show keys via defaultValue in components until hydrate finishes
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;

export { hydrateI18nResources } from './i18n/hydrateResources';
