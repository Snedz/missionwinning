/**
 * Full locale hydration — dynamic imports keep ~8k LOC of *Locales.ts out of first paint.
 */
import type i18n from 'i18next';

let hydratePromise: Promise<void> | null = null;

export function hydrateI18nResources(instance: typeof i18n): Promise<void> {
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    const [
      { CORE_LOCALES, TIER1_LANGS },
      { TIER2_LANGS, TIER2_LOCALES },
      { MEA_LANGS, MEA_LOCALES },
      { leaderboardStringsFor },
      { mergeWelcomeStrings },
      { mergeTodayStrings },
      { mergeFuelStrings },
      { mergeNavStrings },
      { mergeBundleStrings },
      { mergeActiveWorkoutStrings },
      { mergeHistoryStrings },
      { mergeTrackStrings },
      { mergeMoveStrings },
      { mergeMindStrings },
      { mergeLearnStrings },
      { mergeBuilderStrings },
      { mergeBenchmarksStrings },
      { mergeCalculatorsStrings },
      { mergeInfoStrings },
      { mergeFitnessTestStrings },
      { mergeGuidebookStrings },
      { mergeAssessmentsStrings },
      { mergeFeedbackStrings },
      { mergeFirstStepsStrings },
      { mergeWhatsNewStrings },
      { mergeZeroStateStrings },
      { mergeNotificationStrings },
      { mergeProgramsStrings },
      { mergeCoachStrings },
      { mergeLibraryStrings },
      { mergeLandingStrings },
      { mergeGateStrings },
      { mergeBetaStrings },
      { mergeGrowthStrings },
      { mergeRewardsStrings },
    ] = await Promise.all([
      import('@/i18n/coreLocales'),
      import('@/i18n/tier2Locales'),
      import('@/i18n/meaLocales'),
      import('@/i18n/leaderboardLocales'),
      import('@/i18n/welcomeLocales'),
      import('@/i18n/todayLocales'),
      import('@/i18n/fuelLocales'),
      import('@/i18n/navLocales'),
      import('@/i18n/bundleLocales'),
      import('@/i18n/activeWorkoutLocales'),
      import('@/i18n/historyLocales'),
      import('@/i18n/trackLocales'),
      import('@/i18n/moveLocales'),
      import('@/i18n/mindLocales'),
      import('@/i18n/learnLocales'),
      import('@/i18n/builderLocales'),
      import('@/i18n/benchmarksLocales'),
      import('@/i18n/calculatorsLocales'),
      import('@/i18n/infoLocales'),
      import('@/i18n/fitnessTestLocales'),
      import('@/i18n/guidebookLocales'),
      import('@/i18n/assessmentsLocales'),
      import('@/i18n/feedbackLocales'),
      import('@/i18n/firstStepsLocales'),
      import('@/i18n/whatsNewLocales'),
      import('@/i18n/zeroStateLocales'),
      import('@/i18n/notificationLocales'),
      import('@/i18n/programsLocales'),
      import('@/i18n/coachLocales'),
      import('@/i18n/libraryLocales'),
      import('@/i18n/landingLocales'),
      import('@/i18n/gateLocales'),
      import('@/i18n/betaLocales'),
      import('@/i18n/growthLocales'),
      import('@/i18n/rewardsLocales'),
    ]);

    // Seed EN base from existing bundle so we don't wipe bootstrap keys
    const enBase = {
      ...(instance.getResourceBundle('en', 'common') as Record<string, string> | undefined),
    };

    const resources: Record<string, Record<string, string>> = {
      en: { ...enBase },
    };

    for (const lang of TIER1_LANGS) {
      if (!resources[lang]) resources[lang] = { ...resources.en };
      Object.assign(resources[lang], CORE_LOCALES[lang]);
    }
    for (const lang of TIER2_LANGS) {
      if (!resources[lang]) resources[lang] = { ...resources.en };
      Object.assign(resources[lang], TIER2_LOCALES[lang]);
    }
    for (const lang of MEA_LANGS) {
      if (!resources[lang]) resources[lang] = { ...resources.en };
      Object.assign(resources[lang], MEA_LOCALES[lang]);
    }

    for (const lang of [...TIER1_LANGS, ...TIER2_LANGS, ...MEA_LANGS]) {
      Object.assign(resources[lang], leaderboardStringsFor(lang));
      mergeWelcomeStrings(resources[lang], lang);
      mergeTodayStrings(resources[lang], lang);
      mergeFuelStrings(resources[lang], lang);
      mergeNavStrings(resources[lang], lang);
      mergeBundleStrings(resources[lang], lang);
      mergeActiveWorkoutStrings(resources[lang], lang);
      mergeHistoryStrings(resources[lang], lang);
      mergeTrackStrings(resources[lang], lang);
      mergeMoveStrings(resources[lang], lang);
      mergeMindStrings(resources[lang], lang);
      mergeLearnStrings(resources[lang], lang);
      mergeGuidebookStrings(resources[lang], lang);
      mergeBuilderStrings(resources[lang], lang);
      mergeBenchmarksStrings(resources[lang], lang);
      mergeCalculatorsStrings(resources[lang], lang);
      mergeInfoStrings(resources[lang], lang);
      mergeAssessmentsStrings(resources[lang], lang);
      mergeFeedbackStrings(resources[lang], lang);
      mergeFirstStepsStrings(resources[lang], lang);
      mergeWhatsNewStrings(resources[lang], lang);
      mergeZeroStateStrings(resources[lang], lang);
      mergeNotificationStrings(resources[lang], lang);
      mergeProgramsStrings(resources[lang], lang);
      mergeCoachStrings(resources[lang], lang);
      mergeLibraryStrings(resources[lang], lang);
      mergeFitnessTestStrings(resources[lang], lang);
      mergeLandingStrings(resources[lang], lang);
      mergeGateStrings(resources[lang], lang);
      mergeBetaStrings(resources[lang], lang);
      mergeGrowthStrings(resources[lang], lang);
      mergeRewardsStrings(resources[lang], lang);
    }

    const { applyLocalePack } = await import('@/i18n/localePacks');
    for (const [lang, common] of Object.entries(resources)) {
      applyLocalePack(common, lang);
      instance.addResourceBundle(lang, 'common', common, true, true);
    }

    // addResourceBundle emits `added`, not `loaded` — force a refresh so
    // screens that rendered bootstrap-only keys pick up full catalogs.
    void instance.changeLanguage(instance.language);
  })();

  return hydratePromise;
}
