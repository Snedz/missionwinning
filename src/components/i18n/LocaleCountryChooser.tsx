'use client';

/**
 * Language + country chooser — **opened on request, never on arrival**.
 *
 * Language is a preference. Country list is served ISOs only
 * (`isHostedServiceSupportedCountry`). A detected blocked territory shows
 * TERRITORY_BLOCK_MESSAGES and cannot continue into hosted signup.
 *
 * `.770` — this used to open itself on every first visit, on every route,
 * mounted from `app/i18n-pwa-provider.tsx`. Measured on a production build with
 * the gate up: a full-screen overlay at `z-[70]` with a `bg-foreground/50` scrim
 * owned the first paint of www, and `elementsFromPoint` on the poster's "Log a
 * set" button returned the sheet — the primary CTA was **not clickable at all**
 * on a 390×844 phone. Shard 1 (US/LatAm, ops #16) named a gate before any value
 * as its biggest theme and shard 4 named the onboarding wall; this was both,
 * ahead of the free logger.
 *
 * It was also a confirmation dialog for a decision already made. The effect
 * below applies the browser's language immediately, so by the time the sheet
 * appeared the page had already switched; "Continue" only *persisted* the guess,
 * and dismissing the scrim persisted the same values. There was no branch in
 * which the visitor's answer changed anything.
 *
 * So the guess is now persisted silently and the sheet opens only when someone
 * asks for it — {@link LOCALE_CHOOSER_OPEN_EVENT}, wired from the gate poster
 * and available anywhere. Discoverability went up rather than down: the gate had
 * no language control of its own, so this overlay was the only way to reach 40
 * languages from www, and dismissing it was the only way to reach the product.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { UI_LANGS, UI_LANG_PICKER_LABELS, normalizeUiLang, type UiLang } from '@/i18n/appLangs';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { Button } from '@/components/ui/button';
import { LOCALE_CHOOSER_OPEN_EVENT } from '@/lib/i18n/localeChooserEvent';
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
  loadLocaleCountryPref,
  persistLocaleCountryPref,
  resolvePersistCountry,
} from '@/lib/i18n/localePreference';
import { isHostedServiceSupportedCountry } from '@/lib/legal/supportedRegions';

type GeoHint = {
  country?: string | null;
  blocked?: boolean;
  blockMessage?: string | null;
};

export function LocaleCountryChooser() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<UiLang>('en');
  const [pickedCountry, setPickedCountry] = useState('US');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  const served = useMemo(() => servedCountryCodes(), []);

  /** Someone asked for the sheet — the only way it opens. */
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(LOCALE_CHOOSER_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(LOCALE_CHOOSER_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    const hl =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('hl')
        : null;
    const confirmed = hasConfirmedLocaleChoice();
    const saved = loadLocaleCountryPref();
    const lang = confirmed
      ? normalizeUiLang(saved?.language ?? i18n.language)
      : detectLanguageHint({ queryHl: hl });
    setLanguage(lang);
    if (!confirmed) {
      void i18n.changeLanguage(lang);
      applyDocumentLang(lang);
    }

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
      const picked = isHostedServiceSupportedCountry(detected)
        ? detected
        : served.includes('US')
          ? 'US'
          : served[0] ?? 'US';
      setPickedCountry(picked);

      /*
       * Write the guess rather than posing it as a question. These are the exact
       * values the old "Continue" button wrote, so nothing about the resulting
       * preference changed — only the wall in front of it. Without this the
       * detected language would re-apply on every load and never be recorded,
       * and `hasConfirmedLocaleChoice()` would stay false forever.
       */
      if (!confirmed) {
        persistLocaleCountryPref({
          language: lang,
          country: resolvePersistCountry({ detected, picked }),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [served]);

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
