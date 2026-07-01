'use client';

import { Check, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { LoggedSet, SetKind } from '@/types';
import { SET_KINDS, setKindDefaultLabel, setKindLabelKey } from '@/lib/setKind';
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
  onRepsChange: (reps: number) => void;
  onWeightChange: (weight: number) => void;
  onSetKindChange: (kind: SetKind) => void;
  onLog: () => void;
  onRate: (rpe: 'easy' | 'med' | 'hard') => void;
  onCopyLast?: () => void;
};

function kindBadgeClass(kind: SetKind): string {
  if (kind === 'warmup') return 'border-amber-500/40 bg-amber-950/30 text-amber-300';
  if (kind === 'failure') return 'border-rose-500/40 bg-rose-950/30 text-rose-300';
  return '';
}

export function SetLogRow({
  setNumber,
  set,
  reps,
  weight,
  isNext,
  weightLabel,
  weightStep,
  lastPerformance,
  onRepsChange,
  onWeightChange,
  onSetKindChange,
  onLog,
  onRate,
  onCopyLast,
}: Props) {
  const { t } = useTranslation();
  const kind = set.kind ?? 'normal';

  if (set.completed) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-xl border p-3',
          kind === 'warmup'
            ? 'border-amber-500/30 bg-amber-950/15'
            : kind === 'failure'
              ? 'border-rose-500/30 bg-rose-950/15'
              : 'border-secondary/40 bg-secondary/10'
        )}
      >
        <span className="w-7 text-sm font-medium text-muted-foreground">#{setNumber}</span>
        {kind !== 'normal' && (
          <Badge variant="outline" className={cn('text-[10px] uppercase', kindBadgeClass(kind))}>
            {t(setKindLabelKey(kind), { defaultValue: setKindDefaultLabel(kind) })}
          </Badge>
        )}
        <Badge variant="secondary" className="gap-1 tabular-nums">
          <Check className="h-3 w-3" />
          {set.reps} × {set.weight}
        </Badge>
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
        isNext
          ? 'border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/30'
          : kind === 'warmup'
            ? 'border-amber-500/25 bg-amber-950/10'
            : kind === 'failure'
              ? 'border-rose-500/25 bg-rose-950/10'
              : 'border-border bg-card/40'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">#{setNumber}</span>
          <div className="flex gap-1">
            {SET_KINDS.map((k) => (
              <Button
                key={k}
                type="button"
                size="sm"
                variant={kind === k ? 'default' : 'outline'}
                className={cn(
                  'h-7 px-2 text-[10px] min-w-[44px]',
                  kind === k && k === 'warmup' && 'bg-amber-600 hover:bg-amber-500',
                  kind === k && k === 'failure' && 'bg-rose-600 hover:bg-rose-500'
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
        {lastPerformance && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
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
          <span className="w-10 text-center text-lg font-bold tabular-nums">{reps}</span>
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
          <span className="w-12 text-center text-lg font-bold tabular-nums">{weight}</span>
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
