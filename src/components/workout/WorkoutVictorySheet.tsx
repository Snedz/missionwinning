'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { WorkoutVictorySummary } from '@/lib/workout/workoutVictory';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { VictoryStatsStrip } from '@/components/workout/VictoryStatsStrip';
import { VictoryNextActionStrip } from '@/components/workout/VictoryNextActionStrip';
import type { Debrief } from '@/lib/coach/debrief';

type Props = {
  open: boolean;
  summary: WorkoutVictorySummary | null;
  onOpenChange: (open: boolean) => void;
  onViewToday: () => void;
  onViewHistory?: () => void;
  debrief?: Debrief | null;
  fragments?: string[];
  workoutId?: string;
  onRunFieldTestAgain?: () => void;
};

/** D2 Victory ritual — title + stats + one next. Leftover hops stay off the overlay. */
export function WorkoutVictorySheet({
  open,
  summary,
  onOpenChange,
  onViewToday,
}: Props) {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);

  if (!summary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="victory-lock sm:max-w-md md:max-w-lg xl:max-w-xl flex flex-col border-2 border-border bg-card max-h-[90dvh] overflow-hidden p-0">
        <div data-testid="victory-scroll" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          <DialogHeader className="text-center space-y-3 victory-reveal">
            <DialogTitle className="font-display text-2xl font-extrabold tracking-[-0.015em]">
              {t('victoryTitle', { defaultValue: 'Session locked' })}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {summary.workoutName}
            </DialogDescription>
          </DialogHeader>

          <VictoryStatsStrip
            totalVolume={summary.totalVolume}
            workingReps={summary.workingReps}
            setCount={summary.setCount}
            durationSeconds={summary.durationSeconds}
            unitLabel={unitLabel}
            formatVolume={(n) => fmt.num(n)}
            vsLast={summary.receipt?.vsLast ?? null}
          />
        </div>

        <div
          data-testid="victory-next-dock"
          className="shrink-0 border-t-2 border-border bg-card px-6 pb-6 pt-3"
        >
          {summary.nextAction ? (
            <VictoryNextActionStrip
              nextAction={summary.nextAction}
              onNavigate={() => onOpenChange(false)}
            />
          ) : (
            <Button variant="outline" className="w-full min-h-[44px] tap-target" onClick={onViewToday}>
              {t('victoryBackToday', { defaultValue: 'Back to Today' })}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
