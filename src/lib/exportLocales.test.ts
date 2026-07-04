import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPORT_LANGS,
  LOCALE_EXPORTS,
  buildLocaleExportPlan,
  localeExportSummary,
} from '@/lib/exportLocales';

const PARITY_NAMESPACES = ['today', 'welcome', 'feedback'] as const;
/** Langs whose namespace objects inherit full key set from `en` via spread. */
const PARITY_LANGS = ['en', 'es', 'fr', 'pt', 'de', 'it', 'ko'] as const;

describe('exportLocales', () => {
  it('defines twenty-two namespaces for export', () => {
    assert.equal(LOCALE_EXPORTS.length, 22);
    const names = LOCALE_EXPORTS.map((e) => e.namespace);
    assert.ok(names.includes('bundle'));
    assert.ok(names.includes('today'));
    assert.ok(names.includes('history'));
    assert.ok(names.includes('activeWorkout'));
    assert.ok(names.includes('benchmarks'));
    assert.ok(names.includes('calculators'));
  });

  it('builds plan for all langs × namespaces', () => {
    const plan = buildLocaleExportPlan();
    assert.equal(plan.length, LOCALE_EXPORTS.length * EXPORT_LANGS.length);
    const enWelcome = plan.find((p) => p.lang === 'en' && p.namespace === 'welcome');
    assert.ok(enWelcome && enWelcome.keyCount > 20);
    const enToday = plan.find((p) => p.lang === 'en' && p.namespace === 'today');
    assert.ok(enToday && enToday.keyCount > 100);
  });

  it('summary counts match plan', () => {
    const plan = buildLocaleExportPlan();
    const summary = localeExportSummary();
    assert.equal(summary.files, plan.length);
    assert.equal(summary.namespaces, LOCALE_EXPORTS.length);
    assert.equal(summary.langs, EXPORT_LANGS.length);
  });

  it('critical namespaces have key parity across EXPORT_LANGS', () => {
    for (const namespace of PARITY_NAMESPACES) {
      const entry = LOCALE_EXPORTS.find((e) => e.namespace === namespace);
      assert.ok(entry, `missing namespace ${namespace}`);
      const enKeys = Object.keys(entry!.stringsFor('en')).sort();
      for (const lang of PARITY_LANGS) {
        const langKeys = Object.keys(entry!.stringsFor(lang)).sort();
        assert.deepEqual(
          langKeys,
          enKeys,
          `${namespace}/${lang} key mismatch vs en (${langKeys.length} vs ${enKeys.length})`
        );
      }
    }
  });
});
