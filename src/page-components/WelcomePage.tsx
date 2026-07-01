'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  completeIDay,
  markIDayStarted,
  markMissionAccepted,
} from '@/lib/missionJourney';
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
  type TrainLocation,
  TRAIN_LOCATIONS,
  saveTrainLocation,
  trainLocationSuggestsBodyweight,
} from '@/lib/equipmentPrefs';

type Step = 'welcome' | 'mission' | 'profile' | 'signin';

const EXPERIENCE_VALUES = ['beginner', 'intermediate', 'advanced'] as const;
const EQUIPMENT_VALUES = ['bodyweight', 'dumbbells', 'full-gym'] as const;

export function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('welcome');
  const [experience, setExperience] = useState('beginner');
  const [equipment, setEquipment] = useState('bodyweight');
  const [trainLocation, setTrainLocation] = useState<TrainLocation>('home');
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

  const trainLocationLabel = (value: TrainLocation) => {
    if (value === 'village') return t('welcomeTrainVillage', { defaultValue: 'Village / rural area' });
    if (value === 'home') return t('welcomeTrainHome', { defaultValue: 'Home' });
    if (value === 'school') return t('welcomeTrainSchool', { defaultValue: 'School / schoolyard' });
    return t('welcomeTrainGym', { defaultValue: 'Gym or fitness center' });
  };

  const handleTrainLocationChange = (value: TrainLocation) => {
    setTrainLocation(value);
    if (trainLocationSuggestsBodyweight(value)) {
      setEquipment('bodyweight');
    }
  };

  useEffect(() => {
    if (!isEdit || typeof window === 'undefined') return;
    setExperience(localStorage.getItem('mw_experience') || 'beginner');
    setEquipment(localStorage.getItem('mw_equipment') || 'bodyweight');
    const loc = localStorage.getItem('mw_train_location');
    if (loc && TRAIN_LOCATIONS.includes(loc as TrainLocation)) {
      setTrainLocation(loc as TrainLocation);
    }
    setPrimaryGoal(
      localStorage.getItem('mw_primary_goal') ||
        localStorage.getItem('mw_goals') ||
        t('welcomeGoalPlaceholder', { defaultValue: 'Build strength and stay healthy' })
    );
    setStep('profile');
  }, [isEdit, t]);

  const saveProfileFields = () => {
    localStorage.setItem('mw_experience', experience);
    localStorage.setItem('mw_equipment', equipment);
    saveTrainLocation(trainLocation);
    localStorage.setItem('mw_primary_goal', primaryGoal);
    localStorage.setItem('mw_goals', primaryGoal);
    scheduleJourneyPush();
  };

  const finish = () => {
    if (isEdit) {
      saveProfileFields();
      router.push('/profile');
      return;
    }
    saveTrainLocation(trainLocation);
    localStorage.setItem('mw_equipment', equipment);
    completeIDay({ experience, equipment, primaryGoal });
    router.push('/log');
  };

  const handleBegin = () => {
    markIDayStarted();
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="glass-nav border-b border-border/50 px-4 py-4 flex items-center gap-2">
        <Shield className="h-6 w-6 text-emerald-400" />
        <span className="font-bold tracking-tight">
          Mission Winning ·{' '}
          {isEdit
            ? t('editJourneyProfile', { defaultValue: 'Edit journey profile' })
            : t('welcomeIDay', { defaultValue: 'I-Day' })}
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg content-card page-enter">
          <CardContent className="p-6 md:p-8 space-y-6">
            {step === 'welcome' && (
              <>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-emerald-400">
                    {t('welcomeKicker', { defaultValue: 'Where the journey begins' })}
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {t('welcomeTitle', { defaultValue: 'Welcome, Mission Member' })}
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t('welcomeSubtitle', {
                      defaultValue:
                        'Start your path toward lifelong health — one step at a time. About two minutes.',
                    })}
                  </p>
                </div>
                <Button
                  className="w-full py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleBegin}
                >
                  {t('welcomeBegin', { defaultValue: 'Begin' })}
                </Button>
              </>
            )}

            {step === 'mission' && (
              <>
                <div className="space-y-3 max-h-48 overflow-y-auto text-sm text-muted-foreground leading-relaxed pr-1">
                  <p>
                    <strong className="text-foreground">
                      {t('welcomeMissionLead', { defaultValue: 'The mission:' })}
                    </strong>{' '}
                    {t('welcomeMissionBody1', {
                      defaultValue:
                        'Mission Winning is a free global health app. Train, fuel, move, mind, track, and learn — one place, one path forward.',
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
                        'Your job today: complete one step at a time. Today hub will always show your next single action.',
                    })}
                  </p>
                </div>
                <Button
                  className="w-full py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleAcceptMission}
                >
                  {t('welcomeAccept', { defaultValue: 'I accept the path' })}
                </Button>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep('welcome')}>
                  <ChevronLeft className="h-4 w-4 mr-1" />{' '}
                  {t('welcomeBack', { defaultValue: 'Back' })}
                </Button>
              </>
            )}

            {step === 'profile' && (
              <>
                <div>
                  <h2 className="text-xl font-bold mb-1">
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
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full rounded-md bg-background border border-border px-3 py-2"
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
                    {t('welcomeTrainWhere', { defaultValue: 'Where do you train?' })}
                  </span>
                  <select
                    value={trainLocation}
                    onChange={(e) => handleTrainLocationChange(e.target.value as TrainLocation)}
                    className="w-full rounded-md bg-background border border-border px-3 py-2"
                  >
                    {TRAIN_LOCATIONS.map((value) => (
                      <option key={value} value={value}>
                        {trainLocationLabel(value)}
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
                    className="w-full rounded-md bg-background border border-border px-3 py-2"
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
                          className={selected ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
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
                    className="w-full rounded-md bg-background border border-border px-3 py-2"
                    placeholder={t('welcomeGoalPlaceholder', {
                      defaultValue: 'Build strength and stay healthy',
                    })}
                  />
                </label>
                <Button
                  className="w-full py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleProfileNext}
                >
                  {isEdit
                    ? t('saveProfile', { defaultValue: 'Save profile' })
                    : t('welcomeContinue', { defaultValue: 'Continue' })}
                </Button>
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
                  <h2 className="text-xl font-bold mb-1">
                    {t('welcomeSignInTitle', { defaultValue: 'Save progress — your choice' })}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('welcomeSignInSubtitle', {
                      defaultValue:
                        'Sign in with Google or email to sync across devices. Skip anytime — local progress still works.',
                    })}
                  </p>
                </div>
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
          </CardContent>
        </Card>
      </main>

      <AppLegalFooter className="border-t border-border/30" />
    </div>
  );
}
