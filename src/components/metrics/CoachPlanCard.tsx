'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePremium } from '@/hooks/usePremium';
import { useWorkoutStore } from '@/store/workoutStore';
import { UnlockButton } from '@/components/UnlockButton';
import { track } from '@/lib/analytics';
import type { CoachPlanDay } from '@/lib/coachPlan';

type CoachPlanCardProps = {
  readiness: number;
  strain: number;
  recovery: number;
  goal?: string;
  equipment?: string;
};

export function CoachPlanCard({
  readiness,
  strain,
  recovery,
  goal,
  equipment,
}: CoachPlanCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { premium } = usePremium();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<{ summary: string; days: CoachPlanDay[] } | null>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/coach/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ readiness, strain, recovery, goal, equipment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not generate plan');
      }
      const data = await res.json();
      setPlan(data);
      track('coach_plan_generated', { deload: strain >= 70 || recovery < 40 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDay = (day: CoachPlanDay) => {
    startWorkout(day.workoutName, day.exercises);
    track('coach_plan_loaded', { day: day.day });
    router.push('/active');
  };

  if (!premium) {
    return (
      <Card className="content-card border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            {t('coachPlanTitle', { defaultValue: 'AI Coach — weekly plan' })}
          </CardTitle>
          <CardDescription>
            {t('coachPlanPremiumDesc', {
              defaultValue: 'Premium generates a fatigue-aware week you can load into the logger.',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnlockButton productId="super-bundle" price="59" title="Super Bundle" isSubscription />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="content-card border-emerald-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          {t('coachPlanTitle', { defaultValue: 'AI Coach — weekly plan' })}
        </CardTitle>
        <CardDescription>
          {t('coachPlanDesc', {
            defaultValue: 'Three sessions tuned to readiness, strain, and your equipment.',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!plan && (
          <Button variant="fitness" size="sm" onClick={generate} disabled={loading}>
            {loading
              ? t('coachPlanGenerating', { defaultValue: 'Building your week…' })
              : t('coachPlanCta', { defaultValue: 'Generate this week' })}
          </Button>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
        {plan && (
          <>
            <p className="text-sm text-muted-foreground">{plan.summary}</p>
            <div className="space-y-2">
              {plan.days.map((day) => (
                <div
                  key={day.day}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{day.day}</span> — {day.workoutName}
                    <div className="text-xs text-muted-foreground">{day.focus}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => loadDay(day)}>
                    {t('coachPlanLoad', { defaultValue: 'Load' })}
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPlan(null)}>
              {t('coachPlanRegenerate', { defaultValue: 'Regenerate' })}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
