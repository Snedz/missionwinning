'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCoachPlan } from '@/hooks/useCoachPlan';
import { useWorkoutStore } from '@/store/workoutStore';
import { track } from '@/lib/analytics';

export function CoachTodayCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { plan, todaySession, todayOffset, loading, generate } = useCoachPlan();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  if (loading) return null;

  const startToday = () => {
    if (!todaySession || todaySession.status === 'done') return;
    const exercises = todaySession.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.weight })),
    }));
    startWorkout(todaySession.name, exercises);
    track('coach_session_started', { kind: todaySession.kind, from: 'home' });
    router.push('/active');
  };

  return (
    <Card className="content-card border-emerald-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="eyebrow text-[10px]">
            {t('coachTodayMission', { defaultValue: "Today's mission" })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!plan && (
          <>
            <p className="text-sm text-muted-foreground">
              {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
            </p>
            <Button variant="fitness" size="sm" onClick={() => generate()}>
              {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
            </Button>
          </>
        )}
        {plan && !todaySession && (
          <p className="text-sm text-muted-foreground">
            {t('coachNoSessionToday', {
              defaultValue: 'Rest or recovery day — light movement still counts.',
            })}
          </p>
        )}
        {plan && todaySession && (
          <>
            <p className="font-medium">{todaySession.name}</p>
            {todaySession.status !== 'done' && (
              <Button variant="fitness" size="sm" className="w-full" onClick={startToday}>
                {t('coachStartSession', { defaultValue: 'Start this session' })}
              </Button>
            )}
            {todaySession.status === 'done' && (
              <p className="text-sm text-amber-400">
                {t('coachSessionDone', { defaultValue: 'Done' })} ✓
              </p>
            )}
          </>
        )}
        <Link
          href="/coach"
          className="text-xs text-emerald-400 hover:underline block text-center"
        >
          {t('coachViewPlan', { defaultValue: 'View full week' })} →
        </Link>
      </CardContent>
    </Card>
  );
}
