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
import { RuledRadioGroup } from '@/components/ui/RuledRadioGroup';
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
import { previewJustGoForEquipment } from '@/lib/justGoSession';
import { getExerciseById } from '@/data/exercises';
import { useWorkoutStore, hasLoggedWork } from '@/store/workoutStore';
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
    /*
     * `.204` — never let onboarding take a session away.
     *
     * `startWorkout` replaces `activeWorkout` outright, and its other seventeen
     * call sites are all a user tapping "start this workout", where replacing is
     * exactly what was asked for. This one is not: it is a side effect of
     * finishing I-Day, and a returning athlete can reach it by accident —
     * `/` renders marketing for anyone past the gate, its only prominent CTA is
     * "Start free", and that leads here.
     *
     * So the preview session is a courtesy, not a mandate. If there is real work
     * on the device, send them to it instead of over it.
     */
    if (hasLoggedWork(useWorkoutStore.getState().activeWorkout)) {
      router.push('/active');
      return;
    }
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

      {!isEdit && (
        <div
          className="relative z-10 mx-auto w-full max-w-lg px-5 pt-5"
          role="group"
          aria-label={t('welcomeProgressLabel', {
            step: stepIndex + 1,
            total: STEP_ORDER.length,
            defaultValue: `Progress, step ${stepIndex + 1} of ${STEP_ORDER.length}`,
          })}
        >
          <div className="flex items-center gap-3">
            <div className="h-1 flex-1 bg-muted overflow-hidden">
              <div
                className="h-full bg-primary-fill transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / STEP_ORDER.length) * 100}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-muted-foreground tabular-nums shrink-0">
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
                {/* Field manual: briefing type — eyebrow → display → one red. */}
                <div className="space-y-4">
                  <p className="eyebrow text-primary">
                    {t('welcomeKicker', { defaultValue: 'About two minutes' })}
                  </p>
                  <h1 className="display-section max-w-[16ch] text-balance text-foreground">
                    {t('welcomeTitle', { defaultValue: 'Welcome' })}
                  </h1>
                  <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                    {t('welcomeSubtitleBrief', {
                      defaultValue:
                        'A few questions, then log your first session. Free offline logging — forever.',
                    })}
                  </p>
                </div>

                <div className="card-elevated space-y-1.5 px-4 py-3.5">
                  <p className="eyebrow text-muted-foreground">
                    {t('welcomePreviewLabel', { defaultValue: 'Your first session is ready' })}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {t('welcomePreviewSessionName', {
                      defaultValue: firstSession.name,
                      name: firstSession.name,
                    })}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {firstSessionNames.join(' · ')}
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-action min-h-[52px] w-full tap-target"
                  onClick={handleBegin}
                >
                  {t('welcomeBegin', { defaultValue: 'Continue' })}
                </button>
              </>
            )}

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
                      : t('welcomeProfileTitle', { defaultValue: 'Three quick questions' })}
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
                <button
                  type="button"
                  className="primary-action min-h-[52px] w-full tap-target"
                  onClick={handleProfileNext}
                >
                  {isEdit
                    ? t('saveProfile', { defaultValue: 'Save profile' })
                    : t('welcomeContinue', { defaultValue: 'Continue' })}
                </button>
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

            {step === 'signin' && (
              <>
                <div className="space-y-2">
                  <p className="eyebrow text-muted-foreground">
                    {t('welcomeSignInEyebrow', { defaultValue: 'Optional' })}
                  </p>
                  <h2 className="display-section max-w-[18ch] text-balance text-foreground">
                    {t('welcomeSignInTitle', { defaultValue: 'Save progress — your choice' })}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t('welcomeSignInSubtitle', {
                      defaultValue:
                        'Sign in with Google or email to sync across devices. Skip anytime — local progress still works.',
                    })}
                  </p>
                </div>
                {/* Elevated, not boss — Skip owns the only red on this step. */}
                <div className="card-elevated space-y-1.5 px-4 py-3.5">
                  <p className="eyebrow text-muted-foreground">
                    {t('welcomeSessionReadyEyebrow', { defaultValue: 'Up next' })}
                  </p>
                  <p className="text-sm font-semibold">
                    {t('welcomeSessionReadyTitle', {
                      defaultValue: 'Your first session is ready',
                    })}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t('welcomeSessionReadyBody', {
                      defaultValue: `${firstSession.name} · ${firstSessionNames.length} exercises for your gear. Skip sign-in to start logging right away.`,
                      name: firstSession.name,
                      count: firstSessionNames.length,
                    })}
                  </p>
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 border-2 border-border bg-card p-3 text-sm">
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
                        'Email me if I go quiet, and a recap after my first week. Never more than one every two days — unsubscribe anytime.',
                    })}
                  </span>
                </label>
                {/*
                  Sign-in is subordinate here, and structurally so: it sits
                  inside a ruled panel, and the step's one primary action is
                  Skip. It used to be the other way round — a filled primary on
                  "Send magic link" with the skip a ghost button in muted text,
                  which is the weakest thing on the screen. "No account required
                  to start" is the product's headline promise; the last
                  onboarding screen must not spend its emphasis arguing with it.
                */}
                <div className="border-2 border-border bg-card p-4">
                  <SignInPanel nextPath="/active" onComplete={finish} />
                </div>
                <button
                  type="button"
                  className="primary-action min-h-[52px] w-full tap-target text-[19px]"
                  onClick={finish}
                >
                  {t('welcomeSkipSignIn', { defaultValue: 'Skip — start training' })}
                </button>
                <Button variant="ghost" size="sm" className="w-full min-h-[44px] tap-target" onClick={() => setStep('profile')}>
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
