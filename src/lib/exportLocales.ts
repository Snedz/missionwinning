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
import { trackStringsFor } from '@/i18n/trackLocales';
import { moveStringsFor } from '@/i18n/moveLocales';
import { mindStringsFor } from '@/i18n/mindLocales';
import { learnStringsFor } from '@/i18n/learnLocales';
import { builderStringsFor } from '@/i18n/builderLocales';
import { benchmarksStringsFor } from '@/i18n/benchmarksLocales';
import { calculatorsStringsFor } from '@/i18n/calculatorsLocales';
import { landingStringsFor } from '@/i18n/landingLocales';

/** Languages with full or partial pillar-specific translations. */
export const EXPORT_LANGS = [
  'en', 'es', 'fr', 'pt', 'de', 'it', 'ko', 'ja', 'ru',
  'zh', 'id', 'th', 'ar',
] as const;
export type ExportLang = (typeof EXPORT_LANGS)[number];

export type LocaleNamespace =
  | 'welcome'
  | 'today'
  | 'fuel'
  | 'nav'
  | 'bundle'
  | 'history'
  | 'activeWorkout'
  | 'track'
  | 'move'
  | 'mind'
  | 'learn'
  | 'builder'
  | 'benchmarks'
  | 'calculators'
  | 'landing';

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
  {
    namespace: 'track',
    filename: 'track.json',
    stringsFor: trackStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'move',
    filename: 'move.json',
    stringsFor: moveStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'mind',
    filename: 'mind.json',
    stringsFor: mindStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'learn',
    filename: 'learn.json',
    stringsFor: learnStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'builder',
    filename: 'builder.json',
    stringsFor: builderStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'benchmarks',
    filename: 'benchmarks.json',
    stringsFor: benchmarksStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'calculators',
    filename: 'calculators.json',
    stringsFor: calculatorsStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'landing',
    filename: 'landing.json',
    stringsFor: landingStringsFor,
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
export function buildMergedCommonStrings(lang: string): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const entry of LOCALE_EXPORTS) {
    Object.assign(merged, entry.stringsFor(lang));
  }
  return merged;
}

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
