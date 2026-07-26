'use client';
/**
 * Page: /welcome — I-Day onboarding (cinematic briefing handoff)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  completeIDay,
  markIDayStarted,
  markMissionAccepted,
} from '@/lib/missionJourney';
import { track } from '@/lib/analytics';
import { scheduleJourneyPush } from '@/lib/journeySync';
import { SignInPanel } from '@/components/auth/SignInPanel';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import {
  GOAL_PRESET_IDS,
  GOAL_PRESET_LABEL_KEY,
  GOAL_PRESET_DEFAULTS,
  goalPresetValue,
  isCustomGoal,
} from '@/lib/journeyGoals';
import {
  defaultDaysPerWeek,
  saveDaysPerWeek,
} from '@/lib/coach/schedulePrefs';
import { previewJustGoForEquipment } from '@/lib/justGoSession';
import { getExerciseById } from '@/data/exercises';
import { useWorkoutStore } from '@/store/workoutStore';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { readRaw, writeRaw, remove as removeKey } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

const EXPERIENCE_VALUES = ['beginner', 'intermediate', 'advanced'] as const;
const EQUIPMENT_VALUES = ['bodyweight', 'dumbbells', 'full-gym'] as const;

type Step = 'welcome' | 'profile' | 'signin';

const STEP_ORDER: Step[] = ['welcome', 'profile', 'signin'];

export function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('welcome');
  const [experience, setExperience] = useState('beginner');
  const [equipment, setEquipment] = useState('bodyweight');
  const [primaryGoal, setPrimaryGoal] = useState(() => goalPresetValue('strength'));

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
    saveDaysPerWeek(defaultDaysPerWeek(experience));
    scheduleJourneyPush();
  };

  const finish = () => {
    if (isEdit) {
      saveProfileFields();
      router.push('/profile');
      return;
    }
    saveProfileFields();
    completeIDay({ experience, equipment, primaryGoal });
    track('iday_completed', { experience, equipment });
    // W1: land in the previewed session — no Today detour before first sweat.
    const session = previewJustGoForEquipment(equipment);
    if (session.exercises.length > 0) {
      useWorkoutStore.getState().startWorkout(session.name, session.exercises);
      track('just_go_started', { source: session.source, focus: session.focusGroup });
      router.push('/active');
      return;
    }
    router.push('/log');
  };

  const handleBegin = () => {
    markIDayStarted();
    markMissionAccepted();
    track('iday_started');
    track('iday_mission_accepted');
    setStep('profile');
  };

  const handleProfileNext = () => {
    if (isEdit) {
      finish();
      return;
    }
    // Days/week defaults from experience — Coach can refine later (D1: 3 questions max).
    saveDaysPerWeek(defaultDaysPerWeek(experience));
    track('iday_profile_completed', {
      experience,
      equipment,
      daysPerWeek: defaultDaysPerWeek(experience),
    });
    setStep('signin');
  };

  const stepIndex = STEP_ORDER.indexOf(step);
  const firstSession = useMemo(() => previewJustGoForEquipment(equipment), [equipment]);
  const firstSessionNames = useMemo(
    () =>
      firstSession.exercises
        .slice(0, 4)
        .map((ex) => getExerciseById(ex.exerciseId)?.name ?? ex.exerciseId),
    [firstSession]
  );

  return (
    <div className="relative min-h-screen text-foreground flex flex-col bg-background">
      <header className="relative z-10 border-b border-border/40 px-4 py-3.5 flex items-center gap-3">
        <BrandMonogram />
        <span className="text-base font-semibold tracking-tight sm:text-lg">
          Mission Winning
        </span>
        <span className="ms-auto text-xs font-medium text-muted-foreground">
          {isEdit
            ? t('editJourneyProfile', { defaultValue: 'Edit profile' })
            : t('welcomeIDay', { defaultValue: 'Get started' })}
        </span>
      </header>

      {!isEdit && (
        <div
          className="relative z-10 mx-auto w-full max-w-lg px-5 pt-5"
          role="group"
          aria-label={t('welcomeProgressLabel', {
            defaultValue: `Progress, step ${stepIndex + 1} of ${STEP_ORDER.length}`,
          })}
        >
          <div className="flex items-center gap-3">
            <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / STEP_ORDER.length) * 100}%` }}
              />
            </div>
            <p className="text-xs font-medium text-muted-foreground tabular-nums shrink-0">
              {t('welcomeProgressMono', {
                step: stepIndex + 1,
                total: STEP_ORDER.length,
                defaultValue: `${stepIndex + 1} / ${STEP_ORDER.length}`,
              })}
            </p>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
        <div
          key={step}
          className="w-full max-w-lg page-enter space-y-6"
        >
            {step === 'welcome' && (
              <>
                <div className="space-y-4">
                  <p className="text-xs font-medium tracking-wide text-primary">
                    {t('welcomeKicker', { defaultValue: 'About two minutes' })}
                  </p>
                  <h1 className="text-[1.85rem] md:text-[2.35rem] font-semibold tracking-tight leading-[1.15]">
                    {t('welcomeTitle', { defaultValue: 'Welcome' })}
                  </h1>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                    {t('welcomeSubtitle', {
                      defaultValue:
                        'Free offline logging, forever. Answer a few questions, then log your first session — Today always shows what to do next.',
                    })}
                  </p>
                </div>

                <div className="card-boss px-4 py-3.5 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('welcomePreviewLabel', { defaultValue: 'Your first session is ready' })}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {t('welcomePreviewSessionName', {
                      defaultValue: firstSession.name,
                      name: firstSession.name,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {firstSessionNames.join(' · ')}
                  </p>
                </div>

                <button type="button" className="primary-action" onClick={handleBegin}>
                  {t('welcomeBegin', { defaultValue: 'Continue' })}
                </button>
              </>
            )}

            {step === 'profile' && (
              <>
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                    {isEdit
                      ? t('editJourneyProfile', { defaultValue: 'Edit profile' })
                      : t('welcomeProfileEyebrow', { defaultValue: 'About you' })}
                  </p>
                  <h2 className="text-[1.5rem] md:text-[1.75rem] font-semibold tracking-tight mb-1 leading-tight">
                    {isEdit
                      ? t('editJourneyProfile', { defaultValue: 'Edit profile' })
                      : t('welcomeProfileTitle', { defaultValue: 'Three quick questions' })}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
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
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">
                    {t('welcomeExperience', { defaultValue: 'Experience' })}
                  </span>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full rounded-xl bg-background/80 border border-border/60 px-3 py-2.5 min-h-[44px]"
                  >
                    {EXPERIENCE_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {experienceLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">
                    {t('welcomeGearCheck', { defaultValue: 'Gear check — what do you have today?' })}
                  </span>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full rounded-xl bg-background/80 border border-border/60 px-3 py-2.5 min-h-[44px]"
                  >
                    {EQUIPMENT_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {equipmentLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>
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
                    {GOAL_PRESET_IDS.map((id) => {
                      const value = goalPresetValue(id);
                      const selected = primaryGoal === value;
                      const labelKey = GOAL_PRESET_LABEL_KEY[id];
                      return (
                        <Button
                          key={id}
                          type="button"
                          size="sm"
                          variant={selected ? 'default' : 'outline'}
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
                    className="w-full rounded-xl bg-background/80 border border-border/60 px-3 py-2.5 min-h-[44px]"
                    placeholder={t('welcomeGoalPlaceholder', {
                      defaultValue: 'Build strength and stay healthy',
                    })}
                  />
                </label>
                <button type="button" className="primary-action" onClick={handleProfileNext}>
                  {isEdit
                    ? t('saveProfile', { defaultValue: 'Save profile' })
                    : t('welcomeContinue', { defaultValue: 'Continue' })}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => (isEdit ? router.push('/profile') : setStep('welcome'))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />{' '}
                  {t('welcomeBack', { defaultValue: 'Back' })}
                </Button>
              </>
            )}

            {step === 'signin' && (
              <>
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                    {t('welcomeSignInEyebrow', { defaultValue: 'Optional' })}
                  </p>
                  <h2 className="text-[1.5rem] md:text-[1.75rem] font-semibold tracking-tight mb-1 leading-tight">
                    {t('welcomeSignInTitle', { defaultValue: 'Save progress — your choice' })}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('welcomeSignInSubtitle', {
                      defaultValue:
                        'Sign in with Google or email to sync across devices. Skip anytime — local progress still works.',
                    })}
                  </p>
                </div>
                <div className="card-boss px-4 py-3.5 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('welcomeSessionReadyEyebrow', { defaultValue: 'Up next' })}
                  </p>
                  <p className="text-sm font-medium">
                    {t('welcomeSessionReadyTitle', {
                      defaultValue: 'Your first session is ready',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('welcomeSessionReadyBody', {
                      defaultValue: `${firstSession.name} · ${firstSessionNames.length} exercises for your gear. Skip sign-in to start logging right away.`,
                      name: firstSession.name,
                      count: firstSessionNames.length,
                    })}
                  </p>
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-primary"
                    defaultChecked={false}
                    onChange={(e) => {
                      try {
                        if (e.target.checked) writeRaw(STORAGE_KEYS.remindersPref, '1');
                        else removeKey(STORAGE_KEYS.remindersPref);
                      } catch { /* noop */ }
                    }}
                  />
                  <span className="text-muted-foreground">
                    {t('welcomeRemindersOptIn', {
                      defaultValue:
                        'Email me training reminders (streak at risk, next step). Optional — unsubscribe anytime.',
                    })}
                  </span>
                </label>
                <SignInPanel
                  allowSkip
                  nextPath="/active"
                  skipLabel={t('welcomeSkipSignIn', { defaultValue: 'Skip — start first session' })}
                  onComplete={finish}
                />
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep('profile')}>
                  <ChevronLeft className="h-4 w-4 mr-1" />{' '}
                  {t('welcomeBack', { defaultValue: 'Back' })}
                </Button>
              </>
            )}
        </div>
      </main>

      <AppLegalFooter className="relative z-10 border-t border-border/30" />
    </div>
  );
}
