'use client';
/**
 * Page: /assessments — self assessments
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { useWorkoutStore } from '@/store/workoutStore';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { saveNutritionEntry } from '@/lib/supabase';
import type { WorkoutExerciseTemplate } from '@/types';
import { writeJson } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { localDateKey } from '@/lib/time/localDate';

interface AssessmentResult {
  riskLevel: 'low' | 'moderate' | 'high';
  notes: string;
  recommendations: string[];
}

export function AssessmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const questions = [
    { key: 'chest_pain' },
    { key: 'shortness_breath' },
    { key: 'fainting' },
    { key: 'hospital' },
    { key: 'ortho' },
    { key: 'heart' },
    { key: 'no_exercise' },
    { key: 'smoke' },
    { key: 'sleep' },
    { key: 'energy' },
    { key: 'high_bp' },
    { key: 'bone_joint' },
    { key: 'family_heart' },
    { key: 'smoking_detail' },
    { key: 'pain_history' },
    { key: 'meds' },
    { key: 'allergies' },
    { key: 'lifestyle' },
  ] as const;

  const stages = [
    {
      shortKey: 'stagePre',
      focusKey: 'assessStagePreFocus',
      questionKeys: ['assessStagePreQ1', 'assessStagePreQ2'] as const,
    },
    {
      shortKey: 'stageCont',
      focusKey: 'assessStageContFocus',
      questionKeys: ['assessStageContQ1', 'assessStageContQ2'] as const,
    },
    {
      shortKey: 'stagePrep',
      focusKey: 'assessStagePrepFocus',
      questionKeys: ['assessStagePrepQ1', 'assessStagePrepQ2'] as const,
    },
    {
      shortKey: 'stageMaint',
      focusKey: 'assessStageMaintFocus',
      questionKeys: ['assessStageMaintQ1', 'assessStageMaintQ2'] as const,
    },
  ] as const;
  const [selectedStage, setSelectedStage] = useState(0);

  const handleAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const submitAssessment = () => {
    const yesFlags = Object.values(answers).filter(v => v.toLowerCase().includes('yes') || v.toLowerCase().includes('low')).length;
    let risk: 'low' | 'moderate' | 'high' = 'low';
    let notes = t('assessRiskLowNotes', { defaultValue: 'Great baseline. Proceed with standard programs.' });
    let recs = [
      t('assessRecLow1', { defaultValue: 'Start with Beginner Full Body or Bodyweight program.' }),
      t('assessRecLow2', { defaultValue: 'Focus on consistent form.' }),
    ];

    if (yesFlags >= 3) {
      risk = 'high';
      notes = t('assessRiskHighNotes', {
        defaultValue:
          'Multiple flags detected. Strongly recommend medical clearance before intense training.',
      });
      recs = [
        t('assessRecHigh1', { defaultValue: 'Begin with Corrective & Mobility block.' }),
        t('assessRecHigh2', { defaultValue: 'Consult physician.' }),
        t('assessRecHigh3', { defaultValue: 'Use low-impact options and monitor symptoms.' }),
      ];
    } else if (yesFlags >= 1) {
      risk = 'moderate';
      notes = t('assessRiskModerateNotes', {
        defaultValue: 'Some caution advised. Consider starting with corrective work.',
      });
      recs = [
        t('assessRecModerate1', {
          defaultValue: 'Prioritize the Corrective Exercise Specialist templates.',
        }),
        t('assessRecModerate2', { defaultValue: 'Build with Bodyweight & Dumbbell Starter first.' }),
      ];
    }

    const res: AssessmentResult = { riskLevel: risk, notes, recommendations: recs };
    setResult(res);

    // Save a note to nutrition logs as demo assessment record (or extend table later)
    const today = localDateKey();
    saveNutritionEntry({ date: today, name: `Assessment: ${risk} risk`, protein: 0, cals: 0 }).catch(() => {});

    // Persist last result for profile / history
    writeJson(STORAGE_KEYS.lastAssessment, { risk, notes, date: today });
  };

  /*
   * `.220` — `bumpStreak()` used to live here: a bare read-increment-write of
   * `mw_streak` with no date, no same-day guard and no recency, fired by an
   * ungated button on *starting* a recommended session.
   *
   * Three things wrong with it, and they compound. It counted taps rather than
   * days, so pressing the button five times added five. It credited a **training**
   * streak for a workout that had not happened yet — the `.206` class, where a
   * control touched for one reason quietly writes a value the athlete never
   * earned. And it wrote the override without the date `.217` made mandatory, so
   * the number it produced was displayed raw by `HomeTodayLean` for anyone with
   * no history at all.
   *
   * Nothing replaces it. Completing the workout is what earns the streak, and
   * `recordWorkoutCompleted` already records that from the history.
   */
  const startRecommended = (rec: string) => {
    let name = "Daily Mobility + Mind Habit";
    let exs: WorkoutExerciseTemplate[] = [
      { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
    ];
    if (rec.toLowerCase().includes('bodyweight') || rec.toLowerCase().includes('full body')) {
      name = "Full Body Habit Builder";
      exs = [
        { exerciseId: "push-ups", sets: [{ reps: 10, weight: 0 }] },
        { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: "glute-bridge", sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: "plank", sets: [{ reps: 25, weight: 0 }] },
        { exerciseId: "couch-stretch", sets: [{ reps: 45, weight: 0 }] },
      ];
    } else if (rec.toLowerCase().includes('mobility') || rec.toLowerCase().includes('corrective')) {
      name = "Daily Mobility Circuit (Free)";
      exs = [
        { exerciseId: "cat-camel", sets: [{ reps: 8, weight: 0 }] },
        { exerciseId: "bird-dog", sets: [{ reps: 6, weight: 0 }] },
        { exerciseId: "glute-bridge", sets: [{ reps: 10, weight: 0 }] },
        { exerciseId: "wall-sit", sets: [{ reps: 30, weight: 0 }] },
        { exerciseId: "superman", sets: [{ reps: 8, weight: 0 }] },
      ];
    } else if (rec.toLowerCase().includes('upper') || rec.toLowerCase().includes('bodyweight & dumbbell')) {
      name = "Bodyweight Strength Circuit";
      exs = [
        { exerciseId: "push-ups", sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: "squats", sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: "inverted-row", sets: [{ reps: 8, weight: 0 }] },
        { exerciseId: "lunges", sets: [{ reps: 10, weight: 0 }] },
        { exerciseId: "plank", sets: [{ reps: 30, weight: 0 }] },
      ];
    }
    startWorkout(name, exs);
    router.push('/active');
  };

  // Core assessment is FREE forever per vision.md (basic readiness, ParQ-style, stages of change).
  // Premium unlocks deeper saved history, cross-device, advanced coaching integration + full programs.
  // No paywall on the mission fundamentals.

  return (
    <PillarPageShell icon={ClipboardList} eyebrow={t('toolkitEyebrow', { defaultValue: 'Toolkit' })} title={t('assessTitle', { defaultValue: 'Readiness Assessment' })} subtitle={t('assessSubtitle', {
        defaultValue:
          'Free core tool. Based on standard health history and ParQ-style questions. Answer honestly for personalized guidance.',
      })}
      showLegalFooter
    >
      {!result && (
        <Card className="content-card">
          <CardHeader>
            <CardTitle>{t('assessFormTitle', { defaultValue: 'Quick Health & Lifestyle Screen' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((item) => (
              <div key={item.key} className="space-y-1">
                <div className="text-sm font-semibold">
                  {t(`assessQ_${item.key}`, { defaultValue: item.key })}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { opt: 'yes', label: t('assessYes', { defaultValue: 'Yes' }) },
                    { opt: 'no', label: t('assessNo', { defaultValue: 'No' }) },
                    { opt: 'unsure', label: t('assessUnsure', { defaultValue: 'Unsure' }) },
                  ].map(({ opt, label }) => (
                    <Button key={opt} size="sm" variant={answers[item.key] === opt ? 'selected' : 'outline'}
                      onClick={() => handleAnswer(item.key, opt)}
                    >
                      {label}
                    </Button>
                  ))}
                  {item.key === 'smoke' || item.key === 'sleep' || item.key === 'energy' ? (
                    <input
                      className="border border-border rounded-none px-2 text-sm" placeholder={t('assessDetailsPlaceholder', { defaultValue: 'details' })}
                      onBlur={(e) =>
                        handleAnswer(item.key, e.target.value || answers[item.key] || '')
                      }
                    />
                  ) : null}
                </div>
              </div>
            ))}
            <Button className="mt-4 w-full" onClick={submitAssessment} disabled={Object.keys(answers).length < 5}>
              {t('submitAssessment', { defaultValue: 'Submit Assessment' })}
            </Button>
            <div className="text-xs text-muted-foreground">
              {t('assessDisclaimer', {
                defaultValue:
                  'This is educational screening only — not medical advice. Always consult a doctor.',
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="content-card">
        <CardHeader>
          <CardTitle>{t('assessStageTitle', { defaultValue: 'Stage of Change + Coaching Prompts' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {stages.map((s, i) => (
              <Button key={s.shortKey} size="sm" variant={selectedStage === i ? 'selected' : 'outline'}
                onClick={() => setSelectedStage(i)}
              >
                {t(s.shortKey, { defaultValue: s.shortKey })}
              </Button>
            ))}
          </div>
          <div className="rounded-none border border-border bg-card p-3">
            <div className="font-semibold text-primary">
              {t('assessCoachFocus', { defaultValue: 'Coach Focus:' })}{' '}
              {t(stages[selectedStage].focusKey, { defaultValue: '' })}
            </div>
            <ul className="list-disc pl-5 mt-1 text-muted-foreground">
              {stages[selectedStage].questionKeys.map((qKey) => (
                <li key={qKey}>{t(qKey, { defaultValue: qKey })}</li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-muted-foreground">
            {t('assessOarsNote', {
              defaultValue:
                'OARS in practice: Open questions, Affirm strengths, Reflect back, Summarize. Match approach to readiness.',
            })}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card
          // Three ranks, one hue. High is the filled red poster the handoff
          // asks for; moderate keeps the red as an edge only; low is a plain
          // ruled card. Red/amber/green would have been a traffic light, and
          // this palette does not have one — nor should a PAR-Q result imply
          // "green means go" when the whole point is to send some people to a
          // doctor first.
          className={cn(
            'content-card border-2',
            result.riskLevel === 'high'
              ? 'border-primary bg-accent-100'
              : result.riskLevel === 'moderate'
                ? 'border-primary'
                : 'border-border'
          )}
        >
          <CardHeader>
            <CardTitle>
              {t('assessResultTitle', { defaultValue: 'Assessment Result' })}:{' '}
              <span className="uppercase">
                {result.riskLevel === 'low'
                  ? t('riskLow', { defaultValue: 'Low risk' })
                  : result.riskLevel === 'moderate'
                    ? t('riskModerate', { defaultValue: 'Moderate risk' })
                    : t('riskHigh', { defaultValue: 'High risk' })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{result.notes}</p>
            <div>
              <div className="font-semibold mb-2">
                {t('assessRecommendations', {
                  defaultValue:
                    'Recommendations (click to start a matching free starter + log win):',
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {result.recommendations.map((r, i) => (
                  <Button key={i} size="sm" variant="outline" onClick={() => startRecommended(r)}>
                    {t('assessStartPrefix', { defaultValue: 'Start' })}:{' '}
                    {r.length > 45 ? `${r.slice(0, 42)}...` : r} →
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
            >
              {t('retake', { defaultValue: 'Retake Assessment' })}
            </Button>
            <div className="text-xs">
              {t('assessResultFoot', {
                defaultValue:
                  'Results saved locally + to logs. Use to guide program choice in the Builder / Today hub. Streak +1 on start.',
              })}
            </div>
            <Button variant="outline" className="mt-2" asChild>
              <Link href="/log">{t('assessGoToday', { defaultValue: 'Go to Today Hub for all free starters' })}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <SignInPrompt
        className="mt-2"
        nextPath="/assessments" description={t('assessSignInFoot', {
          defaultValue: 'Keep assessment history synced when you sign in.',
        })}
      />
    </PillarPageShell>
  );
}
