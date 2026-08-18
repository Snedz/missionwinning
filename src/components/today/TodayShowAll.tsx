'use client';

/**
 * Lean house door. First paint stays date + pins + sentence + Start.
 * Coach week and First Steps live here — not on HomeTodayLean, not as a tour.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { TodayCoachWeekStrip } from '@/components/coach/TodayCoachWeekStrip';
import { FirstStepsSheet } from '@/components/journey/FirstStepsSheet';
import { MeterBar } from '@/components/ui/MeterBar';
import { getFirstSteps, summarizeFirstSteps } from '@/lib/journey/firstSteps';
import { syncJourneyPhase } from '@/lib/missionJourney';
import { useWorkoutStore } from '@/store/workoutStore';

export function TodayShowAll() {
  const { t } = useTranslation();
  const completedSessions = useWorkoutStore((s) => s.workoutHistory.length);
  const [firstSteps, setFirstSteps] = useState<ReturnType<typeof getFirstSteps>>([]);
  const [stepsOpen, setStepsOpen] = useState(false);

  useEffect(() => {
    try {
      setFirstSteps(getFirstSteps(syncJourneyPhase(), { completedSessions }));
    } catch {
      setFirstSteps([]);
    }
  }, [completedSessions]);

  const stepProgress = useMemo(() => summarizeFirstSteps(firstSteps), [firstSteps]);
  const showFirstSteps = !stepProgress.complete && stepProgress.total > 0;

  return (
    <details className="group border-2 border-border bg-card">
      <summary
        className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
        data-testid="today-show-all"
      >
        {t('todayShowAll', { defaultValue: 'Show all' })}
      </summary>
      <div className="space-y-4 border-t-2 border-border p-4">
        <TodayCoachWeekStrip />
        {showFirstSteps ? (
          <div className="border-2 border-border">
            <button
              type="button"
              onClick={() => setStepsOpen(true)}
              className="flex min-h-[44px] w-full items-center gap-3 px-3 py-3 text-left"
              data-testid="today-show-all-first-steps"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  {t('firstStepsEyebrow', { defaultValue: 'Your first steps' })}
                </p>
                <p className="mt-0.5 truncate text-[15px] font-semibold leading-snug">
                  {stepProgress.next
                    ? t(stepProgress.next.titleKey, { defaultValue: stepProgress.next.title })
                    : t('firstStepsEyebrow', { defaultValue: 'Your first steps' })}
                </p>
                <div className="mt-2">
                  <MeterBar
                    label={t('firstStepsProgressLabel', { defaultValue: 'Progress' })}
                    value={stepProgress.done}
                    max={stepProgress.total}
                    segments={stepProgress.total}
                    size="sm"
                    readout={`${stepProgress.done} / ${stepProgress.total}`}
                  />
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            </button>
            <FirstStepsSheet
              open={stepsOpen}
              onClose={() => setStepsOpen(false)}
              steps={firstSteps}
              progress={stepProgress}
            />
          </div>
        ) : null}
      </div>
    </details>
  );
}
