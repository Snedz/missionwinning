'use client';
/**
 * E-Adjacency stack: TARGET (+ log cite) above PREVIOUS.
 * Compact row and desktop Prev cell share this grammar — not a HUD overlay.
 */

import type { TFunction } from 'i18next';
import { cn } from '@/lib/utils';
import type { SetRowCite } from '@/lib/workout/setRowAdjacency';

export function formatAdjacencyCiteLine(
  cite: SetRowCite | null,
  t: TFunction
): string | null {
  if (!cite) return null;
  if (cite.kind === 'coach') {
    return t('activeTargetCiteCoach', { defaultValue: 'Coach plan' });
  }
  const day = weekdayWord(cite.weekdayMondayOffset, t);
  const sets =
    cite.setFrom === cite.setTo
      ? t('activeTargetCiteSet', { n: cite.setFrom, defaultValue: `set ${cite.setFrom}` })
      : t('activeTargetCiteSets', {
          from: cite.setFrom,
          to: cite.setTo,
          defaultValue: `sets ${cite.setFrom}–${cite.setTo}`,
        });
  return t('activeTargetCiteFromLast', {
    day,
    sets,
    defaultValue: `from last ${day} · ${sets}`,
  });
}

function weekdayWord(offset: number, t: TFunction): string {
  switch (offset) {
    case 0:
      return t('activeWeekdayMon', { defaultValue: 'Mon' });
    case 1:
      return t('activeWeekdayTue', { defaultValue: 'Tue' });
    case 2:
      return t('activeWeekdayWed', { defaultValue: 'Wed' });
    case 3:
      return t('activeWeekdayThu', { defaultValue: 'Thu' });
    case 4:
      return t('activeWeekdayFri', { defaultValue: 'Fri' });
    case 5:
      return t('activeWeekdaySat', { defaultValue: 'Sat' });
    default:
      return t('activeWeekdaySun', { defaultValue: 'Sun' });
  }
}

type Props = {
  targetWord: string;
  targetLabel: string | null;
  citeLine: string | null;
  prevWord: string;
  prevLabel: string | null;
  /** Hide target on completed rows — the logged line is the truth. */
  showTarget: boolean;
  testIdPrefix: 'set-row' | 'set-table';
};

export function SetLogAdjacencyStack({
  targetWord,
  targetLabel,
  citeLine,
  prevWord,
  prevLabel,
  showTarget,
  testIdPrefix,
}: Props) {
  const prevShown = prevLabel?.trim() || '—';
  const show = Boolean(showTarget && targetLabel);

  return (
    <span
      className="flex min-w-[7.25rem] shrink-0 flex-col justify-center leading-none"
      data-testid={`${testIdPrefix}-adjacency`}
    >
      {show ? (
        <span data-testid={`${testIdPrefix}-target`} data-target-anchor="true">
          <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {targetWord}
          </span>
          <span className="mt-0.5 block truncate text-[13px] font-semibold tabular-nums text-foreground">
            {targetLabel}
          </span>
          {citeLine ? (
            <span
              data-testid={`${testIdPrefix}-target-cite`}
              className="mt-0.5 block truncate text-[9px] text-muted-foreground"
            >
              {citeLine}
            </span>
          ) : null}
        </span>
      ) : null}
      <span
        className={cn('flex flex-col justify-center', show && 'mt-1')}
        data-testid={`${testIdPrefix}-prev`}
        data-prev-anchor={prevLabel ? 'true' : 'empty'}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {prevWord}
        </span>
        <span
          className={cn(
            'mt-0.5 truncate text-[13px] tabular-nums',
            prevLabel ? 'font-semibold text-foreground' : 'text-muted-foreground'
          )}
        >
          {prevShown}
        </span>
      </span>
    </span>
  );
}
