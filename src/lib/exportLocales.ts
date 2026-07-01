/**
 * Locale JSON export manifest — used by scripts/export-locale-json.ts and tests.
 */

import { welcomeStringsFor } from '@/i18n/welcomeLocales';
import { todayStringsFor } from '@/i18n/todayLocales';
import { fuelStringsFor } from '@/i18n/fuelLocales';
import { navStringsFor } from '@/i18n/navLocales';
import { bundleStringsFor } from '@/i18n/bundleLocales';
import { historyStringsFor } from '@/i18n/historyLocales';
import { activeWorkoutStringsFor } from '@/i18n/activeWorkoutLocales';

/** Languages with full or partial pillar-specific translations. */
export const EXPORT_LANGS = ['en', 'es', 'zh', 'id', 'th', 'ar'] as const;
export type ExportLang = (typeof EXPORT_LANGS)[number];

export type LocaleNamespace =
  | 'welcome'
  | 'today'
  | 'fuel'
  | 'nav'
  | 'bundle'
  | 'history'
  | 'activeWorkout';

export type LocaleExportEntry = {
  namespace: LocaleNamespace;
  filename: string;
  stringsFor: (lang: string) => Record<string, string>;
  langs: readonly ExportLang[];
};

export const LOCALE_EXPORTS: LocaleExportEntry[] = [
  {
    namespace: 'welcome',
    filename: 'welcome.json',
    stringsFor: welcomeStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'today',
    filename: 'today.json',
    stringsFor: todayStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'fuel',
    filename: 'fuel.json',
    stringsFor: fuelStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'nav',
    filename: 'nav.json',
    stringsFor: navStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'bundle',
    filename: 'bundle.json',
    stringsFor: bundleStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'history',
    filename: 'history.json',
    stringsFor: historyStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'activeWorkout',
    filename: 'active-workout.json',
    stringsFor: activeWorkoutStringsFor,
    langs: EXPORT_LANGS,
  },
];

export type LocaleExportPlan = {
  lang: ExportLang;
  namespace: LocaleNamespace;
  filename: string;
  relativePath: string;
  keyCount: number;
};

/** Build export plan with key counts (no filesystem writes). */
export function buildLocaleExportPlan(): LocaleExportPlan[] {
  const plan: LocaleExportPlan[] = [];
  for (const entry of LOCALE_EXPORTS) {
    for (const lang of entry.langs) {
      const strings = entry.stringsFor(lang);
      plan.push({
        lang,
        namespace: entry.namespace,
        filename: entry.filename,
        relativePath: `public/locales/${lang}/${entry.filename}`,
        keyCount: Object.keys(strings).length,
      });
    }
  }
  return plan;
}

export function localeExportSummary(): {
  namespaces: number;
  files: number;
  langs: number;
  totalKeys: number;
} {
  const plan = buildLocaleExportPlan();
  return {
    namespaces: LOCALE_EXPORTS.length,
    files: plan.length,
    langs: EXPORT_LANGS.length,
    totalKeys: plan.reduce((s, p) => s + p.keyCount, 0),
  };
}
