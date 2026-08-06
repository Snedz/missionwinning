'use client';

/**
 * Footer actions for ActiveExerciseCard — Add Set, Rest, desktop set kinds,
 * Set options menu. Keeps the card header/sets focused (.425).
 */

import { useTranslation } from 'react-i18next';
import { Plus, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActiveSetOptionsMenu } from '@/components/workout/ActiveSetOptionsMenu';
import { shouldShowSetOptionsFooter } from '@/lib/workout/activeWorkoutHelpers';
import { SET_KINDS, setKindDefaultLabel, setKindLabelKey } from '@/lib/workout/setKind';
import { cn } from '@/lib/utils';
import type { SetKind } from '@/types';

type Props = {
  isCompact: boolean;
  holdsActiveSet: boolean;
  restSec: number;
  activeSetKind: SetKind;
  onSetKindChange: (kind: SetKind) => void;
  onAddSet: () => void;
  onStartRest: (seconds: number) => void;
  footerOpen: boolean;
  onFooterOpenChange: (open: boolean) => void;
  hasLastSets: boolean;
  hasPlanned: boolean;
  plannedSetCount: number;
  onApplyAllTargets: () => void;
  onRemoveSet: () => void;
};

export function ActiveExerciseFooter({
  isCompact,
  holdsActiveSet,
  restSec,
  activeSetKind,
  onSetKindChange,
  onAddSet,
  onStartRest,
  footerOpen,
  onFooterOpenChange,
  hasLastSets,
  hasPlanned,
  plannedSetCount,
  onApplyAllTargets,
  onRemoveSet,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-nowrap items-center gap-2 pt-1">
      <Button variant="outline" size="sm" className="min-h-[44px]" onClick={onAddSet}>
        <Plus className="h-3 w-3 me-1" /> {t('activeAddSet', { defaultValue: 'Add Set' })}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0"
        aria-label={t('activeStartRest', { seconds: restSec, defaultValue: `${restSec}s Rest` })}
        onClick={() => onStartRest(restSec)}
      >
        <Timer className="h-4 w-4" />
      </Button>
      {/*
        Set kind on desktop. It lives in `LogConsole` on compact, and the
        console does not render at md+ — so without this, a desktop user
        cannot mark a warm-up or a drop set at all.
      */}
      {!isCompact && holdsActiveSet && (
        <div className="flex flex-wrap items-center gap-1">
          {SET_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={activeSetKind === k}
              onClick={() => onSetKindChange(k)}
              className={cn(
                'min-h-[44px] border-2 px-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors tap-target',
                activeSetKind === k
                  ? 'border-[hsl(var(--accent-poster))] bg-muted text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {t(setKindLabelKey(k), {
                defaultValue: k === 'normal' ? 'Work' : setKindDefaultLabel(k),
              })}
            </button>
          ))}
        </div>
      )}
      {shouldShowSetOptionsFooter({
        hasLastSets,
        hasPlanned,
        plannedSetCount,
      }) && (
        <ActiveSetOptionsMenu
          open={footerOpen}
          onOpenChange={onFooterOpenChange}
          hasLastSets={hasLastSets}
          hasPlanned={hasPlanned}
          plannedSetCount={plannedSetCount}
          onApplyAllTargets={onApplyAllTargets}
          onRemoveSet={onRemoveSet}
        />
      )}
    </div>
  );
}
