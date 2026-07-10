'use client';
/**
 * Page: /welcome — I-Day onboarding (cinematic briefing handoff)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect } from 'react';
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
  loadDaysPerWeek,
  saveDaysPerWeek,
} from '@/lib/coach/schedulePrefs';
import { cn } from '@/lib/utils';

const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6] as const;

type Step = 'welcome' | 'mission' | 'profile' | 'signin';

const EXPERIENCE_VALUES = ['beginner', 'intermediate', 'advanced'] as const;
const EQUIPMENT_VALUES = ['bodyweight', 'dumbbells', 'full-gym'] as const;

const STEP_ORDER: Step[] = ['welcome', 'mission', 'profile', 'signin'];

export function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('welcome');
  const [experience, setExperience] = useState('beginner');
  const [equipment, setEquipment] = useState('bodyweight');
  const [primaryGoal, setPrimaryGoal] = useState(() => goalPresetValue('strength'));
  const [daysPerWeek, setDaysPerWeek] = useState(3);

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
    setExperience(localStorage.getItem('mw_experience') || 'beginner');
    setEquipment(localStorage.getItem('mw_equipment') || 'bodyweight');
    setPrimaryGoal(
      localStorage.getItem('mw_primary_goal') ||
        localStorage.getItem('mw_goals') ||
        t('welcomeGoalPlaceholder', { defaultValue: 'Build strength and stay healthy' })
    );
    setDaysPerWeek(loadDaysPerWeek(localStorage.getItem('mw_experience') || 'beginner'));
    setStep('profile');
  }, [isEdit, t]);

  const saveProfileFields = () => {
    localStorage.setItem('mw_experience', experience);
    localStorage.setItem('mw_equipment', equipment);
    localStorage.setItem('mw_primary_goal', primaryGoal);
    localStorage.setItem('mw_goals', primaryGoal);
    saveDaysPerWeek(daysPerWeek);
    scheduleJourneyPush();
  };

  const finish = () => {
    if (isEdit) {
      saveProfileFields();
      router.push('/profile');
      return;
    }
    completeIDay({ experience, equipment, primaryGoal });
    track('iday_completed', { experience, equipment });
    router.push('/log');
  };

  const handleBegin = () => {
    markIDayStarted();
    track('iday_started');
    setStep('mission');
  };

  const handleAcceptMission = () => {
    markMissionAccepted();
    setStep('profile');
  };

  const handleProfileNext = () => {
    if (isEdit) {
      finish();
      return;
    }
    setStep('signin');
  };

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="relative min-h-screen text-foreground flex flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(16,185,129,0.14),transparent_50%),radial-gradient(ellipse_at_90%_20%,rgba(180,140,60,0.08),transparent_45%),linear-gradient(180deg,hsl(222_40%_8%)_0%,hsl(222_45%_6%)_100%)]"
        aria-hidden
      />

      <header className="relative z-10 border-b border-border/40 px-4 py-3.5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
          MW
        </span>
        <span className="font-display text-lg font-semibold uppercase tracking-wide">
          Mission Winning
        </span>
        <span className="eyebrow ms-auto">
          {isEdit
            ? t('editJourneyProfile', { defaultValue: 'Edit journey profile' })
            : t('welcomeIDay', { defaultValue: 'I-Day' })}
        </span>
      </header>

      {!isEdit && (
        <div className="relative z-10 mx-auto w-full max-w-lg px-5 pt-4 flex gap-1.5" aria-hidden>
          {STEP_ORDER.map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= stepIndex ? 'bg-emerald-500' : 'bg-border/50'
              )}
            />
          ))}
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
                  <p className="eyebrow-live">
                    {t('welcomeKicker', { defaultValue: 'I-Day · About two minutes' })}
                  </p>
                  <h1 className="display-hero text-[2rem] md:text-[2.75rem] leading-[1.05]">
                    {t('welcomeTitle', { defaultValue: 'Welcome, Mission Member' })}
                  </h1>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                    {t('welcomeSubtitle', {
                      defaultValue:
                        'Set your path, then log your first session. One step at a time — Today always shows the next action.',
                    })}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-3">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-400/90 font-medium">
                    {t('welcomePreviewLabel', { defaultValue: 'What you’ll open next' })}
                  </p>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('todayMissionScore', { defaultValue: 'Mission Score' })}
                      </p>
                      <p className="text-3xl font-bold tabular-nums text-emerald-400 score-tick">—</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground max-w-[10rem]">
                      {t('welcomePreviewJustGo', {
                        defaultValue: 'Today → Just Go builds a free session from your gear.',
                      })}
                    </div>
                  </div>
                </div>

                <button type="button" className="primary-action" onClick={handleBegin}>
                  {t('welcomeBegin', { defaultValue: 'Begin' })}
                </button>
              </>
            )}

            {step === 'mission' && (
              <>
                <div className="space-y-3">
                  <p className="eyebrow">{t('welcomeMissionLead', { defaultValue: 'The mission' })}</p>
                  <h2 className="display-section text-[1.65rem] md:text-[2rem]">
                    {t('welcomeMissionTitle', { defaultValue: 'One path. Free fundamentals.' })}
                  </h2>
                </div>
                <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                  <p>
                    {t('welcomeMissionBody1', {
                      defaultValue:
                        'Mission Winning is a free workout tracker first — then fuel, move, mind, track, and learn in one place.',
                    })}
                  </p>
                  <p>
                    {t('welcomeMissionP2', {
                      defaultValue:
                        'The fundamentals are free forever. Premium deepens each pillar for those who want more — never required to start.',
                    })}
                  </p>
                  <p>
                    {t('welcomeMissionP3', {
                      defaultValue:
                        'Your job today: complete one step at a time. Today always shows your next single action.',
                    })}
                  </p>
                </div>
                <button type="button" className="primary-action" onClick={handleAcceptMission}>
                  {t('welcomeAccept', { defaultValue: 'I accept the path' })}
                </button>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep('welcome')}>
                  <ChevronLeft className="h-4 w-4 mr-1" />{' '}
                  {t('welcomeBack', { defaultValue: 'Back' })}
                </Button>
              </>
            )}

            {step === 'profile' && (
              <>
                <div>
                  <p className="eyebrow mb-2">
                    {isEdit
                      ? t('editJourneyProfile', { defaultValue: 'Edit journey profile' })
                      : t('welcomeProfileEyebrow', { defaultValue: 'Briefing' })}
                  </p>
                  <h2 className="display-section text-[1.5rem] md:text-[1.85rem] mb-1">
                    {isEdit
                      ? t('editJourneyProfile', { defaultValue: 'Edit journey profile' })
                      : t('welcomeProfileTitle', { defaultValue: 'Three quick questions' })}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isEdit
                      ? t('welcomeProfileEditHint', {
                          defaultValue:
                            'Update experience, equipment, and goal. Changes sync when signed in.',
                        })
                      : t('welcomeProfileHint', {
                          defaultValue: 'So Today can recommend the right starting point.',
                        })}
                  </p>
                </div>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">
                    {t('welcomeExperience', { defaultValue: 'Experience' })}
                  </span>
                  <select
                    value={experience}
                    onChange={(e) => {
                      setExperience(e.target.value);
                      if (!isEdit) {
                        setDaysPerWeek(defaultDaysPerWeek(e.target.value));
                      }
                    }}
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
                          className={selected ? 'bg-emerald-600 hover:bg-emerald-500' : ''}
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
                <label className="block space-y-2 text-sm">
                  <span className="text-muted-foreground">
                    {t('coachDaysPerWeek', { defaultValue: 'How many days a week?' })}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_PER_WEEK_OPTIONS.map((n) => (
                      <Button
                        key={n}
                        type="button"
                        size="sm"
                        variant={daysPerWeek === n ? 'default' : 'outline'}
                        className={daysPerWeek === n ? 'bg-emerald-600 hover:bg-emerald-500' : ''}
                        onClick={() => setDaysPerWeek(n)}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
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
                  onClick={() => (isEdit ? router.push('/profile') : setStep('mission'))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />{' '}
                  {t('welcomeBack', { defaultValue: 'Back' })}
                </Button>
              </>
            )}

            {step === 'signin' && (
              <>
                <div>
                  <p className="eyebrow mb-2">
                    {t('welcomeSignInEyebrow', { defaultValue: 'Optional' })}
                  </p>
                  <h2 className="display-section text-[1.5rem] md:text-[1.85rem] mb-1">
                    {t('welcomeSignInTitle', { defaultValue: 'Save progress — your choice' })}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('welcomeSignInSubtitle', {
                      defaultValue:
                        'Sign in with Google or email to sync across devices. Skip anytime — local progress still works.',
                    })}
                  </p>
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-emerald-600"
                    defaultChecked={false}
                    onChange={(e) => {
                      try {
                        if (e.target.checked) localStorage.setItem('mw_reminders_pref', '1');
                        else localStorage.removeItem('mw_reminders_pref');
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
                  nextPath="/log"
                  skipLabel={t('welcomeSkipSignIn', { defaultValue: 'Skip — go to Today' })}
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
