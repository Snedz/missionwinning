'use client';
/**
 * Page: /coach — Mission Coach weekly plan
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Sparkles } from 'lucide-react';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { ScreenDock } from '@/components/layout/ScreenDock';
import { CoachPlanSessionGrid } from '@/components/coach/CoachPlanSessionGrid';
import { AdjustSessionSheet } from '@/components/coach/AdjustSessionSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { CoachPlanSkeleton } from '@/components/ui/Skeleton';
import { useCoachPlan } from '@/hooks/useCoachPlan';
import { ParqIntakeCard } from '@/components/coach/ParqIntakeCard';
import { isFreeBeta } from '@/lib/freeBeta';

type CoachPageProps = {
  /** From /coach?ask=<exerciseId> — leftover chat unmounted (`.1062`). */
  askExerciseId?: string;
};

export function CoachPage(_props: CoachPageProps = {}) {
  const { t } = useTranslation();
  const {
    plan,
    loading,
    locked,
    todayOffset,
    ctx,
    generate,
    needsParq,
    refreshParq,
    adjustToday,
    swapSessionExercise,
  } = useCoachPlan();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const freeBeta = isFreeBeta();
  const weekEyebrow = t('coachWeekEyebrow', { defaultValue: 'This week' });
  const showGenerate = !loading && !needsParq && (!plan || (locked && freeBeta));
  const showWeek = !loading && !!plan && !(locked && freeBeta);

  return (
    <PillarPageShell
      className="house-plan max-w-2xl pb-24"
      icon={Sparkles}
      eyebrow={weekEyebrow}
      title={t('coachPageTitle', { defaultValue: 'Mission Coach' })}
      subtitle={t('coachPageSubtitle', {
        defaultValue:
          'Weekly plans from your workout logs alone — no wearable. Adapts when you miss or crush a session.',
      })}
    >
      {loading && <CoachPlanSkeleton className="py-2" />}

      {!loading && needsParq && (
        <ParqIntakeCard
          onDone={() => {
            refreshParq();
            generate();
          }}
        />
      )}

      {showGenerate && (
        <>
          <EmptyState
            className="house-empty"
            icon={Sparkles}
            title={t('coachGenerateEmptyTitle', { defaultValue: 'No plan this week' })}
            description={t('coachGenerateEmptyDesc', {
              defaultValue: freeBeta
                ? 'One week from your logs. Free every week — no wearable.'
                : 'One week from your logs. Free every week; Bundle adds chat and regenerate.',
            })}
          />
          <ScreenDock>
            <div className="house-generate-dock">
              <p className="house-kicker">{weekEyebrow}</p>
              <p className="house-lede">
                {t('coachGenerateEmptyDesc', {
                  defaultValue: freeBeta
                    ? 'One week from your logs. Free every week — no wearable.'
                    : 'One week from your logs. Free every week; Bundle adds chat and regenerate.',
                })}
              </p>
              <button
                type="button"
                onClick={() => generate()}
                className="house-btn house-btn-primary primary-action min-h-[52px] w-full tap-target"
                data-testid="coach-generate-dock"
              >
                <span className="flex-1 text-start">
                  {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
                </span>
                <ChevronRight className="ms-auto h-5 w-5 shrink-0" aria-hidden />
              </button>
            </div>
          </ScreenDock>
        </>
      )}

      {showWeek && plan && (
        <>
          <CoachPlanSessionGrid
            mode="sheet"
            sessions={plan.sessions}
            todayOffset={todayOffset}
            onAdjustToday={() => setAdjustOpen(true)}
            onSwapExercise={swapSessionExercise}
            rationaleHints={{
              loggedWorkoutCount: ctx.history.length,
              loadZone: ctx.loadZone ?? null,
            }}
          />
          <AdjustSessionSheet
            open={adjustOpen}
            onClose={() => setAdjustOpen(false)}
            onAdjust={(c) => {
              adjustToday(c);
            }}
          />
        </>
      )}
    </PillarPageShell>
  );
}
