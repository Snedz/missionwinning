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
import type { WorkoutExerciseTemplate } from '@/types';
import { persistParqScreen, scoreParqAnswers } from '@/lib/journey/parqIntake';

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

  /** English floors — shortKey used to be bare "stagePre" (never in locale packs). */
  const stages = [
    {
      nameKey: 'assessStagePreName',
      nameDefault: 'Pre-Contemplation (Not Ready)',
      focusKey: 'assessStagePreFocus',
      focusDefault: 'Build awareness without pressure. Evoke curiosity and values.',
      questions: [
        {
          key: 'assessStagePreQ1',
          defaultValue: 'What do you enjoy about your current habits?',
        },
        {
          key: 'assessStagePreQ2',
          defaultValue: 'How do you view your health or energy 5 years from now?',
        },
      ],
    },
    {
      nameKey: 'assessStageContName',
      nameDefault: 'Contemplation (Getting Ready)',
      focusKey: 'assessStageContFocus',
      focusDefault: 'Normalize ambivalence. Explore benefits and barriers.',
      questions: [
        {
          key: 'assessStageContQ1',
          defaultValue: 'What might be some benefits if you made this change?',
        },
        {
          key: 'assessStageContQ2',
          defaultValue: 'What feels hardest about starting?',
        },
      ],
    },
    {
      nameKey: 'assessStagePrepName',
      nameDefault: 'Preparation / Action',
      focusKey: 'assessStagePrepFocus',
      focusDefault: 'Strengthen confidence. Reinforce progress. Small wins + autonomy.',
      questions: [
        {
          key: 'assessStagePrepQ1',
          defaultValue: "What's one small step you could take this week?",
        },
        {
          key: 'assessStagePrepQ2',
          defaultValue: "What's been working best so far?",
        },
      ],
    },
    {
      nameKey: 'assessStageMaintName',
      nameDefault: 'Maintenance',
      focusKey: 'assessStageMaintFocus',
      focusDefault: 'Support autonomy, mastery, relapse prevention. New goals.',
      questions: [
        {
          key: 'assessStageMaintQ1',
          defaultValue: 'How do you maintain progress when life gets stressful?',
        },
        {
          key: 'assessStageMaintQ2',
          defaultValue: 'What new goals feel inspiring now?',
        },
      ],
    },
  ] as const;
  const [selectedStage, setSelectedStage] = useState(0);

  const handleAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const submitAssessment = () => {
    const { risk } = scoreParqAnswers(answers);
    let notes = t('assessRiskLowNotes', { defaultValue: 'Great baseline. Proceed with standard programs.' });
    let recs = [
      t('assessRecLow1', { defaultValue: 'Start with Beginner Full Body or Bodyweight program.' }),
      t('assessRecLow2', { defaultValue: 'Focus on consistent form.' }),
    ];

    if (risk === 'high') {
      notes = t('assessRiskHighNotes', {
        defaultValue:
          'Multiple flags detected. Strongly recommend medical clearance before intense training.',
      });
      recs = [
        t('assessRecHigh1', { defaultValue: 'Begin with Corrective & Mobility block.' }),
        t('assessRecHigh2', { defaultValue: 'Consult physician.' }),
        t('assessRecHigh3', { defaultValue: 'Use low-impact options and monitor symptoms.' }),
      ];
    } else if (risk === 'moderate') {
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

    setResult({ riskLevel: risk, notes, recommendations: recs });
    persistParqScreen({ risk, notes });
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
    <PillarPageShell
      icon={ClipboardList}
      eyebrow={t('toolkitEyebrow', { defaultValue: 'Toolkit' })}
      title={t('assessTitle', { defaultValue: 'Readiness Assessment' })}
      subtitle={t('assessSubtitleBrief', {
        defaultValue: 'Answer the screen. Stage prompts when you want them.',
      })}
      showLegalFooter
    >
      {/* Field manual: health form first; stage coaching under disclosure. */}
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
                    <Button
                      key={opt}
                      size="sm"
                      variant={answers[item.key] === opt ? 'selected' : 'outline'}
                      className="min-h-[44px] tap-target"
                      onClick={() => handleAnswer(item.key, opt)}
                    >
                      {label}
                    </Button>
                  ))}
                  {item.key === 'smoke' || item.key === 'sleep' || item.key === 'energy' ? (
                    <input
                      className="border-2 border-border rounded-none px-2 text-sm min-h-[44px]"
                      placeholder={t('assessDetailsPlaceholder', { defaultValue: 'details' })}
                      onBlur={(e) =>
                        handleAnswer(item.key, e.target.value || answers[item.key] || '')
                      }
                    />
                  ) : null}
                </div>
              </div>
            ))}
            <Button
              className="mt-4 w-full min-h-[44px] tap-target primary-action"
              onClick={submitAssessment}
              disabled={Object.keys(answers).length < 5}
            >
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

      <details className="group border-2 border-border bg-card">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
          {t('assessMoreStage', { defaultValue: 'Stage of change & prompts' })}
        </summary>
        <div className="space-y-3 border-t-2 border-border p-4 text-sm">
          <p className="text-sm font-semibold text-foreground">
            {t('assessStageTitle', { defaultValue: 'Stage of Change + Coaching Prompts' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {stages.map((s, i) => (
              <Button
                key={s.nameKey}
                size="sm"
                variant={selectedStage === i ? 'selected' : 'outline'}
                className="min-h-[44px] tap-target"
                onClick={() => setSelectedStage(i)}
              >
                {t(s.nameKey, { defaultValue: s.nameDefault })}
              </Button>
            ))}
          </div>
          <div className="rounded-none border-2 border-border bg-card p-3">
            <div className="font-semibold text-primary">
              {t('assessCoachFocus', { defaultValue: 'Coach Focus:' })}{' '}
              {t(stages[selectedStage].focusKey, {
                defaultValue: stages[selectedStage].focusDefault,
              })}
            </div>
            <ul className="list-disc pl-5 mt-1 text-muted-foreground">
              {stages[selectedStage].questions.map((q) => (
                <li key={q.key}>{t(q.key, { defaultValue: q.defaultValue })}</li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-muted-foreground">
            {t('assessOarsNote', {
              defaultValue:
                'OARS in practice: Open questions, Affirm strengths, Reflect back, Summarize. Match approach to readiness.',
            })}
          </div>
        </div>
      </details>

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
              ? 'border-primary bg-muted'
              : result.riskLevel === 'moderate'
                ? 'border-primary'
                : 'border-border'
          )}
        >
          <CardHeader>
            <CardTitle>
              {t('assessResultTitle', { defaultValue: 'Assessment result' })}:{' '}
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
                  defaultValue: 'Recommendations — tap to start a free starter:',
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {result.recommendations.map((r, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    className="min-h-[44px] tap-target"
                    onClick={() => startRecommended(r)}
                  >
                    {t('assessStartPrefix', { defaultValue: 'Start' })}:{' '}
                    {r.length > 45 ? `${r.slice(0, 42)}...` : r}
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
                  'Results saved locally + to logs. Use to guide program choice in the Builder / Today. Streak +1 on start.',
              })}
            </div>
            <Button variant="outline" className="mt-2" asChild>
              <Link href="/log">{t('assessGoToday', { defaultValue: 'Go to Today for free starters' })}</Link>
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
