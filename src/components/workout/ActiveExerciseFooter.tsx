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
import {
  SET_SIDES,
  setSideDefaultLabel,
  setSideLabelKey,
} from '@/lib/workout/unilateral';
import { cn } from '@/lib/utils';
import type { SetKind, SetSide } from '@/types';

type Props = {
  isCompact: boolean;
  holdsActiveSet: boolean;
  restSec: number;
  activeSetKind: SetKind;
  onSetKindChange: (kind: SetKind) => void;
  offerSetSide?: boolean;
  activeSetSide?: SetSide;
  onSetSideChange?: (side: SetSide | undefined) => void;
  onAddSet: () => void;
  /** After a working set — start a drop of that set (existing `kind: 'drop'`). */
  canStartDrop: boolean;
  onStartDrop: () => void;
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
  offerSetSide = false,
  activeSetSide,
  onSetSideChange,
  onAddSet,
  canStartDrop,
  onStartDrop,
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
      <Button variant="outline" size="sm" className="min-h-[44px] tap-target" onClick={onAddSet}>
        <Plus className="h-3 w-3 me-1" /> {t('activeAddSet', { defaultValue: 'Add Set' })}
      </Button>
      {canStartDrop ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px] tap-target"
          onClick={onStartDrop}
          data-testid="start-drop-set"
          aria-label={t('activeSetDropTip', {
            defaultValue: 'Drop set — lighter follow-up; not a PR attempt',
          })}
        >
          {t('activeSetDrop', { defaultValue: 'Drop' })}
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0 tap-target"
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
      {!isCompact && holdsActiveSet && offerSetSide && onSetSideChange && (
        <div
          className="flex flex-wrap items-center gap-1"
          data-testid="desktop-set-side"
          role="group"
          aria-label={t('activeSetSideAria', { defaultValue: 'Set side' })}
        >
          {SET_SIDES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={activeSetSide === s}
              onClick={() => onSetSideChange(activeSetSide === s ? undefined : s)}
              className={cn(
                'min-h-[44px] border-2 px-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors tap-target',
                activeSetSide === s
                  ? 'border-border bg-muted text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {t(setSideLabelKey(s), { defaultValue: setSideDefaultLabel(s) })}
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
