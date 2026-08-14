'use client';

/**
 * First-visit language + country chooser.
 * Language is a preference. Country list is served ISOs only
 * (`isHostedServiceSupportedCountry`). Detected blocked territory shows
 * TERRITORY_BLOCK_MESSAGES and cannot continue into hosted signup.
 */

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { UI_LANGS, UI_LANG_PICKER_LABELS, normalizeUiLang, type UiLang } from '@/i18n/appLangs';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { Button } from '@/components/ui/button';
import {
  countryDisplayName,
  servedCountryCodes,
  territoryMessageForCountry,
} from '@/lib/i18n/countries';
import {
  applyDocumentLang,
  detectCountryHint,
  detectLanguageHint,
  hasConfirmedLocaleChoice,
  isFirstSetLocaleChooserPath,
  persistLocaleCountryPref,
  resolvePersistCountry,
  shouldAutoOpenLocaleChooser,
} from '@/lib/i18n/localePreference';
import { isHostedServiceSupportedCountry } from '@/lib/legal/supportedRegions';

type GeoHint = {
  country?: string | null;
  blocked?: boolean;
  blockMessage?: string | null;
};

export function LocaleCountryChooser() {
  const { t } = useTranslation();
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<UiLang>('en');
  const [pickedCountry, setPickedCountry] = useState('US');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  const served = useMemo(() => servedCountryCodes(), []);

  useEffect(() => {
    if (isFirstSetLocaleChooserPath(pathname)) setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (hasConfirmedLocaleChoice()) return;
    const hl =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('hl')
        : null;
    const lang = detectLanguageHint({ queryHl: hl });
    setLanguage(lang);
    void i18n.changeLanguage(lang);
    applyDocumentLang(lang);

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
      const message = geo?.blockMessage ?? territory?.message ?? null;
      setBlockMessage(message);
      if (isHostedServiceSupportedCountry(detected)) {
        setPickedCountry(detected);
      } else if (served.includes('US')) {
        setPickedCountry('US');
      } else {
        setPickedCountry(served[0] ?? 'US');
      }
      // F-017 — do not cover I-Day Continue / first-set Start with this sheet.
      // Live path: the geo fetch can resolve after I-Day navigates to /active.
      const here =
        typeof window !== 'undefined' ? window.location.pathname : pathname;
      if (shouldAutoOpenLocaleChooser(here)) setOpen(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [served, pathname]);

  const confirm = (nextLang: UiLang, nextPicked: string) => {
    const country = resolvePersistCountry({
      detected: detectedCountry,
      picked: nextPicked,
    });
    persistLocaleCountryPref({ language: nextLang, country });
    void i18n.changeLanguage(nextLang);
    applyDocumentLang(nextLang);
    setOpen(false);
  };

  const onLanguageChange = (raw: string) => {
    const next = normalizeUiLang(raw);
    setLanguage(next);
    void i18n.changeLanguage(next);
    applyDocumentLang(next);
  };

  const blocked = Boolean(blockMessage);

  return (
    <AdaptiveOverlay
      open={open}
      onClose={() => confirm(language, pickedCountry)}
      size="sm"
      eyebrow={t('localeChooserEyebrow', { defaultValue: 'First visit' })}
      title={t('localeChooserTitle', { defaultValue: 'Language and country' })}
      footer={
        <Button
          type="button"
          className="w-full min-h-[44px]"
          onClick={() => confirm(language, pickedCountry)}
        >
          {t('localeChooserContinue', { defaultValue: 'Continue' })}
        </Button>
      }
    >
      <p className="text-sm text-muted-foreground">
        {t('localeChooserBody', {
          defaultValue:
            'We guessed from your browser. Change either — language and country are independent.',
        })}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {t('localeChooserLanguageNote', {
          defaultValue:
            'Language is a preference. It does not change which countries we serve.',
        })}
      </p>

      <label className="mt-4 block text-sm font-medium" htmlFor="mw-locale-lang">
        {t('localeChooserLanguage', { defaultValue: 'Language' })}
      </label>
      <select
        id="mw-locale-lang"
        className="mt-1 w-full min-h-[44px] border-2 border-border bg-background px-3 py-2 text-sm"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
      >
        {UI_LANGS.map((code) => (
          <option key={code} value={code}>
            {UI_LANG_PICKER_LABELS[code]}
          </option>
        ))}
      </select>

      {blocked ? (
        <div className="mt-4 border-2 border-border bg-muted/40 p-3 text-sm">
          <p className="text-foreground">{blockMessage}</p>
          <p className="mt-2 text-muted-foreground">
            {t('localeChooserLoggerStillWorks', {
              defaultValue:
                'The free logger still works. Hosted signup and checkout are not available.',
            })}
          </p>
        </div>
      ) : (
        <>
          <label className="mt-4 block text-sm font-medium" htmlFor="mw-locale-country">
            {t('localeChooserCountry', { defaultValue: 'Country' })}
          </label>
          <select
            id="mw-locale-country"
            className="mt-1 w-full min-h-[44px] border-2 border-border bg-background px-3 py-2 text-sm"
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

      <p className="mt-3 text-xs text-muted-foreground">
        {t('localeChooserHint', {
          defaultValue: 'You can change this later in Profile or the footer.',
        })}
      </p>
    </AdaptiveOverlay>
  );
}
