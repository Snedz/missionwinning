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

type Step = 'welcome' | 'mission' | 'profile' | 'signin';

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'New to training' },
  { value: 'intermediate', label: 'Some experience' },
  { value: 'advanced', label: 'Training for years' },
];

const EQUIPMENT_OPTIONS = [
  { value: 'bodyweight', label: 'Bodyweight only' },
  { value: 'dumbbells', label: 'Dumbbells or bands' },
  { value: 'full-gym', label: 'Full gym access' },
];

export function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('welcome');
  const [experience, setExperience] = useState('beginner');
  const [equipment, setEquipment] = useState('bodyweight');
  const [primaryGoal, setPrimaryGoal] = useState('Build strength and stay healthy');

  useEffect(() => {
    if (!isEdit || typeof window === 'undefined') return;
    setExperience(localStorage.getItem('mw_experience') || 'beginner');
    setEquipment(localStorage.getItem('mw_equipment') || 'bodyweight');
    setPrimaryGoal(
      localStorage.getItem('mw_primary_goal') ||
        localStorage.getItem('mw_goals') ||
        'Build strength and stay healthy'
    );
    setStep('profile');
  }, [isEdit]);

  const saveProfileFields = () => {
    localStorage.setItem('mw_experience', experience);
    localStorage.setItem('mw_equipment', equipment);
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
          Mission Winning · {isEdit ? t('editJourneyProfile', { defaultValue: 'Edit journey profile' }) : 'I-Day'}
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg content-card">
          <CardContent className="p-6 md:p-8 space-y-6">
            {step === 'welcome' && (
              <>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-emerald-400">Where the journey begins</p>
                  <h1 className="text-2xl md:text-3xl font-bold">{t('welcomeTitle', { defaultValue: 'Welcome, Mission Member' })}</h1>
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
                    <strong className="text-foreground">The mission:</strong> Mission Winning is a free global
                    health app. Train, fuel, move, mind, track, and learn — one place, one path forward.
                  </p>
                  <p>
                    The fundamentals are <strong className="text-emerald-400">free forever</strong>.
                    Premium deepens each pillar for those who want more — never required to start.
                  </p>
                  <p>
                    Your job today: complete one step at a time. Today hub will always show your{' '}
                    <strong className="text-foreground">next single action</strong>.
                  </p>
                </div>
                <Button
                  className="w-full py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleAcceptMission}
                >
                  {t('welcomeAccept', { defaultValue: 'I accept the path' })}
                </Button>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep('welcome')}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              </>
            )}

            {step === 'profile' && (
              <>
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    {isEdit ? t('editJourneyProfile', { defaultValue: 'Edit journey profile' }) : 'Three quick questions'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isEdit
                      ? 'Update experience, equipment, and goal. Changes sync when signed in.'
                      : 'So Today can recommend the right starting point.'}
                  </p>
                </div>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">Experience</span>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full rounded-md bg-background border border-border px-3 py-2"
                  >
                    {EXPERIENCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">Gear check — what do you have today?</span>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full rounded-md bg-background border border-border px-3 py-2"
                  >
                    {EQUIPMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">Primary goal</span>
                  <input
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    className="w-full rounded-md bg-background border border-border px-3 py-2"
                    placeholder="Build strength and stay healthy"
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
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              </>
            )}

            {step === 'signin' && (
              <>
                <div>
                  <h2 className="text-xl font-bold mb-1">Save progress — your choice</h2>
                  <p className="text-sm text-muted-foreground">
                    Sign in with Apple, Google, or email to sync across devices. Skip anytime — local
                    progress still works.
                  </p>
                </div>
                <SignInPanel
                  allowSkip
                  nextPath="/log"
                  skipLabel={t('welcomeSkipSignIn', { defaultValue: 'Skip — go to Today' })}
                  onComplete={finish}
                />
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep('profile')}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="text-center text-[10px] text-muted-foreground py-4 px-4">
        Civilian health app — inspired by structured military onboarding, not affiliated with DoD.
      </footer>
    </div>
  );
}
