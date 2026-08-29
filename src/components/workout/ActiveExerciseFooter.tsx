'use client';

/**
 * Footer actions for ActiveExerciseCard — Add Set, Rest, desktop set kinds,
 * Set options menu. Keeps the card header/sets focused (.425).
 */

import { useTranslation } from 'react-i18next';
import { Plus, Timer } from 'lucide-react';
import { ActiveSetOptionsMenu } from '@/components/workout/ActiveSetOptionsMenu';
import { ExerciseRestStrip } from '@/components/workout/ExerciseRestStrip';
import { restLaneFromKind, type RestLane } from '@/lib/workout/restTimer';
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
  workRestSec: number;
  warmupRestSec: number;
  onSetRestLane: (lane: RestLane, seconds: number) => void;
  activeSetKind: SetKind;
  onSetKindChange: (kind: SetKind) => void;
  offerSetSide?: boolean;
  activeSetSide?: SetSide;
  onSetSideChange?: (side: SetSide | undefined) => void;
  onAddSet: () => void;
  /** After a working set — start a drop of that set (existing `kind: 'drop'`). */
  canStartDrop: boolean;
  onStartDrop: () => void;
  onStartRest: (seconds: number, lane?: RestLane) => void;
  footerOpen: boolean;
  onFooterOpenChange: (open: boolean) => void;
  hasLastSets: boolean;
  hasPlanned: boolean;
  plannedSetCount: number;
  onApplyAllTargets: () => void;
  onRemoveSet: () => void;
  showAddWarmups?: boolean;
  onAddWarmups?: () => void;
};

export function ActiveExerciseFooter({
  isCompact,
  holdsActiveSet,
  restSec,
  workRestSec,
  warmupRestSec,
  onSetRestLane,
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
  showAddWarmups = false,
  onAddWarmups,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 pt-1">
      <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="house-btn min-h-[44px] tap-target"
        data-testid="active-add-set"
        onClick={onAddSet}
      >
        <Plus className="h-3 w-3 me-1" aria-hidden /> {t('activeAddSet', { defaultValue: 'Add Set' })}
      </button>
      {canStartDrop ? (
        <button
          type="button"
          className="house-btn min-h-[44px] tap-target"
          onClick={onStartDrop}
          data-testid="start-drop-set"
          aria-label={t('activeSetDropTip', {
            defaultValue: 'Drop set — lighter follow-up; not a PR attempt',
          })}
        >
          {t('activeSetDrop', { defaultValue: 'Drop' })}
        </button>
      ) : null}
      {showAddWarmups && onAddWarmups ? (
        <button
          type="button"
          className="house-btn min-h-[44px] tap-target"
          data-testid="active-add-warmups"
          onClick={onAddWarmups}
        >
          {t('activeAddWarmups', { defaultValue: 'Add warmups' })}
        </button>
      ) : null}
      <button
        type="button"
        className="house-btn house-btn-ghost min-h-[44px] min-w-[44px] shrink-0 tap-target"
        data-testid="active-start-rest"
        aria-label={t('activeStartRest', { seconds: restSec, defaultValue: `${restSec}s Rest` })}
        onClick={() => onStartRest(restSec, restLaneFromKind(activeSetKind))}
      >
        <Timer className="h-4 w-4" aria-hidden />
      </button>
    </div>
      {holdsActiveSet ? (
        <ExerciseRestStrip
          workSeconds={workRestSec}
          warmupSeconds={warmupRestSec}
          onSetLane={onSetRestLane}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
      {/*
        Set kind — table is the entry path on every surface, so the chips
        cannot live only in a compact console.
      */}
      {holdsActiveSet && (
        <div className="flex flex-wrap items-center gap-1">
          {SET_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={activeSetKind === k}
              onClick={() => onSetKindChange(k)}
              className={cn(
                'house-state min-h-[44px] tap-target',
                activeSetKind === k && 'is-on'
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
                'house-state min-h-[44px] tap-target',
                activeSetSide === s && 'is-on'
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
    </div>
  );
}
