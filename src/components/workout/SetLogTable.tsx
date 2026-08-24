'use client';

/**
 * The logger's set list — the Train atom on every surface.
 *
 * Set · Prev · weight · Reps · Log. Tabular nums. One inline Log set
 * (sole red primary). No second dock console under the rows.
 *
 * Completed rows mirror compact `SetLogRow` cues (primary edge, check, a11y).
 */

import { Fragment, useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { LoggedSet, SetKind, SetTempo } from '@/types';
import { setKindBadgeClass, setKindDefaultLabel, setKindLabelKey } from '@/lib/workout/setKind';
import { parseSetSide, setSideDefaultLabel, setSideLabelKey } from '@/lib/workout/unilateral';
import { rpeDefaultLabel, rpeLabelKey } from '@/lib/workout/rpeLabel';
import { SetRirSelect } from '@/components/workout/SetRirSelect';
import { SetTempoField } from '@/components/workout/SetTempoField';
import { formatPlusLoadWeightCell } from '@/lib/workout/bodyweightLoad';
import { cn } from '@/lib/utils';
import type { LastSetGhost } from '@/lib/workout/lastSetGhost';
import { LastSetGhostButton } from '@/components/workout/LastSetGhostButton';
import { SetLogNextCite } from '@/components/workout/SetLogNextCite';
import {
  formatAfterCompleteParts,
  type AfterCompleteCite,
} from '@/lib/workout/setRowAdjacency';
import { formatRestClock } from '@/lib/workout/restTimer';

type Props = {
  sets: LoggedSet[];
  /** Index of the set the logger is holding, or -1 when the exercise is done. */
  activeSetIdx: number;
  weightLabel: string;
  /** "8 × 60" for each set index, when a previous performance exists. */
  prevLabels: (string | null)[];
  /** A1/A2 pair mark — prefix on the Set cell so the row stays identifiable. */
  pairMark?: string | null;
  /** After-save vs-last tokens; null slots stay unpainted. */
  vsLastLabels?: (string | null)[];
  /** Strong set column: `W` or working-set `1..n`. */
  ordinalLabels?: string[];
  /** Live barbell row only — compact per-side stack. */
  plateLine?: string | null;
  onToggleWarmup?: () => void;
  onOpenPlates?: () => void;
  input: { reps: number; weight: number };
  onInputChange: (field: 'reps' | 'weight', value: number) => void;
  onLog: () => void;
  onRate: (setIdx: number, rpe: 'easy' | 'med' | 'hard') => void;
  /** Optional 0–5 RIR — independent of RPE; never required (`.725`). */
  onRateRir: (setIdx: number, rir: number | undefined) => void;
  /** Optional ecc/pause/con — never required (`.734`). */
  onRateTempo: (setIdx: number, tempo: SetTempo | undefined) => void;
  plusLoad?: boolean;
  /** Last working set (not warmup). One tap accepts into the active dial. */
  lastSetGhost?: LastSetGhost | null;
  onAcceptGhost?: (target: { reps: number; weight: number }) => void;
  /** After-complete next-set cite; null slots stay unpainted. */
  afterCompleteCites?: (AfterCompleteCite | null)[];
};

const cell = 'px-1.5 py-1.5 align-middle';

/** 2px rules and radius 0 come from the system. ≥44px taps. Width follows the column. */
const numberInput =
  'h-11 min-h-[44px] w-full min-w-0 border-2 border-border bg-background px-1 text-center text-sm font-semibold tabular-nums ' +
  'focus:outline-none focus:ring-2 focus:ring-ring';

export function SetLogTable({
  sets,
  activeSetIdx,
  weightLabel,
  prevLabels,
  pairMark = null,
  vsLastLabels = [],
  ordinalLabels,
  plateLine = null,
  onToggleWarmup,
  onOpenPlates,
  input,
  onInputChange,
  onLog,
  onRate,
  onRateRir,
  onRateTempo,
  plusLoad = false,
  lastSetGhost,
  onAcceptGhost,
  afterCompleteCites = [],
}: Props) {
  const { t } = useTranslation();
  const [skippedCiteIds, setSkippedCiteIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
    <table
      className="w-full table-fixed border-collapse text-sm"
      data-testid="set-log-table"
      data-pair-mark={pairMark ?? undefined}
    >
      <colgroup>
        <col className={pairMark ? 'w-[14%]' : 'w-[12%]'} />
        <col className="w-[20%]" />
        <col className="w-[24%]" />
        <col className="w-[18%]" />
        <col className="w-[26%]" />
      </colgroup>
      <thead>
        <tr className="border-b-2 border-border text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <th scope="col" className={cn(cell, 'text-start')}>
            {t('activeColSet', { defaultValue: 'Set' })}
          </th>
          <th scope="col" className={cn(cell, 'text-start')}>
            {t('activeColPrev', { defaultValue: 'Prev' })}
          </th>
          <th scope="col" className={cn(cell, 'text-start')}>
            {weightLabel}
          </th>
          <th scope="col" className={cn(cell, 'text-start')}>
            {t('activeColReps', { defaultValue: 'Reps' })}
          </th>
          <th scope="col" className={cell}>
            <span className="sr-only">{t('activeColAction', { defaultValue: 'Action' })}</span>
          </th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {sets.map((set, setIdx) => {
          const isActive = setIdx === activeSetIdx;
          const kind = set.kind ?? ('normal' as SetKind);
          const completed = Boolean(set.completed);
          const side = parseSetSide(set.side);
          const vsLast = vsLastLabels[setIdx] ?? null;

          return (
            <Fragment key={set.id}>
            <tr
              data-set-complete={completed ? 'true' : 'false'}
              className={cn(
                !completed && 'border-b border-border',
                isActive && 'is-active-row',
                completed && !isActive && 'bg-muted/40 text-foreground',
                !completed && !isActive && 'text-muted-foreground'
              )}
            >
              <th
                scope="row"
                className={cn(
                  cell,
                  'text-start',
                  isActive || completed ? 'font-extrabold' : 'font-normal',
                  completed && !isActive && 'border-s-[3px] border-s-primary'
                )}
              >
                {isActive && onToggleWarmup ? (
                  <button
                    type="button"
                    onClick={onToggleWarmup}
                    aria-pressed={kind === 'warmup'}
                    data-testid="set-table-warmup-toggle"
                    aria-label={
                      kind === 'warmup'
                        ? t('activeToggleWorkAria', { defaultValue: 'Mark as work set' })
                        : t('activeToggleWarmupAria', { defaultValue: 'Mark as warmup' })
                    }
                    className="flex h-11 min-h-[44px] min-w-[44px] items-center justify-start font-extrabold tabular-nums tap-target hover:bg-muted"
                  >
                    {ordinalLabels?.[setIdx] ?? (pairMark ? `${pairMark}·${setIdx + 1}` : setIdx + 1)}
                  </button>
                ) : (
                  (ordinalLabels?.[setIdx] ?? (pairMark ? `${pairMark}·${setIdx + 1}` : setIdx + 1))
                )}
                {side ? (
                  <span
                    className="ms-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                    data-testid="set-table-side"
                  >
                    {t(setSideLabelKey(side), { defaultValue: setSideDefaultLabel(side) })}
                  </span>
                ) : null}
              </th>

              <td
                className={cn(
                  cell,
                  prevLabels[setIdx]
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground'
                )}
                data-testid="set-table-prev"
                data-prev-anchor={prevLabels[setIdx] ? 'true' : 'empty'}
              >
                {prevLabels[setIdx] ?? '—'}
              </td>

              {isActive ? (
                <>
                  <td className={cell}>
                    <div className="flex items-center gap-1">
                      {plusLoad ? (
                        <span className="shrink-0 text-[11px] font-semibold uppercase text-muted-foreground">
                          {t('activeSetBodyweight', { defaultValue: 'BW' })}+
                        </span>
                      ) : null}
                      <input
                        type="text"
                        inputMode="decimal"
                        className={numberInput}
                        value={input.weight}
                        aria-label={
                          plusLoad
                            ? t('activeSetAddedLoad', { defaultValue: 'Load' })
                            : weightLabel
                        }
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                          const parsed = parseFloat(cleaned);
                          onInputChange(
                            'weight',
                            Number.isFinite(parsed) ? Math.min(9999, Math.max(0, parsed)) : 0
                          );
                        }}
                      />
                    </div>
                    {plateLine ? (
                      onOpenPlates ? (
                        <button
                          type="button"
                          onClick={onOpenPlates}
                          data-testid="set-table-plates"
                          className="mt-1 flex min-h-[44px] w-full items-center text-start text-[11px] tabular-nums text-muted-foreground tap-target hover:bg-muted"
                        >
                          {t('activePlatePerSideLine', {
                            plates: plateLine,
                            defaultValue: `${plateLine} / side`,
                          })}
                        </button>
                      ) : (
                        <span
                          className="mt-1 block text-[11px] tabular-nums text-muted-foreground"
                          data-testid="set-table-plates"
                        >
                          {t('activePlatePerSideLine', {
                            plates: plateLine,
                            defaultValue: `${plateLine} / side`,
                          })}
                        </span>
                      )
                    ) : null}
                  </td>
                  <td className={cell}>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={numberInput}
                      value={input.reps}
                      aria-label={t('activeReps', { defaultValue: 'Reps' })}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value.replace(/\D/g, ''), 10);
                        onInputChange(
                          'reps',
                          Number.isFinite(parsed) ? Math.min(999, Math.max(1, parsed)) : 1
                        );
                      }}
                    />
                  </td>
                  <td className={cn(cell, 'text-end')}>
                    {/* Sole red primary on desktop Active log path. */}
                    <button
                      type="button"
                      onClick={onLog}
                      data-testid="set-table-log-set"
                      className="primary-action min-h-[44px] w-full tap-target bg-[hsl(var(--accent-poster))] px-1.5 py-1.5 text-xs font-extrabold leading-tight text-background transition-colors hover:bg-[hsl(var(--primary-fill))]"
                    >
                      {t('activeLogSet', { defaultValue: 'Log set' })}
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className={cn(cell, completed && 'font-semibold')}>
                    {completed
                      ? plusLoad
                        ? formatPlusLoadWeightCell(
                            set.weight,
                            t('activeSetBodyweight', { defaultValue: 'BW' })
                          )
                        : set.weight
                      : '—'}
                  </td>
                  <td className={cn(cell, completed && 'font-semibold')}>
                    {completed ? set.reps : set.reps}
                  </td>
                  <td className={cn(cell, 'text-end')}>
                    {completed ? (
                      <Check
                        className="ms-auto h-4 w-4 shrink-0 text-primary"
                        aria-hidden
                        data-testid="set-table-logged-check"
                      />
                    ) : null}
                    {completed ? (
                      <span className="sr-only">
                        {t('activeSetLoggedSr', { defaultValue: 'Logged' })}
                      </span>
                    ) : null}
                  </td>
                </>
              )}
            </tr>
            {completed ? (
              <tr className={cn('border-b border-border', !isActive && 'bg-muted/40')}>
                <td
                  colSpan={5}
                  className={cn(cell, 'min-w-0')}
                  data-testid="set-table-rate"
                >
                  <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
                    {vsLast ? (
                      <span
                        className="text-[11px] tabular-nums text-muted-foreground"
                        data-testid="set-table-vs-last"
                        aria-label={t('activeVsLastAria', {
                          delta: vsLast,
                          defaultValue: 'versus last {{delta}}',
                        })}
                      >
                        {vsLast}
                      </span>
                    ) : null}
                    {kind !== 'normal' && (
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] uppercase', setKindBadgeClass(kind))}
                      >
                        {t(setKindLabelKey(kind), { defaultValue: setKindDefaultLabel(kind) })}
                      </Badge>
                    )}
                    {set.isPr && (
                      <Badge variant="honor">{t('activePrBadge', { defaultValue: 'PR' })}</Badge>
                    )}
                    {!set.isPr && !set.rpe && (
                      <div className="flex min-w-0 flex-wrap items-center justify-end gap-0.5">
                        {(['easy', 'med', 'hard'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => onRate(setIdx, r)}
                            className="min-h-[44px] min-w-[44px] border-2 border-border px-1.5 text-[11px] font-semibold hover:bg-muted tap-target"
                          >
                            {t(rpeLabelKey(r), { defaultValue: rpeDefaultLabel(r) })}
                          </button>
                        ))}
                      </div>
                    )}
                    {set.rpe && (
                      <span className="text-[11px] text-muted-foreground">
                        {t(rpeLabelKey(set.rpe), {
                          defaultValue: rpeDefaultLabel(set.rpe),
                        })}
                      </span>
                    )}
                    <SetRirSelect
                      rir={set.rir}
                      onRateRir={(rir) => onRateRir(setIdx, rir)}
                      testId="set-table-rir"
                    />
                    <SetTempoField
                      tempo={set.tempo}
                      onRateTempo={(tempo) => onRateTempo(setIdx, tempo)}
                      testId="set-table-tempo"
                    />
                  </div>
                </td>
              </tr>
            ) : null}
            {(() => {
              const cite = completed ? (afterCompleteCites[setIdx] ?? null) : null;
              if (!cite || skippedCiteIds.has(set.id)) return null;
              const restClock =
                cite.suggestion.kind === 'rest'
                  ? formatRestClock(cite.suggestion.seconds)
                  : undefined;
              const parts = formatAfterCompleteParts(cite, t, restClock);
              return (
                <tr className={cn('border-b border-border', !isActive && 'bg-muted/40')}>
                  <td colSpan={5} className={cn(cell, 'min-w-0')}>
                    <SetLogNextCite
                      target={parts.target}
                      provenance={parts.provenance}
                      onSkip={() =>
                        setSkippedCiteIds((prev) => new Set([...prev, set.id]))
                      }
                    />
                  </td>
                </tr>
              );
            })()}
            </Fragment>
          );
        })}
      </tbody>
    </table>
    {onAcceptGhost && activeSetIdx >= 0 ? (
      <LastSetGhostButton
        ghost={lastSetGhost}
        dial={input}
        onAccept={onAcceptGhost}
        tone="paper"
      />
    ) : null}
    </div>
  );
}
