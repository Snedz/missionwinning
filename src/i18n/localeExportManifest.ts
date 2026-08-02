/**
 * Which locale files exist, and nothing else.
 *
 * `.209` — this module exists because of a **306 KB** measurement.
 *
 * `localeHttpLoader.ts` needed exactly two facts per namespace — its name and
 * its filename — and got them by importing `LOCALE_EXPORTS` from
 * `@/lib/exportLocales`. That module imports 28 `*Locales.ts` files **and**
 * `@/i18n/localePacks`, which imports 14 `packs/*.json` totalling 1.1 MB on
 * disk. And `localeHttpLoader` is reached from the root layout:
 *
 *     app/layout.tsx → I18nPwaProvider → LocaleHttpSync → localeHttpLoader
 *                    → exportLocales → localePacks → 14 × packs/*.json
 *
 * Every link static. The measured result was a single
 * `chunks/7660-…js` at **1,053,845 B raw / 313,839 B gzipped**, loaded as a
 * plain `<script async>` on `/`, `/log` and `/active` alike — **44 % of the
 * initial JS on the logger.** An English user in Nairobi on 3G downloaded Thai,
 * Vietnamese and Hindi before first paint.
 *
 * That silently defeated the design `i18n/hydrateResources.ts` documents in its
 * own header ("dynamic imports keep ~8k LOC of `*Locales.ts` out of first
 * paint") and `src/i18n.ts`'s "minimal EN first paint". Both were true of the
 * source and false of the build.
 *
 * So the metadata lives here, with **zero imports**, and both `exportLocales`
 * and `localeHttpLoader` read it. `LocaleNamespace` is derived from the array
 * rather than declared beside it, so the two can never disagree — and a type
 * import is erased at compile time, which is what keeps this module's
 * consumers free of the graph.
 */

export type LocaleExportFile = {
  namespace: string;
  filename: string;
};

export const LOCALE_FILES = [
  { namespace: 'welcome', filename: 'welcome.json' },
  { namespace: 'today', filename: 'today.json' },
  { namespace: 'fuel', filename: 'fuel.json' },
  { namespace: 'nav', filename: 'nav.json' },
  { namespace: 'bundle', filename: 'bundle.json' },
  { namespace: 'history', filename: 'history.json' },
  { namespace: 'activeWorkout', filename: 'active-workout.json' },
  { namespace: 'track', filename: 'track.json' },
  { namespace: 'move', filename: 'move.json' },
  { namespace: 'mind', filename: 'mind.json' },
  { namespace: 'learn', filename: 'learn.json' },
  { namespace: 'builder', filename: 'builder.json' },
  { namespace: 'benchmarks', filename: 'benchmarks.json' },
  { namespace: 'calculators', filename: 'calculators.json' },
  { namespace: 'info', filename: 'info.json' },
  { namespace: 'guidebook', filename: 'guidebook.json' },
  { namespace: 'leaderboard', filename: 'leaderboard.json' },
  { namespace: 'fitnessTest', filename: 'fitness-test.json' },
  { namespace: 'assessments', filename: 'assessments.json' },
  { namespace: 'feedback', filename: 'feedback.json' },
  { namespace: 'firstSteps', filename: 'first-steps.json' },
  { namespace: 'zeroState', filename: 'zero-state.json' },
  { namespace: 'programs', filename: 'programs.json' },
  { namespace: 'library', filename: 'library.json' },
  { namespace: 'landing', filename: 'landing.json' },
  { namespace: 'growth', filename: 'growth.json' },
  { namespace: 'coach', filename: 'coach.json' },
  { namespace: 'beta', filename: 'beta.json' },
  { namespace: 'gate', filename: 'gate.json' },
  { namespace: 'learnContent', filename: 'learn-content.json' },
] as const;

export type LocaleNamespace = (typeof LOCALE_FILES)[number]['namespace'];
