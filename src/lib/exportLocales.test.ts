import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPORT_LANGS,
  LOCALE_EXPORTS,
  buildLocaleExportPlan,
  localeExportSummary,
} from '@/lib/exportLocales';

describe('exportLocales', () => {
  it('defines twelve namespaces for export', () => {
    assert.equal(LOCALE_EXPORTS.length, 12);
    const names = LOCALE_EXPORTS.map((e) => e.namespace);
    assert.ok(names.includes('bundle'));
    assert.ok(names.includes('today'));
    assert.ok(names.includes('history'));
    assert.ok(names.includes('activeWorkout'));
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
  });
});
