import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_LANGS,
  SERVED_MARKET_LANGS,
  UI_LANGS,
  UI_LANG_PICKER_LABELS,
  htmlLangTag,
  isRtlLang,
  normalizeAppLang,
  normalizeUiLang,
  packLangForUi,
  resourceLang,
} from '@/i18n/appLangs';

describe('appLangs UI picker', () => {
  it('keeps 14 pack langs, no French, and maps pt-BR to pt', () => {
    assert.equal(APP_LANGS.length, 14);
    assert.ok(!(APP_LANGS as readonly string[]).includes('fr'));
    assert.equal(normalizeAppLang('pt-BR'), 'pt');
    assert.equal(packLangForUi('pt-BR'), 'pt');
    assert.equal(packLangForUi('zh-Hans'), 'zh');
    assert.equal(packLangForUi('zh-Hant'), 'en');
    assert.equal(packLangForUi('yue'), 'en');
  });

  it('lists 39 picker rows and never merges siblings', () => {
    assert.equal(UI_LANGS.length, 39);
    assert.equal(new Set(UI_LANGS).size, 39);
    assert.ok(!(UI_LANGS as readonly string[]).includes('fr'));
    assert.equal(normalizeUiLang('zh-HK'), 'yue');
    assert.equal(normalizeUiLang('yue'), 'yue');
    assert.equal(normalizeUiLang('zh-TW'), 'zh-Hant');
    assert.equal(normalizeUiLang('zh-CN'), 'zh-Hans');
    assert.equal(normalizeUiLang('zh'), 'zh-Hans');
    assert.notEqual(normalizeUiLang('yue'), normalizeUiLang('zh-TW'));
    assert.equal(normalizeUiLang('pt'), 'pt-BR');
    assert.equal(normalizeUiLang('pt-PT'), 'pt-PT');
    assert.notEqual(normalizeUiLang('pt-BR'), normalizeUiLang('pt-PT'));
    assert.equal(normalizeUiLang('fr'), 'en');
    assert.equal(normalizeUiLang('fr-FR'), 'en');
    assert.equal(normalizeUiLang('tl'), 'fil');
    assert.equal(normalizeUiLang('iw'), 'he');
    assert.equal(normalizeUiLang('nb'), 'nb');
    assert.equal(resourceLang('zh-Hans'), 'zh');
    assert.equal(resourceLang('zh-Hant'), 'zh-Hant');
    assert.equal(resourceLang('yue'), 'yue');
  });

  it('labels every picker row with an endonym and keeps three Chinese rows', () => {
    for (const lang of UI_LANGS) {
      assert.ok(UI_LANG_PICKER_LABELS[lang].length > 0, lang);
    }
    assert.match(UI_LANG_PICKER_LABELS['zh-Hans'], /简体|Simplified/);
    assert.match(UI_LANG_PICKER_LABELS['zh-Hant'], /繁體|Traditional/);
    assert.match(UI_LANG_PICKER_LABELS.yue, /廣東|Cantonese/);
    assert.notEqual(UI_LANG_PICKER_LABELS['zh-Hans'], UI_LANG_PICKER_LABELS['zh-Hant']);
    assert.notEqual(UI_LANG_PICKER_LABELS.yue, UI_LANG_PICKER_LABELS['zh-Hant']);
  });

  it('marks ar he fa ur as RTL and sets html lang to the UI tag', () => {
    for (const lang of ['ar', 'he', 'fa', 'ur'] as const) {
      assert.equal(isRtlLang(lang), true, lang);
    }
    assert.equal(isRtlLang('en'), false);
    assert.equal(htmlLangTag('zh-Hant'), 'zh-Hant');
    assert.equal(htmlLangTag('he'), 'he');
  });

  it('names served-market langs without treating diaspora prefs as markets', () => {
    for (const lang of ['en', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'yue', 'he', 'ru'] as const) {
      assert.ok((SERVED_MARKET_LANGS as readonly string[]).includes(lang), lang);
    }
    assert.ok(!(SERVED_MARKET_LANGS as readonly string[]).includes('ar'));
    assert.ok(!(SERVED_MARKET_LANGS as readonly string[]).includes('fr'));
    assert.ok(!(SERVED_MARKET_LANGS as readonly string[]).includes('id'));
  });
});
