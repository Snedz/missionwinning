'use client';

/**
 * Language and country on the I-Day profile step.
 * The first-visit sheet stays closed; Continue persists the choice.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { UI_LANGS, UI_LANG_PICKER_LABELS, normalizeUiLang, type UiLang } from '@/i18n/appLangs';
import {
  countryDisplayName,
  servedCountryCodes,
  territoryMessageForCountry,
} from '@/lib/i18n/countries';
import {
  applyDocumentLang,
  detectCountryHint,
  detectLanguageHint,
  persistLocaleCountryPref,
  resolvePersistCountry,
} from '@/lib/i18n/localePreference';
import { isHostedServiceSupportedCountry } from '@/lib/legal/supportedRegions';

type GeoHint = {
  country?: string | null;
  blockMessage?: string | null;
};

export function OnboardingLocaleFields({ onCommit }: { onCommit: (commit: () => void) => void }) {
  const { t } = useTranslation();
  const served = useMemo(() => servedCountryCodes(), []);
  const [language, setLanguage] = useState<UiLang>('en');
  const [pickedCountry, setPickedCountry] = useState('US');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  const languageRef = useRef(language);
  const pickedRef = useRef(pickedCountry);
  const detectedRef = useRef(detectedCountry);
  languageRef.current = language;
  pickedRef.current = pickedCountry;
  detectedRef.current = detectedCountry;

  useEffect(() => {
    onCommit(() => {
      const country = resolvePersistCountry({
        detected: detectedRef.current,
        picked: pickedRef.current,
      });
      persistLocaleCountryPref({ language: languageRef.current, country });
      void i18n.changeLanguage(languageRef.current);
      applyDocumentLang(languageRef.current);
    });
  }, [onCommit]);

  useEffect(() => {
    const hl =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('hl')
        : null;
    const lang = detectLanguageHint({ queryHl: hl });
    setLanguage(lang);

    let cancelled = false;
    void (async () => {
      let geo: GeoHint | null = null;
      try {
        const res = await fetch('/api/geo', { credentials: 'same-origin' });
        if (res.ok) geo = (await res.json()) as GeoHint;
      } catch {
        /* offline */
      }
      if (cancelled) return;
      const detected = detectCountryHint({ geoCountry: geo?.country ?? null });
      setDetectedCountry(detected);
      const territory = territoryMessageForCountry(detected);
      setBlockMessage(geo?.blockMessage ?? territory?.message ?? null);
      if (isHostedServiceSupportedCountry(detected)) {
        setPickedCountry(detected);
      } else if (served.includes('US')) {
        setPickedCountry('US');
      } else {
        setPickedCountry(served[0] ?? 'US');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [served]);

  const onLanguageChange = (raw: string) => {
    const next = normalizeUiLang(raw);
    setLanguage(next);
    void i18n.changeLanguage(next);
    applyDocumentLang(next);
  };

  return (
    <fieldset className="space-y-2 text-sm">
      <legend className="text-muted-foreground">
        {t('localeChooserTitle', { defaultValue: 'Language and country' })}
      </legend>
      <p className="text-xs text-muted-foreground">
        {t('localeChooserLanguageNote', {
          defaultValue: 'Language is a preference. It does not change which countries we serve.',
        })}
      </p>
      <label className="block font-medium" htmlFor="mw-onboarding-lang">
        {t('localeChooserLanguage', { defaultValue: 'Language' })}
      </label>
      <select
        id="mw-onboarding-lang"
        className="w-full min-h-[44px] border-2 border-border bg-background px-3 py-2 text-sm"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
      >
        {UI_LANGS.map((code) => (
          <option key={code} value={code}>
            {UI_LANG_PICKER_LABELS[code]}
          </option>
        ))}
      </select>
      {blockMessage ? (
        <div className="border-2 border-border bg-muted/40 p-3 text-sm">
          <p className="text-foreground">{blockMessage}</p>
          <p className="mt-2 text-muted-foreground">
            {t('localeChooserLoggerStillWorks', {
              defaultValue: 'The free logger still works. Hosted signup and checkout are not available.',
            })}
          </p>
        </div>
      ) : (
        <>
          <label className="block font-medium" htmlFor="mw-onboarding-country">
            {t('localeChooserCountry', { defaultValue: 'Country' })}
          </label>
          <select
            id="mw-onboarding-country"
            className="w-full min-h-[44px] border-2 border-border bg-background px-3 py-2 text-sm"
            value={pickedCountry}
            onChange={(e) => setPickedCountry(e.target.value)}
          >
            {served.map((code) => (
              <option key={code} value={code}>
                {countryDisplayName(code, language)} ({code})
              </option>
            ))}
          </select>
        </>
      )}
    </fieldset>
  );
}
