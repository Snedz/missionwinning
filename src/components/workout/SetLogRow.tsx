'use client';
/**
 * Active workout set logging row.
 * See: src/components/workout/INDEX.md
 */

import { Check, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { LoggedSet, SetKind } from '@/types';
import { SET_KINDS, setKindBadgeClass, setKindCompletedRowClass, setKindDefaultLabel, setKindLabelKey, setKindRowClass } from '@/lib/setKind';
import { cn } from '@/lib/utils';

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
  const kind = set.kind ?? 'normal';

  if (set.completed) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-xl border p-3',
          setKindCompletedRowClass(kind)
        )}
      >
        <span className="w-7 text-sm font-medium text-muted-foreground">#{setNumber}</span>
        {kind !== 'normal' && (
          <Badge variant="outline" className={cn('text-[10px] uppercase', setKindBadgeClass(kind))}>
            {t(setKindLabelKey(kind), { defaultValue: setKindDefaultLabel(kind) })}
          </Badge>
        )}
        <Badge variant="secondary" className="gap-1 tabular-nums">
          <Check className="h-3 w-3" />
          {set.reps} × {set.weight}
        </Badge>
        {set.isPr && (
          <Badge
            variant="outline"
            className="border-brass/50 bg-brass/15 text-brass text-[10px] uppercase tracking-wide"
          >
            {t('activePrBadge', { defaultValue: 'PR' })}
          </Badge>
        )}
        <div className="ms-auto flex gap-1">
          {!set.rpe ? (
            (['easy', 'med', 'hard'] as const).map((r) => (
              <Button
                key={r}
                variant="outline"
                size="sm"
                className="h-8 min-w-[44px] text-xs px-2"
                onClick={() => onRate(r)}
              >
                {t(
                  r === 'easy' ? 'activeRpeEasy' : r === 'med' ? 'activeRpeMed' : 'activeRpeHard',
                  { defaultValue: r }
                )}
              </Button>
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
        'rounded-xl border p-3 space-y-2 transition-colors',
        isNext ? setKindRowClass(kind, true) : setKindRowClass(kind, false)
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-muted-foreground">#{setNumber}</span>
          <div className="flex flex-wrap gap-1">
            {SET_KINDS.map((k) => (
              <Button
                key={k}
                type="button"
                size="sm"
                variant={kind === k ? 'default' : 'outline'}
                className={cn(
                  'h-7 px-2 text-[10px] min-w-[44px]',
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
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {target && (
            <>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium tabular-nums text-emerald-300">
                {t('activeTargetChip', {
                  reps: target.reps,
                  weight: target.weight,
                  defaultValue: `Target ${target.reps} × ${target.weight}`,
                })}
              </span>
              {onApplyTarget && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] text-emerald-400"
                  onClick={onApplyTarget}
                >
                  {t('activeApplyTarget', { defaultValue: 'Apply' })}
                </Button>
              )}
            </>
          )}
          {lastPerformance && (
            <>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {t('activeLastPerformance', {
                  reps: lastPerformance.reps,
                  weight: lastPerformance.weight,
                  defaultValue: `Last: ${lastPerformance.reps} × ${lastPerformance.weight}`,
                })}
              </span>
              {onCopyLast && (
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={onCopyLast}>
                  {t('activeCopyLast', { defaultValue: 'Copy last' })}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground w-8">{t('activeReps', { defaultValue: 'Reps' })}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Decrease reps"
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
            className="h-11 w-12 rounded-lg border border-input bg-background text-center text-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Increase reps"
            onClick={() => onRepsChange(reps + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground w-10">{weightLabel}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Decrease weight"
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
            className="h-11 w-16 rounded-lg border border-input bg-background text-center text-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Increase weight"
            onClick={() => onWeightChange(weight + weightStep)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="fitness"
          size="lg"
          className="ms-auto h-12 min-w-[88px] gap-2 font-semibold"
          onClick={onLog}
        >
          <Check className="h-5 w-5" />
          {t('activeLogSet', { defaultValue: 'Log' })}
        </Button>
      </div>
    </div>
  );
}
