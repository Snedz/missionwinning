import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

/**
 * Files still calling localStorage directly. Migrating one to
 * `@/lib/storage/safeStorage` means deleting its line here — never adding one.
 */
const LEGACY_DIRECT_STORAGE = [
  'app/i18n-pwa-provider.tsx',
  'src/components/fitness-test/SchoolClassPanel.tsx',
  'src/components/i18n/RegionDefaultsBoot.tsx',
  'src/components/journey/CommandersIntent.tsx',
  'src/components/layout/AppHeader.tsx',
  'src/components/learn/GuideLocaleSelect.tsx',
  'src/components/profile/ProfileAssessmentCard.tsx',
  'src/components/profile/ProfileLanguageSwitcher.tsx',
  'src/components/profile/ProfileOwnerTools.tsx',
  'src/components/today/TodayProgressSection.tsx',
  'src/components/workout/SessionCheckInSheet.tsx',
  'src/components/workout/WorkoutVictorySheet.tsx',
  'src/hooks/usePremium.ts',
  'src/hooks/useUnits.ts',
  'src/lib/activityLog.ts',
  'src/lib/analyticsOptOut.ts',
  'src/lib/attribution.ts',
  'src/lib/bodyMetrics.ts',
  'src/lib/challenges.ts',
  'src/lib/coach/contextBuilder.ts',
  'src/lib/coach/schedulePrefs.ts',
  'src/lib/coach/storage.ts',
  'src/lib/coachSync.ts',
  'src/lib/fuelCoach/contextBuilder.ts',
  'src/lib/fuelCoach/fuelSync.ts',
  'src/lib/fuelCoach/storage.ts',
  'src/lib/fuelDayAdapt.ts',
  'src/lib/fuelGoalWizard.ts',
  'src/lib/guidebookProgress.ts',
  'src/lib/journeyAnalytics.ts',
  'src/lib/journeySync.ts',
  'src/lib/leaderboard/computeLocalStats.ts',
  'src/lib/learnCourseProgress.ts',
  'src/lib/macroTargets.ts',
  'src/lib/mindCheckIns.ts',
  'src/lib/missionJourney.ts',
  'src/lib/nutritionHighProteinDays.ts',
  'src/lib/payments.ts',
  'src/lib/pillarLog.ts',
  'src/lib/pillarScoreInputs.ts',
  'src/lib/presidentialFitnessStorage.ts',
  'src/lib/privacyConsent.ts',
  'src/lib/referral.ts',
  'src/lib/savedMeals.ts',
  'src/lib/schoolClass.ts',
  'src/lib/streaks.ts',
  'src/lib/supabase.ts',
  'src/lib/todayDashboardPrefs.ts',
  'src/lib/todayTrends.ts',
  'src/lib/workout/activeWorkoutPulse.ts',
  'src/lib/workout/restTimer.ts',
  'src/lib/workout/workoutPersistLite.ts',
  'src/lib/youthConsent.ts',
  'src/page-components/BenchmarksPage.tsx',
  'src/page-components/HomePage.tsx',
  'src/page-components/HomeTodayDashboard.tsx',
  'src/page-components/HomeTodayLean.tsx',
  'src/page-components/LearnPage.tsx',
  'src/page-components/ProfilePage.tsx',
  'src/page-components/WelcomePage.tsx',
];

export default tseslint.config(
  { ignores: ['dist', '.next', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-empty': 'warn',
      // Decorative icons paired with visible text — avoid noisy alt-text warnings.
      'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
    },
  },
  {
    // A bare localStorage call throws in Safari private mode and when the disk is
    // full, which can blank a page — on a product whose promise is offline-first
    // logging. `src/lib/storage/safeStorage.ts` is the only module allowed to
    // touch it directly (plus backup.ts, which must enumerate raw keys).
    //
    // This is a ratchet: an error everywhere except the files below, which are a
    // shrinking migration backlog. Only ever delete entries from that list.
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    ignores: [
      'src/lib/storage/**',
      'src/lib/backup.ts',
      '**/*.test.ts',
      ...LEGACY_DIRECT_STORAGE,
    ],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message:
            'Use @/lib/storage/safeStorage — a bare localStorage call can throw and blank the page.',
        },
      ],
    },
  }
);
