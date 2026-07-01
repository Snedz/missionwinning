'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Compass, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listOfflinePlans, type OfflinePlanSession } from '@/lib/offlinePlanTemplates';
import { useWorkoutStore } from '@/store/workoutStore';
import { useConnectivity } from '@/components/connectivity/ConnectivityProvider';

export function OfflinePlansPanel() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const highlight = searchParams.get('offline');
  const { mode, online } = useConnectivity();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const plans = useMemo(() => listOfflinePlans(), []);

  const startSession = (session: OfflinePlanSession) => {
    startWorkout(
      session.workoutName,
      session.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets }))
    );
    window.location.href = '/active';
  };

  if (plans.length === 0) return null;

  return (
    <Card
      id="offline-plans"
      className={`content-card ${highlight ? 'ring-2 ring-emerald-500/50' : ''}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {!online || mode !== 'online' ? (
            <WifiOff className="h-4 w-4 text-slate-400" aria-hidden />
          ) : (
            <Compass className="h-4 w-4 text-emerald-400" aria-hidden />
          )}
          {t('offlinePlansTitle', { defaultValue: 'Offline plans — no signal needed' })}
        </CardTitle>
        <CardDescription>
          {t('offlinePlansDesc', {
            defaultValue:
              'Free 4-week templates cached on your device. Start any session without cloud coach or network.',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border border-border p-4 space-y-3">
            <div>
              <h4 className="font-semibold">{plan.name}</h4>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline">{plan.duration}</Badge>
                {plan.lowImpactOnly ? (
                  <Badge className="bg-amber-600/20 text-amber-200 border-amber-500/30">
                    {t('offlinePlanLowImpact', { defaultValue: 'Low impact' })}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {plan.sessions.map((session) => (
                <Button
                  key={`${plan.id}-${session.dayLabel}`}
                  variant="outline"
                  size="sm"
                  className="justify-start min-h-[44px]"
                  onClick={() => startSession(session)}
                >
                  {session.dayLabel}: {session.workoutName} →
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
