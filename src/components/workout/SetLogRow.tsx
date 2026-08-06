'use client';
/**
 * One set in the active workout list — a read-only record, not a control band.
 *
 * It used to carry the whole input apparatus per set: `#n`, two 44px steppers
 * around a reps field, two more around a weight field, and a Log button —
 * ~340px inside 326px, so it lived in an `overflow-x-auto` with Log off-screen,
 * once per planned set. Entry moved to `LogConsole`; this renders what
 * happened, and what is still to come.
 *
 * See: src/components/workout/INDEX.md
 */

import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LoggedSet, SetKind } from '@/types';
import {
  setKindBadgeClass,
  setKindDefaultLabel,
  setKindLabelKey,
} from '@/lib/workout/setKind';
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
  onRate: (rpe: 'easy' | 'med' | 'hard') => void;
};

export function SetLogRow({ setNumber, set, isNext, weightLabel, onRate }: Props) {
  const { t } = useTranslation();
  const kind = set.kind ?? 'normal';
  const line = formatLoggedSetLine(
    set.reps,
    set.weight,
    weightLabel,
    t('activeSetBodyweight', { defaultValue: 'BW' })
  );
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
      aria-label={rowLabel}
      aria-current={isNext ? 'true' : undefined}
      className={cn(
        'flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-1 py-2 transition-colors',
        isNext && 'is-active-row',
        set.completed && 'border-s-[3px] border-s-primary bg-muted/40 ps-2'
      )}
      data-set-complete={set.completed ? 'true' : 'false'}
    >
      <span className="w-[22px] shrink-0 text-[13px] font-semibold tabular-nums text-muted-foreground">
        #{setNumber}
      </span>

      {set.completed ? (
        <span className="text-[15px] font-semibold tabular-nums text-foreground">{line}</span>
      ) : (
        <span className="text-[15px] tabular-nums text-muted-foreground">
          {isNext
            ? t('activeSetInConsole', { defaultValue: 'In the console' })
            : t('activeSetPlanned', {
                reps: set.reps,
                defaultValue: `${set.reps} planned`,
              })}
        </span>
      )}

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

      {set.isPr && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="honor">{t('activePrBadge', { defaultValue: 'PR' })}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            {t('activePrTip', { defaultValue: 'Personal record for this exercise' })}
          </TooltipContent>
        </Tooltip>
      )}

      {set.completed && (
        <div className="ms-auto flex items-center gap-1">
          {!set.rpe ? (
            (['easy', 'med', 'hard'] as const).map((r) => (
              <Tooltip key={r}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 min-h-[44px] min-w-[44px] px-2 text-xs tap-target"
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
