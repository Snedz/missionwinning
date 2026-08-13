'use client';
/**
 * One set in the active workout list — a read-only record, not a control band.
 *
 * Strong/Hevy density: metric-first (`8 × 60 kg`), not prose ("In the console").
 * **PREVIOUS is the row anchor** (Hevy web withholds this; we show it) — prior
 * performance sits beside the set number before this session's metric.
 * E-Adjacency stacks TARGET + log cite above PREVIOUS on the live row only.
 * Entry stays in `LogConsole`. Rows + RPE ≥44px. No filled red — Log set owns red.
 *
 * See: src/components/workout/INDEX.md
 */

import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SetLogAdjacencyStack } from '@/components/workout/SetLogAdjacencyStack';
import type { LoggedSet, SetKind } from '@/types';
import { formatAdjacencyCiteLine, type SetRowCite } from '@/lib/workout/setRowAdjacency';
import {
  setKindBadgeClass,
  setKindDefaultLabel,
  setKindLabelKey,
} from '@/lib/workout/setKind';
import { rpeDefaultLabel, rpeLabelKey } from '@/lib/workout/rpeLabel';
import { formatLoggedSetLine } from '@/lib/workout/activeWorkoutHelpers';
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
  /** The set the console is currently holding. */
  isNext: boolean;
  weightLabel: string;
  /**
   * Prior-session performance for this set index (`8 × 60`), or null.
   * Hevy Experience: PREVIOUS is the visible row anchor — never omit the slot.
   */
  prevLabel?: string | null;
  /** E-Adjacency: next target stacked above PREVIOUS (live row). */
  targetLabel?: string | null;
  cite?: SetRowCite | null;
  /** Honest empty — no live prior logs to cite. */
  empty?: boolean;
  onRate: (rpe: 'easy' | 'med' | 'hard') => void;
};

export function SetLogRow({
  setNumber,
  set,
  isNext,
  weightLabel,
  prevLabel = null,
  targetLabel = null,
  cite = null,
  empty = false,
  onRate,
}: Props) {
  const { t } = useTranslation();
  const kind = set.kind ?? 'normal';
  const line = formatLoggedSetLine(
    set.reps,
    set.weight,
    weightLabel,
    t('activeSetBodyweight', { defaultValue: 'BW' })
  );
  const prevShown = prevLabel?.trim() || '—';
  const prevWord = t('activeColPrev', { defaultValue: 'Prev' });
  const targetWord = t('activeColTarget', { defaultValue: 'Target' });
  const citeLine = formatAdjacencyCiteLine(cite, t);
  const emptyLine = empty
    ? t('activeTargetEmpty', { defaultValue: 'No prior sets yet — log this one' })
    : null;
  const showTarget = isNext && !set.completed;
  const rowLabel = set.completed
    ? t('activeSetRowCompleteAria', {
        n: setNumber,
        line,
        defaultValue: `Set ${setNumber} logged: ${line}`,
      })
    : isNext
      ? t('activeSetRowNextAria', {
          n: setNumber,
          defaultValue: `Set ${setNumber} — in the console`,
        })
      : t('activeSetRowPlannedAria', {
          n: setNumber,
          reps: set.reps,
          defaultValue: `Set ${setNumber} planned — ${set.reps} reps`,
        });

  return (
    <div
      role="listitem"
      aria-label={`${rowLabel}. ${showTarget && targetLabel ? `${targetWord} ${targetLabel}${citeLine ? ` ${citeLine}` : ''}. ` : showTarget && emptyLine ? `${targetWord} ${emptyLine}. ` : ''}${prevWord} ${prevShown}`}
      aria-current={isNext ? 'true' : undefined}
      className={cn(
        'flex min-h-[44px] flex-nowrap items-center gap-x-2 border-b border-border px-0.5 py-1.5 transition-colors',
        isNext && 'is-active-row',
        set.completed && 'border-s-[3px] border-s-primary bg-muted/40 ps-2'
      )}
      data-set-complete={set.completed ? 'true' : 'false'}
    >
      <span
        className={cn(
          'w-[1.25rem] shrink-0 text-[13px] font-semibold tabular-nums',
          set.completed || isNext ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {setNumber}
      </span>

      <SetLogAdjacencyStack
        targetWord={targetWord}
        targetLabel={targetLabel}
        citeLine={citeLine}
        emptyLine={emptyLine}
        prevWord={prevWord}
        prevLabel={prevLabel}
        showTarget={showTarget}
        testIdPrefix="set-row"
      />

      {/* This session's metric — Strong/Hevy density; no "In the console" chrome. */}
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-[15px] tabular-nums',
          set.completed && 'font-semibold text-foreground',
          !set.completed && isNext && 'font-semibold text-foreground',
          !set.completed && !isNext && 'text-muted-foreground'
        )}
      >
        {line}
      </span>

      {kind !== 'normal' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn('shrink-0 text-[10px] uppercase', setKindBadgeClass(kind))}>
              {t(setKindLabelKey(kind), { defaultValue: setKindDefaultLabel(kind) })}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {t(SET_KIND_TIPS[kind].key, { defaultValue: SET_KIND_TIPS[kind].defaultValue })}
          </TooltipContent>
        </Tooltip>
      )}

      {set.isPr && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="honor" className="shrink-0">
              {t('activePrBadge', { defaultValue: 'PR' })}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {t('activePrTip', { defaultValue: 'Personal record for this exercise' })}
          </TooltipContent>
        </Tooltip>
      )}

      {set.completed && (
        <div className="ms-auto flex shrink-0 items-center gap-0.5">
          {!set.rpe ? (
            (['easy', 'med', 'hard'] as const).map((r) => (
              <Tooltip key={r}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 min-h-[44px] min-w-[44px] px-1.5 text-[11px] tap-target"
                    onClick={() => onRate(r)}
                  >
                    {t(rpeLabelKey(r), { defaultValue: rpeDefaultLabel(r) })}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t(RPE_TIPS[r].key, { defaultValue: RPE_TIPS[r].defaultValue })}
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <Badge variant="outline" className="text-xs">
              {t(rpeLabelKey(set.rpe), { defaultValue: rpeDefaultLabel(set.rpe) })}
            </Badge>
          )}
          <Check
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden
            data-testid="set-logged-check"
          />
          <span className="sr-only">
            {t('activeSetLoggedSr', { defaultValue: 'Logged' })}
          </span>
        </div>
      )}
    </div>
  );
}
