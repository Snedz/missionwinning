'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { TrainingLoad } from '@/lib/fuelCoach/types';
import { trainingLoadLabel } from '@/lib/fuelDayAdapt';
import { cn } from '@/lib/utils';

type Props = {
  load: TrainingLoad;
  isAdapted: boolean;
  note?: string;
  deltaSummary?: string;
  adaptEnabled: boolean;
  onToggleAdapt: (on: boolean) => void;
};

/**
 * Shows train→fuel adjustment for today; toggle to use base targets only.
 */
export function FuelAdaptBanner({
  load,
  isAdapted,
  note,
  deltaSummary,
  adaptEnabled,
  onToggleAdapt,
}: Props) {
  const { t } = useTranslation();

  const loadText = (() => {
    switch (load) {
      case 'heavy':
        return t('fuelLoadHeavy', { defaultValue: 'Heavy' });
      case 'moderate':
        return t('fuelLoadModerate', { defaultValue: 'Training' });
      case 'light':
        return t('fuelLoadLight', { defaultValue: 'Recovery' });
      default:
        return t('fuelLoadRest', { defaultValue: 'Rest' });
    }
  })();

  return (
    <div
      className={cn(
        ' border px-3 py-2.5 space-y-1.5',
        adaptEnabled && isAdapted
          ? 'border-primary bg-muted'
          : 'border-border bg-card'
      )}
    >
      {/* Start-aligned until `sm`: end-aligning a short button on a phone parks it
          under the Fuel FAB's column, where it is 100% hidden at some scroll
          offset (tests/e2e/fuel-floating-action.spec.ts). */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            className={cn(
              ' px-2 py-0.5 text-[11px] font-medium border',
              load === 'heavy' || load === 'moderate'
                ? 'border-primary text-primary bg-muted'
                : 'border-border text-muted-foreground bg-card'
            )}
          >
            {t('fuelLoadChip', {
              load: loadText,
              defaultValue: `${loadText} day`,
            })}
          </span>
          {adaptEnabled && isAdapted && deltaSummary ? (
            <span className="text-xs tabular-nums text-muted-foreground">{deltaSummary}</span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-[44px] shrink-0 tap-target text-[11px]"
          onClick={() => onToggleAdapt(!adaptEnabled)}
        >
          {adaptEnabled
            ? t('fuelAdaptUseBase', { defaultValue: 'Use base' })
            : t('fuelAdaptUseTrain', { defaultValue: 'Match training' })}
        </Button>
      </div>
      {adaptEnabled && note ? (
        <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
      ) : !adaptEnabled ? (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('fuelAdaptOffHint', {
            defaultValue: 'Showing your saved base targets (no train-day adjustment).',
          })}
        </p>
      ) : load === 'rest' && isAdapted ? (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {note ??
            t('fuelAdaptRestDefault', {
              defaultValue: 'Rest day — slightly lower carbs vs your base.',
            })}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('fuelAdaptFromLogs', {
            defaultValue: 'Targets flex from today’s logged training volume.',
          })}
        </p>
      )}
      {/* keep load label helper used for a11y title */}
      <span className="sr-only">{trainingLoadLabel(load)}</span>
    </div>
  );
}
