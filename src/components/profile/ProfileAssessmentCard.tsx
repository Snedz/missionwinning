'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/supabase';
import { useWorkoutStore } from '@/store/workoutStore';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';
import { toast } from '@/hooks/use-toast';

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
    <Card className="content-card">
      <CardHeader>
        <CardTitle>Readiness Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {lastAssessment ? (
          <>
            <div>
              <span className="font-medium">Last result:</span>{' '}
              <span className="uppercase font-semibold">{lastAssessment.risk}</span> risk
              <span className="text-xs text-muted-foreground ml-2">({lastAssessment.date})</span>
            </div>
            <div className="text-muted-foreground">{lastAssessment.notes}</div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => router.push('/assessments')}>
                {t('retake', { defaultValue: 'Retake Assessment' })}
              </Button>
              <Button size="sm" onClick={() => launchFromAssessment(lastAssessment.risk)}>
                Start recommended starter for {lastAssessment.risk} risk →
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  const u = await getUser();
                  const today = new Date().toISOString().split('T')[0];
                  if (u)
                    await (
                      await import('@/lib/supabase')
                    ).saveNutritionEntry({
                      date: today,
                      name: 'Assessment Win from Profile',
                      protein: 0,
                      cals: 0,
                    });
                  toast({ title: 'Win logged', description: '+1 streak.' });
                }}
              >
                Log assessment win (+cloud)
              </Button>
            </div>
          </>
        ) : (
          <div>
            No assessment yet.{' '}
            <Button size="sm" variant="outline" onClick={() => router.push('/assessments')}>
              {t('takeAssessment', { defaultValue: 'Take the free Readiness Assessment' })}
            </Button>
            <div className="text-xs mt-1 text-muted-foreground">
              ParQ-style screen + stage of change. Results guide safe free starters (always
              available).
            </div>
          </div>
        )}
        <div className="text-[10px] text-muted-foreground">
          Core free forever. Premium adds history, deeper coaching forms, and saved programs.
        </div>
      </CardContent>
    </Card>
  );
}
