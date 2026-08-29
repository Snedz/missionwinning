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
import { useTranslation } from 'react-i18next';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { useWorkoutStore } from '@/store/workoutStore';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import type { WorkoutExerciseTemplate } from '@/types';
import { persistParqScreen, scoreParqAnswers } from '@/lib/journey/parqIntake';
import { assessmentsEnFloor } from '@/i18n/assessmentsLocales';

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
      className="house-assess"
      icon={ClipboardList}
      eyebrow={t('toolkitEyebrow', { defaultValue: 'Toolkit' })}
      title={t('assessTitle', { defaultValue: 'Readiness Assessment' })}
      subtitle={t('assessSubtitleBrief', {
        defaultValue: 'Answer the screen. Stage prompts when you want them.',
      })}
      showLegalFooter
    >
      {/* Quiet leftover: form is the first-paint object. Stage prompts stay extra. */}
      {!result && (
        <div className="house-card space-y-4">
          <p className="font-semibold">
            {t('assessFormTitle', { defaultValue: 'Quick Health & Lifestyle Screen' })}
          </p>
          {questions.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="text-sm font-semibold">
                {t(`assessQ_${item.key}`, {
                  defaultValue: assessmentsEnFloor(`assessQ_${item.key}`),
                })}
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { opt: 'yes', label: t('assessYes', { defaultValue: 'Yes' }) },
                  { opt: 'no', label: t('assessNo', { defaultValue: 'No' }) },
                  { opt: 'unsure', label: t('assessUnsure', { defaultValue: 'Unsure' }) },
                ].map(({ opt, label }) => (
                  <button
                    key={opt}
                    type="button"
                    className={`house-state${answers[item.key] === opt ? ' is-on' : ''}`}
                    onClick={() => handleAnswer(item.key, opt)}
                  >
                    {label}
                  </button>
                ))}
                {item.key === 'smoke' || item.key === 'sleep' || item.key === 'energy' ? (
                  <input
                    className="px-2 text-sm min-h-[44px]"
                    placeholder={t('assessDetailsPlaceholder', { defaultValue: 'details' })}
                    onBlur={(e) =>
                      handleAnswer(item.key, e.target.value || answers[item.key] || '')
                    }
                  />
                ) : null}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="house-btn house-btn-primary primary-action mt-4 w-full min-h-[44px] tap-target"
            onClick={submitAssessment}
            disabled={Object.keys(answers).length < 5}
          >
            {t('submitAssessment', { defaultValue: 'Submit Assessment' })}
          </button>
          <p className="house-kicker">
            {t('assessDisclaimer', {
              defaultValue:
                'This is educational screening only — not medical advice. Always consult a doctor.',
            })}
          </p>
        </div>
      )}

      <details className="house-card group">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
          {t('assessMoreStage', { defaultValue: 'Stage of change & prompts' })}
        </summary>
        <div className="space-y-3 border-t-2 border-border p-4 text-sm">
          <p className="text-sm font-semibold text-foreground">
            {t('assessStageTitle', { defaultValue: 'Stage of Change + Coaching Prompts' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {stages.map((s, i) => (
              <button
                key={s.nameKey}
                type="button"
                className={`house-state${selectedStage === i ? ' is-on' : ''}`}
                onClick={() => setSelectedStage(i)}
              >
                {t(s.nameKey, { defaultValue: s.nameDefault })}
              </button>
            ))}
          </div>
          <div className="house-card" style={{ padding: 12 }}>
            <div className="font-semibold">
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
          <p className="house-kicker">
            {t('assessOarsNote', {
              defaultValue:
                'OARS in practice: Open questions, Affirm strengths, Reflect back, Summarize. Match approach to readiness.',
            })}
          </p>
        </div>
      </details>

      {result && (
        <div
          // Three ranks, one hue. High is the filled red poster the handoff
          // asks for; moderate keeps the red as an edge only; low is a plain
          // ruled card. Red/amber/green would have been a traffic light, and
          // this palette does not have one — nor should a PAR-Q result imply
          // "green means go" when the whole point is to send some people to a
          // doctor first.
          className={cn(
            'house-card space-y-4',
            result.riskLevel === 'high'
              ? 'border-primary bg-muted'
              : result.riskLevel === 'moderate'
                ? 'border-primary'
                : undefined
          )}
        >
          <p className="font-semibold">
            {t('assessResultTitle', { defaultValue: 'Assessment result' })}:{' '}
            {result.riskLevel === 'low'
              ? t('riskLow', { defaultValue: 'Low risk' })
              : result.riskLevel === 'moderate'
                ? t('riskModerate', { defaultValue: 'Moderate risk' })
                : t('riskHigh', { defaultValue: 'High risk' })}
          </p>
          <p>{result.notes}</p>
          <div>
            <div className="font-semibold mb-2">
              {t('assessRecommendations', {
                defaultValue: 'Recommendations — tap to start a free starter:',
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {result.recommendations.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  className="house-btn"
                  onClick={() => startRecommended(r)}
                >
                  {t('assessStartPrefix', { defaultValue: 'Start' })}:{' '}
                  {r.length > 45 ? `${r.slice(0, 42)}...` : r}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="house-btn"
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
          >
            {t('retake', { defaultValue: 'Retake Assessment' })}
          </button>
          <p className="house-kicker">
            {t('assessResultFoot', {
              defaultValue:
                'Results stay on this device. Use them to pick a starter on Today. Completing a workout is what earns a streak.',
            })}
          </p>
          <Link href="/log" className="house-btn house-btn-ghost">
            {t('assessGoToday', { defaultValue: 'Go to Today for free starters' })}
          </Link>
        </div>
      )}

      <SignInPrompt
        className="mt-2"
        nextPath="/assessments" description={t('assessSignInFoot', {
          defaultValue: 'Sign in to sync workouts. Assessment results stay on this device.',
        })}
      />
    </PillarPageShell>
  );
}
