import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { landingStringsFor, landingKeyCount } from '@/i18n/landingLocales';

function translatedRatio(lang: string): number {
  const en = landingStringsFor('en');
  const localized = landingStringsFor(lang);
  const keys = Object.keys(en);
  let diff = 0;
  for (const k of keys) {
    if (localized[k] !== en[k]) diff++;
  }
  return diff / keys.length;
}

describe('landingLocales (Phase M2)', () => {
  it('EN has 140+ marketing keys', () => {
    assert.ok(landingKeyCount() >= 140);
    const en = landingStringsFor('en');
    assert.ok(en.landingHeroHeadline.length > 0);
    assert.ok(en.landingMockupToday.length > 0);
    assert.ok(en.landingSkipToContent.length > 0);
  });

  for (const lang of ['it', 'ja', 'ko', 'ru', 'fr', 'de', 'pt', 'es'] as const) {
    it(`${lang} landing ≥75% translated vs en`, () => {
      const ratio = translatedRatio(lang);
      assert.ok(ratio >= 0.75, `${lang} landing ratio ${(ratio * 100).toFixed(1)}%`);
    });
  }

  it('KO fuel pillar has no 프리mium typo', () => {
    const ko = landingStringsFor('ko');
    assert.doesNotMatch(ko.landingPillar_fuel_desc ?? '', /프리mium/);
    assert.match(ko.landingPillar_fuel_desc ?? '', /프리미엄/);
  });

  for (const lang of ['it', 'ja', 'ko', 'ru'] as const) {
    it(`${lang} screenshot section translated vs en`, () => {
      const en = landingStringsFor('en');
      const loc = landingStringsFor(lang);
      assert.notEqual(loc.landingScreensTitle, en.landingScreensTitle);
      assert.notEqual(loc.landingScreenTodayDesc, en.landingScreenTodayDesc);
      assert.notEqual(loc.landingNavScreens, en.landingNavScreens);
    });
  }
});
