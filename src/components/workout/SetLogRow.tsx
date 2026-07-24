'use client';
/**
 * Active workout set logging row — Strong/Hevy-dense mobile default.
 * See: src/components/workout/INDEX.md
 */

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LoggedSet, SetKind } from '@/types';
import {
  SET_KINDS,
  setKindBadgeClass,
  setKindCompletedRowClass,
  setKindDefaultLabel,
  setKindLabelKey,
  setKindRowClass,
} from '@/lib/workout/setKind';
import { cn } from '@/lib/utils';

const SET_KIND_TIPS: Record<SetKind, { key: string; defaultValue: string }> = {
  normal: { key: 'activeSetNormalTip', defaultValue: 'Working set — counts toward volume and PRs' },
  warmup: { key: 'activeSetWarmupTip', defaultValue: 'Warm-up — does not count toward volume or PRs' },
  failure: { key: 'activeSetFailureTip', defaultValue: 'Taken to failure — still counts as work' },
  drop: { key: 'activeSetDropTip', defaultValue: 'Drop set — lighter follow-up; not a PR attempt' },
};

const RPE_TIPS = {
  easy: { key: 'activeRpeEasyTip', defaultValue: 'Easy — 2+ reps left in the tank' },
  med: { key: 'activeRpeMedTip', defaultValue: 'Medium — about 1–2 reps left' },
  hard: { key: 'activeRpeHardTip', defaultValue: 'Hard — near failure (0–1 reps left)' },
} as const;

type Props = {
  setNumber: number;
  set: LoggedSet;
  reps: number;
  weight: number;
  isNext: boolean;
  weightLabel: string;
  weightStep: number;
  lastPerformance?: { reps: number; weight: number } | null;
  /** RepStack-style suggested next target (free forever). */
  target?: { reps: number; weight: number } | null;
  onRepsChange: (reps: number) => void;
  onWeightChange: (weight: number) => void;
  onSetKindChange: (kind: SetKind) => void;
  onLog: () => void;
  onRate: (rpe: 'easy' | 'med' | 'hard') => void;
  onCopyLast?: () => void;
  onApplyTarget?: () => void;
};

export function SetLogRow({
  setNumber,
  set,
  reps,
  weight,
  isNext,
  weightLabel,
  weightStep,
  lastPerformance,
  target,
  onRepsChange,
  onWeightChange,
  onSetKindChange,
  onLog,
  onRate,
  onCopyLast,
  onApplyTarget,
}: Props) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const kind = set.kind ?? 'normal';
  const seededFromTarget =
    !!target && reps === target.reps && weight === target.weight;
  const seededFromLast =
    !!lastPerformance &&
    reps === lastPerformance.reps &&
    weight === lastPerformance.weight;
  const showApplyTarget = !!onApplyTarget && !!target && !seededFromTarget;
  const showCopyLast = !!onCopyLast && !!lastPerformance && !seededFromTarget && !seededFromLast;

  if (set.completed) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-xl border p-2.5',
          setKindCompletedRowClass(kind)
        )}
      >
        <span className="w-6 text-sm font-medium text-muted-foreground">#{setNumber}</span>
        {kind !== 'normal' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn('text-[10px] uppercase', setKindBadgeClass(kind))}>
                {t(setKindLabelKey(kind), { defaultValue: setKindDefaultLabel(kind) })}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {t(SET_KIND_TIPS[kind].key, { defaultValue: SET_KIND_TIPS[kind].defaultValue })}
            </TooltipContent>
          </Tooltip>
        )}
        <Badge variant="secondary" className="gap-1 tabular-nums">
          <Check className="h-3 w-3" />
          {set.reps} × {set.weight}
        </Badge>
        {set.isPr && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="border-brass/40 bg-brass/10 text-brass text-[11px] font-semibold"
              >
                {t('activePrBadge', { defaultValue: 'PR' })}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {t('activePrTip', { defaultValue: 'Personal record for this exercise' })}
            </TooltipContent>
          </Tooltip>
        )}
        <div className="ms-auto flex gap-1">
          {!set.rpe ? (
            (['easy', 'med', 'hard'] as const).map((r) => (
              <Tooltip key={r}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 min-h-[44px] min-w-[44px] sm:h-10 sm:min-h-[40px] text-xs px-2 tap-target"
                    onClick={() => onRate(r)}
                  >
                    {t(
                      r === 'easy' ? 'activeRpeEasy' : r === 'med' ? 'activeRpeMed' : 'activeRpeHard',
                      { defaultValue: r }
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t(RPE_TIPS[r].key, { defaultValue: RPE_TIPS[r].defaultValue })}
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <Badge variant="outline" className="text-xs capitalize">
              {set.rpe}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-2 space-y-1.5 transition-colors',
        isNext ? setKindRowClass(kind, true) : setKindRowClass(kind, false)
      )}
    >
      {/* Strong/Hevy: one nowrap band — # · reps · weight · Log */}
      <div className="overflow-x-auto -mx-0.5 px-0.5">
        <div className="flex flex-nowrap items-center gap-0.5 sm:gap-1 min-w-0">
          <span className="w-5 sm:w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground">
            #{setNumber}
          </span>

          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
              aria-label={t('activeDecreaseReps', { defaultValue: 'Decrease reps' })}
              onClick={() => onRepsChange(Math.max(1, reps - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={reps}
              aria-label={t('activeReps', { defaultValue: 'Reps' })}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const parsed = parseInt(e.target.value.replace(/\D/g, ''), 10);
                onRepsChange(Number.isFinite(parsed) ? Math.min(999, Math.max(1, parsed)) : 1);
              }}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg border border-input bg-background text-center text-base font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
              aria-label={t('activeIncreaseReps', { defaultValue: 'Increase reps' })}
              onClick={() => onRepsChange(reps + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
              aria-label={t('activeDecreaseWeight', {
                unit: weightLabel,
                defaultValue: `Decrease ${weightLabel}`,
              })}
              onClick={() => onWeightChange(Math.max(0, weight - weightStep))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              aria-label={weightLabel}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const cleaned = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                const parsed = parseFloat(cleaned);
                onWeightChange(Number.isFinite(parsed) ? Math.min(9999, Math.max(0, parsed)) : 0);
              }}
              className="h-9 w-10 sm:h-10 sm:w-11 md:w-14 rounded-lg border border-input bg-background text-center text-base font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
              aria-label={t('activeIncreaseWeight', {
                unit: weightLabel,
                defaultValue: `Increase ${weightLabel}`,
              })}
              onClick={() => onWeightChange(weight + weightStep)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="fitness"
            className="ms-auto h-11 min-h-[44px] min-w-[3rem] md:min-w-[3.5rem] shrink-0 px-2.5 md:px-3 font-semibold tap-target"
            aria-label={t('activeLogSet', { defaultValue: 'Log' })}
            onClick={onLog}
          >
            {t('activeLogSet', { defaultValue: 'Log' })}
          </Button>
        </div>
      </div>

      <button
        type="button"
        className="text-[11px] font-medium text-muted-foreground hover:text-foreground px-1 min-h-[28px]"
        aria-expanded={showMore}
        onClick={() => setShowMore((v) => !v)}
      >
        {showMore
          ? t('activeSetLess', { defaultValue: 'Less' })
          : t('activeSetMore', { defaultValue: 'More' })}
        {kind !== 'normal' && !showMore
          ? ` · ${t(setKindLabelKey(kind), { defaultValue: setKindDefaultLabel(kind) })}`
          : ''}
      </button>

      {showMore && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2">
          <div className="flex flex-wrap gap-1">
            {SET_KINDS.map((k) => (
              <Tooltip key={k}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant={kind === k ? 'default' : 'outline'}
                    className={cn(
                      'h-11 min-h-[44px] px-2 text-[10px] min-w-[44px] tap-target',
                      kind === k && k === 'warmup' && 'bg-amber-600 hover:bg-amber-500',
                      kind === k && k === 'failure' && 'bg-rose-600 hover:bg-rose-500',
                      kind === k && k === 'drop' && 'bg-violet-600 hover:bg-violet-500'
                    )}
                    onClick={() => onSetKindChange(k)}
                  >
                    {t(setKindLabelKey(k), {
                      defaultValue: k === 'normal' ? 'Work' : setKindDefaultLabel(k),
                    })}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t(SET_KIND_TIPS[k].key, { defaultValue: SET_KIND_TIPS[k].defaultValue })}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {showApplyTarget && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-11 min-h-[44px] px-3 text-xs text-muted-foreground tap-target"
                onClick={onApplyTarget}
              >
                {t('activeApplyTarget', { defaultValue: 'Apply' })}
              </Button>
            )}
            {showCopyLast && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-11 min-h-[44px] px-3 text-xs tap-target"
                onClick={onCopyLast}
              >
                {t('activeCopyLast', { defaultValue: 'Use last' })}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
