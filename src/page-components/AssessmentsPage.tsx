'use client';

import { useState } from 'react';
import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkoutStore } from '@/store/workoutStore';
import { saveNutritionEntry } from '@/lib/supabase';
import { usePremium } from '@/hooks/usePremium';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import {
  type AssessmentResult,
  type PathfinderAccess,
  buildAssessmentResult,
  persistAssessment,
  recommendationAllowed,
} from '@/lib/pathfinderAssessment';
import { ASSESSMENT_QUESTION_KEYS, assessmentStringsFor } from '@/i18n/assessmentLocales';
import { openVillageHealthCard } from '@/lib/villageHealthCardHtml';
import { getStoredTrainLocation } from '@/lib/equipmentPrefs';
import { getTrainingStreak } from '@/lib/challenges';

type Step = 'questions' | 'pathfinder' | 'result';

export function AssessmentsPage() {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>('questions');
  const [pathfinderAccess, setPathfinderAccess] = useState<PathfinderAccess>('regular');
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  usePremium();

  const enAssess = assessmentStringsFor('en');

  const questions = ASSESSMENT_QUESTION_KEYS.map((key) => ({
    key,
    q: t(`assessQ_${key}`, { defaultValue: enAssess[`assessQ_${key}`] ?? key }),
  }));

  const stages = [
    { name: 'Pre-Contemplation (Not Ready)', focus: 'Build awareness without pressure. Evoke curiosity and values.', qs: ['What do you enjoy about your current habits?', 'How do you view your health or energy 5 years from now?'] },
    { name: 'Contemplation (Getting Ready)', focus: 'Normalize ambivalence. Explore benefits and barriers.', qs: ['What might be some benefits if you made this change?', 'What feels hardest about starting?'] },
    { name: 'Preparation / Action', focus: 'Strengthen confidence. Reinforce progress. Small wins + autonomy.', qs: ["What's one small step you could take this week?", "What's been working best so far?"] },
    { name: 'Maintenance', focus: 'Support autonomy, mastery, relapse prevention. New goals.', qs: ['How do you maintain progress when life gets stressful?', 'What new goals feel inspiring now?'] },
  ];
  const [selectedStage, setSelectedStage] = useState(0);

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const proceedToPathfinder = () => {
    setStep('pathfinder');
  };

  const submitAssessment = (access: PathfinderAccess) => {
    const res = buildAssessmentResult(answers, access);
    setPathfinderAccess(access);
    setResult(res);
    setStep('result');
    persistAssessment(res);

    saveNutritionEntry({
      date: res.date,
      name: `Assessment: ${res.risk} risk${res.pathfinderTrack ? ' (Pathfinder)' : ''}`,
      protein: 0,
      cals: 0,
    }).catch(() => {});
  };

  const bumpStreak = () => {
    const cur = parseInt((typeof window !== 'undefined' ? localStorage.getItem('mw_streak') : '0') || '0');
    const next = Math.max(1, cur + 1);
    if (typeof window !== 'undefined') localStorage.setItem('mw_streak', String(next));
  };

  const startRecommended = (rec: string) => {
    if (result && !recommendationAllowed(rec, result.programGate ?? 'standard')) return;
    bumpStreak();
    let name = 'Daily Mobility + Mind Habit';
    let exs: { exerciseId: string; sets: { reps: number; weight: number }[] }[] = [
      { exerciseId: 'cat-camel', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'bird-dog', sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: 'glute-bridge', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'couch-stretch', sets: [{ reps: 45, weight: 0 }] },
    ];
    if (rec.toLowerCase().includes('bodyweight') || rec.toLowerCase().includes('full body')) {
      name = 'Full Body Habit Builder';
      exs = [
        { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] },
        { exerciseId: 'squats', sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: 'glute-bridge', sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: 'plank', sets: [{ reps: 25, weight: 0 }] },
        { exerciseId: 'couch-stretch', sets: [{ reps: 45, weight: 0 }] },
      ];
    } else if (rec.toLowerCase().includes('mobility') || rec.toLowerCase().includes('corrective')) {
      name = 'Daily Mobility Circuit (Free)';
      exs = [
        { exerciseId: 'cat-camel', sets: [{ reps: 8, weight: 0 }] },
        { exerciseId: 'bird-dog', sets: [{ reps: 6, weight: 0 }] },
        { exerciseId: 'glute-bridge', sets: [{ reps: 10, weight: 0 }] },
        { exerciseId: 'wall-sit', sets: [{ reps: 30, weight: 0 }] },
        { exerciseId: 'superman', sets: [{ reps: 8, weight: 0 }] },
      ];
    } else if (rec.toLowerCase().includes('upper') || rec.toLowerCase().includes('bodyweight & dumbbell')) {
      name = 'Bodyweight Strength Circuit';
      exs = [
        { exerciseId: 'push-ups', sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: 'squats', sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: 'inverted-row', sets: [{ reps: 8, weight: 0 }] },
        { exerciseId: 'lunges', sets: [{ reps: 10, weight: 0 }] },
        { exerciseId: 'plank', sets: [{ reps: 30, weight: 0 }] },
      ];
    }
    startWorkout(name, exs);
    window.location.href = '/active';
  };

  const printHealthCard = () => {
    if (!result) return;
    const streak = getTrainingStreak(workoutHistory);
    openVillageHealthCard({
      assessment: result,
      workoutCount: workoutHistory.length,
      lastWorkoutName: workoutHistory[0]?.workoutName,
      streak,
      trainLocation: getStoredTrainLocation(),
    });
  };

  const visibleRecommendations =
    result?.recommendations.filter((r) =>
      recommendationAllowed(r, result.programGate ?? 'standard')
    ) ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('assessmentTitle', { defaultValue: 'Readiness Assessment' })}
        </h2>
        <p className="text-muted-foreground">
          {t('assessSubtitle', {
            defaultValue:
              'Free core tool. Answer honestly for personalized guidance — including a Pathfinder track if regular doctor access is difficult.',
          })}
        </p>
      </div>

      {step === 'questions' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('healthScreen', { defaultValue: 'Quick Health & Lifestyle Screen' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-sm font-medium">{item.q}</div>
                <div className="flex gap-2 flex-wrap">
                  {(
                    [
                      { value: 'yes', label: t('assessYes', { defaultValue: 'Yes' }) },
                      { value: 'no', label: t('assessNo', { defaultValue: 'No' }) },
                      { value: 'unsure', label: t('assessUnsure', { defaultValue: 'Unsure' }) },
                    ] as const
                  ).map(({ value, label }) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={answers[item.key] === value ? 'default' : 'outline'}
                      onClick={() => handleAnswer(item.key, value)}
                    >
                      {label}
                    </Button>
                  ))}
                  {item.key === 'smoke' || item.key === 'sleep' || item.key === 'energy' ? (
                    <input
                      className="border rounded px-2 text-sm min-h-[44px]"
                      placeholder="details"
                      aria-label={`${item.q} details`}
                      onBlur={(e) =>
                        handleAnswer(item.key, e.target.value || answers[item.key] || '')
                      }
                    />
                  ) : null}
                </div>
              </div>
            ))}
            <Button
              className="mt-4 w-full min-h-[44px]"
              onClick={proceedToPathfinder}
              disabled={Object.keys(answers).length < 5}
            >
              {t('assessContinue', { defaultValue: 'Continue' })}
            </Button>
            <div className="text-xs text-muted-foreground">
              {t('assessDisclaimer', {
                defaultValue:
                  'Educational screening only — not medical advice. Emergency symptoms: seek urgent care if available.',
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'pathfinder' && (
        <Card className="border-emerald-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" aria-hidden />
              {t('assessPathfinderTitle', { defaultValue: 'Pathfinder — care access' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('assessPathfinderBody', {
                defaultValue:
                  'Many members train in villages, rural areas, or places without a regular doctor.',
              })}
            </p>
            <p className="text-sm font-medium">
              {t('assessPathfinderQuestion', {
                defaultValue: 'Can you reach a doctor or nurse regularly?',
              })}
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start min-h-[44px]" onClick={() => submitAssessment('regular')}>
                {t('assessAccessRegular', { defaultValue: 'Yes — I can usually see a clinician' })}
              </Button>
              <Button variant="outline" className="justify-start min-h-[44px]" onClick={() => submitAssessment('limited')}>
                {t('assessAccessLimited', {
                  defaultValue: 'Sometimes — clinics are far or appointments are rare',
                })}
              </Button>
              <Button
                variant="default"
                className="justify-start min-h-[44px] bg-emerald-600 hover:bg-emerald-700"
                onClick={() => submitAssessment('none')}
              >
                {t('assessAccessNone', {
                  defaultValue: 'No — I cannot reach a doctor easily (Pathfinder track)',
                })}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep('questions')}>
              {t('assessBackQuestions', { defaultValue: 'Back to questions' })}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('stagePrompts', { defaultValue: 'Stage of Change + Coaching Prompts' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {stages.map((s, i) => (
              <Button
                key={i}
                size="sm"
                variant={selectedStage === i ? 'default' : 'outline'}
                onClick={() => setSelectedStage(i)}
              >
                {s.name.split('(')[0].trim()}
              </Button>
            ))}
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="font-medium text-emerald-400">
              {t('coachFocus', { defaultValue: 'Coach Focus' })}: {stages[selectedStage].focus}
            </div>
            <ul className="list-disc pl-5 mt-1 text-white/80">
              {stages[selectedStage].qs.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {step === 'result' && result && (
        <Card
          className={`border-2 ${result.risk === 'high' ? 'border-red-500' : result.risk === 'moderate' ? 'border-yellow-500' : 'border-emerald-500'}`}
        >
          <CardHeader>
            <CardTitle>
              {t('assessResultTitle', { defaultValue: 'Assessment Result' })}:{' '}
              <span className="uppercase">
                {result.risk === 'high'
                  ? t('riskHigh', { defaultValue: 'High risk' })
                  : result.risk === 'moderate'
                    ? t('riskModerate', { defaultValue: 'Moderate risk' })
                    : t('riskLow', { defaultValue: 'Low risk' })}
              </span>
              {result.pathfinderTrack ? (
                <span className="ml-2 inline-flex items-center gap-1 text-sm font-normal text-emerald-400">
                  <Compass className="h-4 w-4" aria-hidden />
                  {t('assessPathfinderBadge', { defaultValue: 'Pathfinder track' })}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{result.notes}</p>
            {result.programGate === 'low-impact-only' ? (
              <p className="text-xs text-amber-400/90">
                {t('assessLowImpactNote', {
                  defaultValue: 'Low-impact programs only until you can seek medical clearance.',
                })}
              </p>
            ) : null}
            <div>
              <div className="font-semibold mb-2">
                {t('assessRecsLabel', { defaultValue: 'Recommendations (click to start):' })}
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleRecommendations.map((r, i) => (
                  <Button key={i} size="sm" variant="outline" className="min-h-[44px]" onClick={() => startRecommended(r)}>
                    {t('assessStartPrefix', { defaultValue: 'Start' })}: {r.length > 45 ? `${r.slice(0, 42)}...` : r} →
                  </Button>
                ))}
              </div>
            </div>
            {result.pathfinderTrack ? (
              <Button variant="secondary" className="min-h-[44px]" onClick={printHealthCard}>
                {t('assessVillageCard', { defaultValue: 'Print Village Health Card' })}
              </Button>
            ) : null}
            <Button
              onClick={() => {
                setResult(null);
                setAnswers({});
                setStep('questions');
              }}
            >
              {t('assessRetake', { defaultValue: 'Retake Assessment' })}
            </Button>
            <Button onClick={() => { window.location.href = '/log'; }} variant="outline" className="mt-2 min-h-[44px]">
              {t('assessGoToday', { defaultValue: 'Go to Today Hub for all free starters' })}
            </Button>
          </CardContent>
        </Card>
      )}

      <SignInPrompt
        className="mt-6"
        nextPath="/assessments"
        description="Keep assessment history synced when you sign in."
      />
    </div>
  );
}
