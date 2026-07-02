import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TIER1_LANGS } from '@/i18n/coreLocales';
import { todayStringsFor } from '@/i18n/todayLocales';
import { welcomeStringsFor } from '@/i18n/welcomeLocales';
import { fuelStringsFor } from '@/i18n/fuelLocales';
import { activeWorkoutStringsFor } from '@/i18n/activeWorkoutLocales';

function translatedRatio(lang: string, stringsFor: (l: string) => Record<string, string>): number {
  const en = stringsFor('en');
  const localized = stringsFor(lang);
  const keys = Object.keys(en);
  let diff = 0;
  for (const k of keys) {
    if (localized[k] !== en[k]) diff++;
  }
  return diff / keys.length;
}

describe('i18n Tier 1 body coverage (Phase I4)', () => {
  const enToday = todayStringsFor('en');

  it('en today has coach premium upsell key', () => {
    assert.ok(enToday.coachPremiumUpsell);
  });

  for (const lang of ['fr', 'de', 'pt', 'it', 'ja', 'ko', 'ru'] as const) {
    it(`${lang} today body ≥75% translated vs en`, () => {
      const ratio = translatedRatio(lang, todayStringsFor);
      assert.ok(ratio >= 0.75, `${lang} today ratio ${(ratio * 100).toFixed(1)}%`);
    });
  }

  const germanMarkers = ['Schritt', 'Fortschritt', 'Einheiten', 'Gesundheitswerte', 'Rangliste'];
  for (const lang of ['it', 'ja', 'ko', 'ru'] as const) {
    it(`${lang} today body has no German string leakage`, () => {
      const localized = todayStringsFor(lang);
      const de = todayStringsFor('de');
      const hits = Object.keys(localized).filter(
        (k) => localized[k] === de[k] && germanMarkers.some((m) => de[k]?.includes(m)),
      );
      assert.equal(hits.length, 0, `${lang} inherits DE for: ${hits.slice(0, 5).join(', ')}`);
    });
  }

  for (const lang of ['it', 'ja', 'ko', 'ru'] as const) {
    it(`${lang} welcome body ≥75% translated vs en`, () => {
      const ratio = translatedRatio(lang, welcomeStringsFor);
      assert.ok(ratio >= 0.75, `${lang} welcome ratio ${(ratio * 100).toFixed(1)}%`);
    });
  }

  const frenchMarkers = ['Connexion', 'parcours', 'Entraîne', 'Retour'];
  const germanWelcomeMarkers = ['Anmelden', 'Reise', 'Zurück', 'Schritt'];
  for (const lang of ['it', 'ko', 'ru'] as const) {
    it(`${lang} welcome has no FR/DE string leakage`, () => {
      const localized = welcomeStringsFor(lang);
      const de = welcomeStringsFor('de');
      const fr = welcomeStringsFor('fr');
      const deHits = Object.keys(localized).filter(
        (k) => localized[k] === de[k] && germanWelcomeMarkers.some((m) => de[k]?.includes(m)),
      );
      const frHits = Object.keys(localized).filter(
        (k) => localized[k] === fr[k] && frenchMarkers.some((m) => fr[k]?.includes(m)),
      );
      assert.equal(deHits.length, 0, `${lang} inherits DE welcome: ${deHits.slice(0, 3).join(', ')}`);
      assert.equal(frHits.length, 0, `${lang} inherits FR welcome: ${frHits.slice(0, 3).join(', ')}`);
    });
  }

  for (const lang of ['fr', 'de', 'pt', 'it', 'ja', 'ko', 'ru'] as const) {
    it(`${lang} fuel body ≥75% translated vs en`, () => {
      const ratio = translatedRatio(lang, fuelStringsFor);
      assert.ok(ratio >= 0.75, `${lang} fuel ratio ${(ratio * 100).toFixed(1)}%`);
    });
  }

  for (const lang of ['fr', 'de', 'pt', 'it', 'ja', 'ko', 'ru'] as const) {
    it(`${lang} active workout ≥75% translated vs en`, () => {
      const ratio = translatedRatio(lang, activeWorkoutStringsFor);
      assert.ok(ratio >= 0.75, `${lang} active ratio ${(ratio * 100).toFixed(1)}%`);
    });
  }
});
