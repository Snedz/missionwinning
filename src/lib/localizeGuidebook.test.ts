import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { APP_LANGS, isAppLang, normalizeAppLang, isRtlLang } from '@/i18n/appLangs';
import { localizeGuidebookChapters, localizeMagazineMeta } from '@/lib/localizeGuidebook';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { buildGuidebookContentLocaleKeys } from '@/lib/guidebook/buildGuidebookLocaleKeys';

describe('appLangs', () => {
  it('has 14 canonical languages including Profile set', () => {
    assert.equal(APP_LANGS.length, 14);
    assert.ok(isAppLang('es'));
    assert.ok(isAppLang('hi'));
    assert.equal(normalizeAppLang('pt-BR'), 'pt');
    assert.equal(normalizeAppLang('xx'), 'en');
    assert.ok(isRtlLang('ar'));
    assert.ok(!isRtlLang('es'));
  });
});

describe('localizeGuidebook', () => {
  it('translates section body, callout, table, checklist via t()', () => {
    const t = (key: string, opts?: { defaultValue?: string }) => {
      if (key === 'guideSection_ch1-s1_body') return 'CUERPO';
      if (key === 'guideSection_ch1-s1_callout_title') return 'AVISO';
      if (key.startsWith('guideSection_ch1-s2_table_h')) return `H${key.slice(-1)}`;
      if (key === 'guideSection_ch2-s1_checklist_title') return 'LISTA';
      return opts?.defaultValue ?? key;
    };
    const localized = localizeGuidebookChapters(BEYOND_THE_BASICS_CHAPTERS, t);
    const s1 = localized[0].sections[0];
    assert.equal(s1.body, 'CUERPO');
    assert.equal(s1.callout?.title, 'AVISO');
    const s2 = localized[0].sections[1];
    assert.ok(s2.table);
    assert.equal(s2.table!.headers[0], 'H0');
    const check = localized[1].sections[0].checklist;
    assert.equal(check?.title, 'LISTA');
  });

  it('localizeMagazineMeta maps preface keys', () => {
    const t = (key: string, opts?: { defaultValue?: string }) =>
      key === 'magazinePreface_0' ? 'PREFACIO' : (opts?.defaultValue ?? key);
    const meta = localizeMagazineMeta(t);
    assert.equal(meta.preface[0], 'PREFACIO');
  });

  it('builds EN content keys for free chapters + magazine', () => {
    const keys = buildGuidebookContentLocaleKeys();
    assert.ok(keys['guideSection_ch1-s1_body']);
    assert.ok(keys.magazineTitle);
    assert.ok(Object.keys(keys).length > 50);
  });
});
