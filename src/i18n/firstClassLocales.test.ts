import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FIRST_CLASS_KEYS,
  firstClassOverlayFor,
} from '@/i18n/firstClassLocales';
import { SERVED_MARKET_LANGS, UI_LANGS, UI_LANG_PICKER_LABELS } from '@/i18n/appLangs';

const BRAND_OK = /Mission Coach|Mission Winning/;

describe('first-class overlays', () => {
  it('covers every picker row', () => {
    assert.equal(UI_LANGS.length, 39);
    for (const lang of UI_LANGS) {
      const row = firstClassOverlayFor(lang);
      assert.ok(row.localeChooserTitle, lang);
      assert.ok(UI_LANG_PICKER_LABELS[lang]);
    }
  });

  it('gives served-market langs every wedge key, not English-fallback', () => {
    const en = firstClassOverlayFor('en');
    for (const lang of SERVED_MARKET_LANGS) {
      const row = firstClassOverlayFor(lang);
      for (const key of FIRST_CLASS_KEYS) {
        assert.equal(typeof row[key], 'string', `${lang}.${key}`);
        assert.ok(row[key].length > 0, `${lang}.${key}`);
        if (lang === 'en') continue;
        if (BRAND_OK.test(row[key]) && row[key] === en[key]) continue;
        assert.notEqual(row[key], en[key], `${lang}.${key} must not be English fallback`);
      }
    }
  });

  it('keeps Hebrew and Cantonese distinct from siblings', () => {
    const he = firstClassOverlayFor('he');
    const yue = firstClassOverlayFor('yue');
    const hant = firstClassOverlayFor('zh-Hant');
    const hans = firstClassOverlayFor('zh-Hans');
    assert.notEqual(he.localeChooserTitle, firstClassOverlayFor('en').localeChooserTitle);
    assert.notEqual(yue.localeChooserTitle, hant.localeChooserTitle);
    assert.notEqual(hant.localeChooserTitle, hans.localeChooserTitle);
    assert.match(he.localeChooserTitle, /שפה/);
    assert.match(yue.localeChooserBody, /普通話|廣東|語言/);
  });

  it('does not market a blocked country as a launch market', () => {
    const blob = UI_LANGS.map((l) => JSON.stringify(firstClassOverlayFor(l))).join('\n');
    assert.doesNotMatch(blob, /Available in Saudi Arabia/i);
    assert.doesNotMatch(blob, /Launching in France/i);
    assert.doesNotMatch(blob, /available everywhere/i);
  });
});
