'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useWorkoutStore } from '@/store/workoutStore';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';
import { toast } from '@/hooks/use-toast';
import { bumpTrainingStreak } from '@/lib/streaks';
import { isFreeBeta } from '@/lib/freeBeta';

type LastAssessment = {
  risk: string;
  date: string;
  notes: string;
};

function getLastAssessment(): LastAssessment | null {
  return readJson<LastAssessment | null>(STORAGE_KEYS.lastAssessment, null);
}

export function ProfileAssessmentCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const lastAssessment = getLastAssessment();
  const freeBeta = isFreeBeta();

  const launchFromAssessment = (risk: string) => {
    let name = 'Daily Mobility + Mind Habit';
    let exs = [
      { exerciseId: 'cat-camel', sets: [{ reps: 8, weight: 0 }] },
      { exerciseId: 'bird-dog', sets: [{ reps: 6, weight: 0 }] },
      { exerciseId: 'glute-bridge', sets: [{ reps: 10, weight: 0 }] },
      { exerciseId: 'couch-stretch', sets: [{ reps: 45, weight: 0 }] },
    ];
    if (risk === 'low') {
      name = 'Full Body Habit Builder';
      exs = [
        { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] },
        { exerciseId: 'squats', sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: 'glute-bridge', sets: [{ reps: 12, weight: 0 }] },
        { exerciseId: 'plank', sets: [{ reps: 25, weight: 0 }] },
      ];
    } else if (risk === 'moderate') {
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
    router.push('/active');
  };

  return (
    <div className="house-card space-y-3 text-sm" data-testid="account-assessment-card">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        {t('profileAssessmentTitle', { defaultValue: 'Readiness assessment' })}
      </h3>
        {lastAssessment ? (
          <>
            <div>
              <span className="font-medium">{t('profileAssessmentLast', { defaultValue: 'Last result:' })}</span>{' '}
              <span className="uppercase font-semibold">{lastAssessment.risk}</span> {t('profileAssessmentRisk', { defaultValue: 'risk' })}
              <span className="text-xs text-muted-foreground ml-2">({lastAssessment.date})</span>
            </div>
            <div className="text-muted-foreground">{lastAssessment.notes}</div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                className="min-h-[44px] tap-target"
                variant="outline"
                onClick={() => router.push('/assessments')}
              >
                {t('retake', { defaultValue: 'Retake Assessment' })}
              </Button>
              <Button
                size="sm"
                className="min-h-[44px] tap-target"
                onClick={() => launchFromAssessment(lastAssessment.risk)}
              >
                {t('profileStartStarter', {
                  risk: lastAssessment.risk, defaultValue: `Start starter (${lastAssessment.risk} risk)` })}
              </Button>
              <Button
                size="sm"
                className="min-h-[44px] tap-target"
                variant="ghost"
                onClick={() => {
                  const streak = bumpTrainingStreak();
                  toast({
                    title: t('todayFounderWinLogged', { defaultValue: 'Win logged' }),
                    description: t('todayFounderStreakOnly', {
                      streak,
                      defaultValue: `Streak ${streak}.`,
                    }),
                  });
                }}
              >
                {t('profileLogAssessmentWin', { defaultValue: 'Log assessment win' })}
              </Button>
            </div>
          </>
        ) : (
          <div>
            {t('todayAssessmentNone', { defaultValue: 'No assessment yet.' })}{' '}
            <Button
              size="sm"
              className="min-h-[44px] tap-target"
              variant="outline"
              onClick={() => router.push('/assessments')}
            >
              {t('takeAssessment', { defaultValue: 'Take the free Readiness Assessment' })}
            </Button>
            <div className="text-xs mt-1 text-muted-foreground">
              {t('profileAssessmentHint', {
                defaultValue: 'Short screen + stage of change. Guides free starters.',
              })}
            </div>
          </div>
        )}
        <div className="text-[10px] text-muted-foreground">
          {freeBeta
            ? t('profileAssessmentFootOpenBeta', {
                defaultValue:
                  'Core free forever. Alpha unlocks history depth and deeper coaching tools.',
              })
            : t('profileAssessmentFoot', {
                defaultValue: 'Core free forever. Premium adds history and deeper coaching.',
              })}
        </div>
    </div>
  );
}
