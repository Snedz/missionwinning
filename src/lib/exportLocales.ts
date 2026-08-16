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
import { firstStepsStringsFor } from '@/i18n/firstStepsLocales';
import { whatsNewStringsFor } from '@/i18n/whatsNewLocales';
import { zeroStateStringsFor } from '@/i18n/zeroStateLocales';
import { notificationStringsFor } from '@/i18n/notificationLocales';
import { athleteStringsFor } from '@/i18n/athleteLocales';
import { programsStringsFor } from '@/i18n/programsLocales';
import { libraryStringsFor } from '@/i18n/libraryLocales';
import { landingStringsFor } from '@/i18n/landingLocales';
import { growthStringsFor } from '@/i18n/growthLocales';
import { coachStringsFor } from '@/i18n/coachLocales';
import { betaStringsFor } from '@/i18n/betaLocales';
import { gateStringsFor } from '@/i18n/gateLocales';
import { rewardsStringsFor } from '@/i18n/rewardsLocales';
import { placesStringsFor } from '@/i18n/placesLocales';
import { learnContentStringsFor } from '@/i18n/learnContentLocales';
import { serverStringsFor } from '@/i18n/serverLocales';
import { fieldTestStringsFor } from '@/i18n/fieldTestLocales';
import { APP_LANGS, type AppLang } from '@/i18n/appLangs';
import { withLocalePack } from '@/i18n/localePacks';
import type { LocaleNamespace } from '@/i18n/localeExportManifest';

/** @deprecated Prefer APP_LANGS — alias kept for existing imports. */
export const EXPORT_LANGS = APP_LANGS;
export type ExportLang = AppLang;

function packWrap(stringsFor: (lang: string) => Record<string, string>) {
  return (lang: string): Record<string, string> =>
    withLocalePack(stringsFor(lang) as Record<string, string>, lang);
}

/** Apply pack only for keys already present in the base map (overlay namespaces). */
function packWrapIntersect(stringsFor: (lang: string) => Record<string, string>) {
  return (lang: string): Record<string, string> => {
    const base = stringsFor(lang) as Record<string, string>;
    const packed = withLocalePack(base, lang);
    const out: Record<string, string> = { ...base };
    for (const key of Object.keys(base)) {
      if (packed[key] !== undefined) out[key] = packed[key];
    }
    return out;
  };
}

/**
 * `.209` — re-exported from the manifest so the list exists once. Declaring it
 * here as well is how a namespace gets added to one and not the other.
 */
export type { LocaleNamespace };

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
    stringsFor: packWrap(welcomeStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'today',
    filename: 'today.json',
    stringsFor: packWrap(todayStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'fuel',
    filename: 'fuel.json',
    stringsFor: packWrap(fuelStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'nav',
    filename: 'nav.json',
    stringsFor: packWrap(navStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'bundle',
    filename: 'bundle.json',
    stringsFor: packWrap(bundleStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'history',
    filename: 'history.json',
    stringsFor: packWrap(historyStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'activeWorkout',
    filename: 'active-workout.json',
    stringsFor: packWrap(activeWorkoutStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'track',
    filename: 'track.json',
    stringsFor: packWrap(trackStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'move',
    filename: 'move.json',
    stringsFor: packWrap(moveStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'mind',
    filename: 'mind.json',
    stringsFor: packWrap(mindStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'learn',
    filename: 'learn.json',
    stringsFor: packWrap(learnStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'builder',
    filename: 'builder.json',
    stringsFor: packWrap(builderStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'benchmarks',
    filename: 'benchmarks.json',
    stringsFor: packWrap(benchmarksStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'calculators',
    filename: 'calculators.json',
    stringsFor: packWrap(calculatorsStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'info',
    filename: 'info.json',
    stringsFor: packWrap(infoStringsFor as (l: string) => Record<string, string>),
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
    stringsFor: packWrap(leaderboardStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'fitnessTest',
    filename: 'fitness-test.json',
    stringsFor: packWrap((lang) => fitnessTestStringsFor(lang) as Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'assessments',
    filename: 'assessments.json',
    stringsFor: packWrap(assessmentsStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'feedback',
    filename: 'feedback.json',
    stringsFor: packWrap(feedbackStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'firstSteps',
    filename: 'first-steps.json',
    stringsFor: packWrap(firstStepsStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'whatsNew',
    filename: 'whats-new.json',
    stringsFor: packWrap(whatsNewStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'zeroState',
    filename: 'zero-state.json',
    stringsFor: packWrap(zeroStateStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'notification',
    filename: 'notification.json',
    stringsFor: packWrap(notificationStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'athlete',
    filename: 'athlete.json',
    stringsFor: packWrap(athleteStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'programs',
    filename: 'programs.json',
    stringsFor: packWrap(programsStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'library',
    filename: 'library.json',
    stringsFor: packWrap(libraryStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'landing',
    filename: 'landing.json',
    stringsFor: packWrap(landingStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'growth',
    filename: 'growth.json',
    stringsFor: packWrap(growthStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'coach',
    filename: 'coach.json',
    stringsFor: packWrap(coachStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'beta',
    filename: 'beta.json',
    stringsFor: packWrap(betaStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'gate',
    filename: 'gate.json',
    stringsFor: packWrap(gateStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'rewards',
    filename: 'rewards.json',
    stringsFor: packWrap(rewardsStringsFor as (l: string) => Record<string, string>),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'places',
    filename: 'places.json',
    stringsFor: packWrap(placesStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'learnContent',
    filename: 'learn-content.json',
    stringsFor: packWrapIntersect(learnContentStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'server',
    filename: 'server.json',
    stringsFor: packWrap(serverStringsFor),
    langs: EXPORT_LANGS,
  },
  {
    namespace: 'fieldTest',
    filename: 'field-test.json',
    stringsFor: fieldTestStringsFor,
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

/** Count keys whose value still equals EN (untranslated placeholder heuristic). */
export function countLangPlaceholderKeys(
  namespace: LocaleNamespace,
  lang: string
): {
  total: number;
  placeholders: number;
} {
  const entry = LOCALE_EXPORTS.find((e) => e.namespace === namespace);
  if (!entry) return { total: 0, placeholders: 0 };
  const en = entry.stringsFor('en') as Record<string, string>;
  const other = entry.stringsFor(lang) as Record<string, string>;
  const keys = Object.keys(en);
  let placeholders = 0;
  for (const key of keys) {
    if (other[key] === en[key]) placeholders++;
  }
  return { total: keys.length, placeholders };
}

/** Count ES keys whose value still equals EN (untranslated placeholder heuristic). */
export function countEsPlaceholderKeys(namespace: LocaleNamespace): {
  total: number;
  placeholders: number;
} {
  return countLangPlaceholderKeys(namespace, 'es');
}
