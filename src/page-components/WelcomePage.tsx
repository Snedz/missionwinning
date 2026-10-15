'use client';
/**
 * Page: /welcome — I-Day onboarding (cinematic briefing handoff)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RuledRadioGroup } from '@/components/ui/RuledRadioGroup';
import {
  completeIDay,
  markIDayStarted,
  markMissionAccepted,
} from '@/lib/missionJourney';
import { track } from '@/lib/analytics';
import { scheduleJourneyPush } from '@/lib/journeySync';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import {
  visibleGoalPresetIds,
  GOAL_PRESET_LABEL_KEY,
  GOAL_PRESET_DEFAULTS,
  goalPresetValue,
  isCustomGoal,
} from '@/lib/journeyGoals';
import {
  defaultDaysPerWeek,
  saveDaysPerWeek,
} from '@/lib/coach/schedulePrefs';
import { useWorkoutStore, hasLoggedWork } from '@/store/workoutStore';
import '@/components/house/house.css';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { seedHomeGymKitIfUnset } from '@/lib/workout/homeGymKit';
import {
  isClientPrivateGateEnabled,
  navigateAfterPrivateGateUnlock,
} from '@/lib/privateGateNavigate';
import { idayFinishPath } from '@/lib/idayFinishPath';
import { OnboardingLocaleFields } from '@/components/i18n/OnboardingLocaleFields';

const EXPERIENCE_VALUES = ['beginner', 'intermediate', 'advanced'] as const;
const EQUIPMENT_VALUES = ['bodyweight', 'dumbbells', 'full-gym'] as const;

type Step = 'welcome' | 'profile';

type WelcomePageProps = {
  /**
   * `?edit=1`, resolved by the route. Read as a prop rather than through
   * `useSearchParams()` so I-Day step one is server-rendered — that hook made
   * the whole page a Suspense child at prerender and the served HTML became the
   * fallback, one `aria-hidden` skeleton (`.765`). See `app/welcome/page.tsx`.
   */
  initialEdit?: boolean;
};

export function WelcomePage({ initialEdit = false }: WelcomePageProps) {
  const router = useRouter();
  const isEdit = initialEdit;
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>(initialEdit ? 'profile' : 'welcome');
  const [experience, setExperience] = useState('beginner');
  const [equipment, setEquipment] = useState('bodyweight');
  const [primaryGoal, setPrimaryGoal] = useState(() => goalPresetValue('strength'));
  const commitLocale = useRef<() => void>(() => {});
  const registerLocaleCommit = useCallback((commit: () => void) => {
    commitLocale.current = commit;
  }, []);

  const experienceLabel = (value: string) => {
    if (value === 'beginner') return t('welcomeExpBeginner', { defaultValue: 'New to training' });
    if (value === 'intermediate') return t('welcomeExpIntermediate', { defaultValue: 'Some experience' });
    return t('welcomeExpAdvanced', { defaultValue: 'Training for years' });
  };

  const equipmentLabel = (value: string) => {
    if (value === 'bodyweight') return t('welcomeEquipBodyweight', { defaultValue: 'Bodyweight only' });
    if (value === 'dumbbells') return t('welcomeEquipDumbbells', { defaultValue: 'Dumbbells or bands' });
    return t('welcomeEquipFullGym', { defaultValue: 'Full gym access' });
  };

  useEffect(() => {
    if (!isEdit || typeof window === 'undefined') return;
    setExperience(readRaw(STORAGE_KEYS.experience) || 'beginner');
    setEquipment(readRaw(STORAGE_KEYS.equipment) || 'bodyweight');
    setPrimaryGoal(
      readRaw(STORAGE_KEYS.primaryGoal) ||
        readRaw(STORAGE_KEYS.goals) ||
        t('welcomeGoalPlaceholder', { defaultValue: 'Build strength and stay healthy' })
    );
    setStep('profile');
  }, [isEdit, t]);

  const saveProfileFields = () => {
    writeRaw(STORAGE_KEYS.experience, experience);
    writeRaw(STORAGE_KEYS.equipment, equipment);
    writeRaw(STORAGE_KEYS.primaryGoal, primaryGoal);
    writeRaw(STORAGE_KEYS.goals, primaryGoal);
    seedHomeGymKitIfUnset(equipment);
    saveDaysPerWeek(defaultDaysPerWeek(experience));
    commitLocale.current();
    scheduleJourneyPush();
  };

  const finish = () => {
    const go = (path: string) => navigateAfterPrivateGateUnlock(path, router.push);

    if (isEdit) {
      saveProfileFields();
      go('/profile');
      return;
    }
    saveProfileFields();
    const persisted = completeIDay({ experience, equipment, primaryGoal });
    // Only a completion that reached the device counts as one. This is the
    // activation funnel's top event; firing it on a device that refused the write
    // is how a funnel number stops meaning anything.
    if (persisted) track('iday_completed', { experience, equipment });
    /*
     * Cold Begin opens Train. The page writes the compose session.
     * Finish does not start a workout itself.
     */
    go(
      idayFinishPath({
        isEdit: false,
        hasLoggedWork: hasLoggedWork(useWorkoutStore.getState().activeWorkout),
        gateOn: isClientPrivateGateEnabled(),
      })
    );
  };

  const handleBegin = () => {
    markIDayStarted();
    markMissionAccepted();
    track('iday_started');
    track('iday_mission_accepted');
    finish();
  };

  const handleProfileNext = () => {
    // F-017 — no I-Day sign-in wall. Account stays on Profile.
    if (!isEdit) {
      saveDaysPerWeek(defaultDaysPerWeek(experience));
      track('iday_profile_completed', {
        experience,
        equipment,
        daysPerWeek: defaultDaysPerWeek(experience),
      });
    }
    finish();
  };

  if (!isEdit) {
    return (
      <div className="mw-house polish-door">
        <div className="polish-col">
          <h1 className="polish-title">
            {t('footerTagline', { defaultValue: 'Log a set. Offline.' })}
          </h1>
          <button
            type="button"
            className="house-btn house-btn-primary polish-cta"
            onClick={handleBegin}
          >
            {t('landingHeroLine1', { defaultValue: 'Log a set.' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-foreground flex flex-col bg-background">
      <header className="relative z-10 border-b border-border px-4 py-3.5 flex items-center gap-3">
        <BrandMonogram />
        <span className="text-base font-semibold tracking-tight sm:text-lg">
          Mission Winning
        </span>
        <span className="ms-auto text-xs font-semibold text-muted-foreground">
          {isEdit
            ? t('editJourneyProfile', { defaultValue: 'Edit profile' })
            : t('welcomeIDay', { defaultValue: 'Get started' })}
        </span>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
        <div
          key={step}
          className="w-full max-w-lg page-enter space-y-6"
        >
            {step === 'profile' && (
              <>
                <div className="space-y-2">
                  <p className="eyebrow text-muted-foreground">
                    {isEdit
                      ? t('editJourneyProfile', { defaultValue: 'Edit profile' })
                      : t('welcomeProfileEyebrow', { defaultValue: 'About you' })}
                  </p>
                  <h2 className="display-section max-w-[18ch] text-balance text-foreground">
                    {isEdit
                      ? t('editJourneyProfile', { defaultValue: 'Edit profile' })
                      : t('welcomeProfileTitle', { defaultValue: 'A few quick questions' })}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {isEdit
                      ? t('welcomeProfileEditHint', {
                          defaultValue:
                            'Update experience, equipment, and goal. Changes sync when signed in.',
                        })
                      : t('welcomeProfileHint', {
                          defaultValue: 'So we can suggest a session that matches your gear.',
                        })}
                  </p>
                </div>
                <RuledRadioGroup
                  name="experience"
                  legend={t('welcomeExperience', { defaultValue: 'Experience' })}
                  value={experience}
                  onChange={setExperience}
                  options={EXPERIENCE_VALUES.map((value) => ({
                    value,
                    label: experienceLabel(value),
                  }))}
                />
                <RuledRadioGroup
                  name="equipment"
                  legend={t('welcomeGearCheck', {
                    defaultValue: 'Gear check — what do you have today?',
                  })}
                  value={equipment}
                  onChange={setEquipment}
                  options={EQUIPMENT_VALUES.map((value) => ({
                    value,
                    label: equipmentLabel(value),
                  }))}
                />
                <label className="block space-y-2 text-sm">
                  <span className="text-muted-foreground">
                    {t('welcomePrimaryGoal', { defaultValue: 'Primary goal' })}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {t('welcomeGoalPresetsLabel', {
                      defaultValue: 'Quick picks (or type your own below)',
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {visibleGoalPresetIds().map((id) => {
                      const value = goalPresetValue(id);
                      const selected = primaryGoal === value;
                      const labelKey = GOAL_PRESET_LABEL_KEY[id];
                      return (
                        <Button
                          key={id}
                          type="button"
                          size="sm"
                          variant={selected ? 'selected' : 'outline'}
                          className="min-h-[44px] tap-target"
                          onClick={() => setPrimaryGoal(value)}
                        >
                          {t(labelKey, { defaultValue: GOAL_PRESET_DEFAULTS[id] })}
                        </Button>
                      );
                    })}
                  </div>
                  <input
                    value={isCustomGoal(primaryGoal) ? primaryGoal : ''}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    className="w-full bg-background border-2 border-border px-3 py-2.5 min-h-[44px]"
                    placeholder={t('welcomeGoalPlaceholder', {
                      defaultValue: 'Build strength and stay healthy',
                    })}
                  />
                </label>
                <OnboardingLocaleFields onCommit={registerLocaleCommit} />
                <button
                  type="button"
                  className="primary-action min-h-[52px] w-full tap-target"
                  onClick={handleProfileNext}
                >
                  {isEdit
                    ? t('saveProfile', { defaultValue: 'Save profile' })
                    : t('welcomeContinue', { defaultValue: 'Continue' })}
                </button>
                {/*
                  Data-in, on the last screen before the first log. set-table
                  import has shipped for a while and lived three taps deep inside
                  a collapsed section on /account, so a switcher holding a CSV —
                  the export is how you leave another logger once it caps free history —
                  had no path to it. `.766` moved this off the sign-in step that
                  `.759`–`.764` removed. Reuses the import card's own translated strings;
                  a link, not a red action, because the free logger comes first.
                */}
                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  {t('csvImportTitle', { defaultValue: 'Your training history' })}{' '}
                  <a href="/account#import" className="underline underline-offset-2">
                    {t('csvImportCta', { defaultValue: 'Import workout CSV' })}
                  </a>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full min-h-[44px] tap-target"
                  onClick={() => (isEdit ? router.push('/profile') : setStep('welcome'))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />{' '}
                  {t('welcomeBack', { defaultValue: 'Back' })}
                </Button>
              </>
            )}

        </div>
      </main>

      <AppLegalFooter className="relative z-10 border-t border-border" />
    </div>
  );
}
