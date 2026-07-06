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
import { infoStringsFor } from '@/i18n/infoLocales';
import { guidebookStringsFor } from '@/i18n/guidebookLocales';
import { leaderboardStringsFor } from '@/i18n/leaderboardLocales';
import { fitnessTestStringsFor } from '@/i18n/fitnessTestLocales';
import { assessmentsStringsFor } from '@/i18n/assessmentsLocales';
import { feedbackStringsFor } from '@/i18n/feedbackLocales';
import { programsStringsFor } from '@/i18n/programsLocales';
import { libraryStringsFor } from '@/i18n/libraryLocales';

/** Languages with full or partial pillar-specific translations. */
export const EXPORT_LANGS = [
  'en',
  'es',
  'zh',
  'id',
  'th',
  'ar',
  'fr',
  'pt',
  'de',
  'it',
  'ko',
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
  | 'info'
  | 'guidebook'
  | 'leaderboard'
  | 'fitnessTest'
  | 'assessments'
  | 'feedback'
  | 'programs'
  | 'library';

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
    namespace: 'info',
    filename: 'info.json',
    stringsFor: infoStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'guidebook',
    filename: 'guidebook.json',
    stringsFor: guidebookStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'leaderboard',
    filename: 'leaderboard.json',
    stringsFor: leaderboardStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'fitnessTest',
    filename: 'fitness-test.json',
    stringsFor: (lang) => fitnessTestStringsFor(lang) as Record<string, string>,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'assessments',
    filename: 'assessments.json',
    stringsFor: assessmentsStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'feedback',
    filename: 'feedback.json',
    stringsFor: feedbackStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'programs',
    filename: 'programs.json',
    stringsFor: programsStringsFor,
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'library',
    filename: 'library.json',
    stringsFor: libraryStringsFor,
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

/** Count ES keys whose value still equals EN (untranslated placeholder heuristic). */
export function countEsPlaceholderKeys(namespace: LocaleNamespace): {
  total: number;
  placeholders: number;
} {
  const entry = LOCALE_EXPORTS.find((e) => e.namespace === namespace);
  if (!entry) return { total: 0, placeholders: 0 };
  const en = entry.stringsFor('en') as Record<string, string>;
  const es = entry.stringsFor('es') as Record<string, string>;
  const keys = Object.keys(en);
  let placeholders = 0;
  for (const key of keys) {
    if (es[key] === en[key]) placeholders++;
  }
  return { total: keys.length, placeholders };
}
