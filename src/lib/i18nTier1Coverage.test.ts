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

  for (const lang of ['fr', 'de', 'pt'] as const) {
    it(`${lang} today body ≥75% translated vs en`, () => {
      const ratio = translatedRatio(lang, todayStringsFor);
      assert.ok(ratio >= 0.75, `${lang} today ratio ${(ratio * 100).toFixed(1)}%`);
    });
  }

  for (const lang of TIER1_LANGS) {
    if (lang === 'en' || lang === 'es') continue;
    it(`${lang} welcome body mostly translated`, () => {
      const ratio = translatedRatio(lang, welcomeStringsFor);
      assert.ok(ratio >= 0.5, `${lang} welcome ratio ${(ratio * 100).toFixed(1)}%`);
    });
  }

  for (const lang of ['fr', 'de', 'ja'] as const) {
    it(`${lang} fuel + active partial translated`, () => {
      assert.ok(translatedRatio(lang, fuelStringsFor) >= 0.15);
      assert.ok(translatedRatio(lang, activeWorkoutStringsFor) >= 0.10);
    });
  }
});
