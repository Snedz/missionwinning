'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { UI_LANGS, UI_LANG_PICKER_LABELS, normalizeUiLang, type UiLang } from '@/i18n/appLangs';
import {
  countryDisplayName,
  servedCountryCodes,
  territoryMessageForCountry,
} from '@/lib/i18n/countries';
import {
  applyDocumentLang,
  detectCountryHint,
  loadLocaleCountryPref,
  persistLocaleCountryPref,
  resolvePersistCountry,
} from '@/lib/i18n/localePreference';
import { isHostedServiceSupportedCountry } from '@/lib/legal/supportedRegions';

type Props = {
  className?: string;
};

export function LocaleCountryControl({ className }: Props) {
  const { t } = useTranslation();
  const served = useMemo(() => servedCountryCodes(), []);
  const saved = loadLocaleCountryPref();
  const [language, setLanguage] = useState<UiLang>(() =>
    normalizeUiLang(saved?.language ?? i18n.language)
  );
  const [country, setCountry] = useState(() => saved?.country ?? detectCountryHint());
  const block = territoryMessageForCountry(country);
  const countryLocked = Boolean(block);

  useEffect(() => {
    const onPref = (ev: Event) => {
      const detail = (ev as CustomEvent<{ language?: string; country?: string }>).detail;
      if (detail?.language) setLanguage(normalizeUiLang(detail.language));
      if (detail?.country) setCountry(detail.country);
    };
    window.addEventListener('mw-locale-pref', onPref);
    return () => window.removeEventListener('mw-locale-pref', onPref);
  }, []);

  const applyLang = (raw: string) => {
    const next = normalizeUiLang(raw);
    setLanguage(next);
    persistLocaleCountryPref({
      language: next,
      country: resolvePersistCountry({ detected: country, picked: country }),
    });
    void i18n.changeLanguage(next);
    applyDocumentLang(next);
  };

  const applyCountry = (raw: string) => {
    if (countryLocked) return;
    if (!isHostedServiceSupportedCountry(raw)) return;
    setCountry(raw);
    persistLocaleCountryPref({ language, country: raw });
  };

  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-2">
        {t('localeControlLabel', { defaultValue: 'Language and country' })}
      </p>
      <label className="sr-only" htmlFor="mw-ctrl-lang">
        {t('localeChooserLanguage', { defaultValue: 'Language' })}
      </label>
      <select
        id="mw-ctrl-lang"
        className="w-full min-h-[44px] border-2 border-border bg-background px-3 py-2 text-sm"
        value={language}
        aria-label={t('changeLanguage', { defaultValue: 'Change language' })}
        onChange={(e) => applyLang(e.target.value)}
      >
        {UI_LANGS.map((code) => (
          <option key={code} value={code}>
            {UI_LANG_PICKER_LABELS[code]}
          </option>
        ))}
      </select>
      {countryLocked ? (
        <p className="mt-2 text-xs text-muted-foreground">{block?.message}</p>
      ) : (
        <>
          <label className="sr-only" htmlFor="mw-ctrl-country">
            {t('localeChooserCountry', { defaultValue: 'Country' })}
          </label>
          <select
            id="mw-ctrl-country"
            className="mt-2 w-full min-h-[44px] border-2 border-border bg-background px-3 py-2 text-sm"
            value={isHostedServiceSupportedCountry(country) ? country : served[0] ?? 'US'}
            aria-label={t('localeChooserCountry', { defaultValue: 'Country' })}
            onChange={(e) => applyCountry(e.target.value)}
          >
            {served.map((code) => (
              <option key={code} value={code}>
                {countryDisplayName(code, language)} ({code})
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
