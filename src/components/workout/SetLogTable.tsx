'use client';

/**
 * The logger's set list — the Train atom on every surface.
 *
 * Set · Prev · weight · Reps · Log. Tabular nums. One inline Log set
 * (sole red primary). No second dock console under the rows.
 *
 * Completed rows mirror compact `SetLogRow` cues (primary edge, check, a11y).
 */

import { Fragment, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { LoggedSet, SetKind, SetTempo } from '@/types';
import {
  SET_ROW_TAGS,
  setKindBadgeClass,
  setKindDefaultLabel,
  setKindLabelKey,
  toggleSetTag,
} from '@/lib/workout/setKind';
import { parseSetSide, setSideDefaultLabel, setSideLabelKey } from '@/lib/workout/unilateral';
import { rpeDefaultLabel, rpeLabelKey } from '@/lib/workout/rpeLabel';
import { SetRirSelect } from '@/components/workout/SetRirSelect';
import { SetRpe10Select } from '@/components/workout/SetRpe10Select';
import { SetTempoField } from '@/components/workout/SetTempoField';
import { formatCompletedWeightCell } from '@/lib/workout/bodyweightLoad';
import {
  clampOpenLoadWeight,
  displayOpenLoadDraft,
  formatOpenLoadInput,
  parseOpenLoadInput,
} from '@/lib/workout/openEmptyLoad';
import { cn } from '@/lib/utils';
import type { SetRowType } from '@/types';
import { formatSetRowDuration, parseDurationSeconds } from '@/lib/workout/setRowType';
import type { LastSetGhost } from '@/lib/workout/lastSetGhost';
import { LastSetGhostButton } from '@/components/workout/LastSetGhostButton';
import { SetLogNextCite } from '@/components/workout/SetLogNextCite';
import { SetLogPlateLine } from '@/components/workout/SetLogPlateLine';
import {
  formatAfterCompleteParts,
  type AfterCompleteCite,
} from '@/lib/workout/setRowAdjacency';
import { formatRestClock } from '@/lib/workout/restTimer';
import {
  AMRAP_PRESETS,
  formatWorkClock,
  type WorkClockKind,
} from '@/lib/workout/workClock';
import {
  formatKnownMaxPct,
  loadPctOfKnownMax,
  parseOptionalLoadPct,
} from '@/lib/workout/setRowPercent';

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
  /** Quiet diary PR on the live set (`.999`). Null = no prior / not a beat. */
  inSetPrLabels?: (string | null)[];
  /** Strong set column: `W` or working-set `1..n`. */
  ordinalLabels?: string[];
  /** Live barbell row only — both-sides plate counts (`2×45`). */
  plateLine?: string | null;
  /** Editable bar for the live plate line. Default 45 lb / 20 kg. */
  barWeight?: number;
  onBarWeightChange?: (next: number) => void;
  onToggleWarmup?: () => void;
  /** Optional W / D / F on any set — never required to Log set. */
  onSetKind?: (setIdx: number, kind: SetKind) => void;
  /** Delete an incomplete warmup from the batch — never required. */
  onRemovePlannedSet?: (setIdx: number) => void;
  onOpenPlates?: () => void;
  input: { reps: number; weight: number; durationSeconds?: number };
  onInputChange: (field: 'reps' | 'weight' | 'duration', value: number) => void;
  /** Optional % of a known 1-rep max — never required (`.981`). */
  knownMax?: number | null;
  onSetLoadPct?: (setIdx: number, loadPct: number | undefined) => void;
  onLog: () => void;
  onRate: (setIdx: number, rpe: 'easy' | 'med' | 'hard') => void;
  /** Optional 0–5 RIR — independent of RPE; never required (`.725`). */
  onRateRir: (setIdx: number, rir: number | undefined) => void;
  /** Optional 1–10 RPE — never required (`.967`). */
  onRateRpe10: (setIdx: number, rpe10: number | undefined) => void;
  /** Optional ecc/pause/con — never required (`.734`). */
  onRateTempo: (setIdx: number, tempo: SetTempo | undefined) => void;
  plusLoad?: boolean;
  /** Open-row type (`.994`). Empty / unknown stays weight × reps. */
  rowType?: SetRowType;
  /** Last working set (not warmup). One tap accepts into the active dial. */
  lastSetGhost?: LastSetGhost | null;
  onAcceptGhost?: (target: {
    reps: number;
    weight: number;
    durationSeconds?: number;
  }) => void;
  /** After-complete next-set cite; null slots stay unpainted. */
  afterCompleteCites?: (AfterCompleteCite | null)[];
  /** Optional EMOM / AMRAP on the live row only (`.987`). */
  workClockKind?: WorkClockKind | null;
  workClockRemaining?: number;
  onStartWorkClock?: (kind: WorkClockKind, seconds?: number) => void;
  onStopWorkClock?: () => void;
};

const cell = 'px-1.5 py-1.5 align-middle';

/** House number cell on live compose. ≥44px taps. Width follows the column. */
const numberInput = 'house-num min-h-[44px] w-full min-w-0 tap-target';

export function SetLogTable({
  sets,
  activeSetIdx,
  weightLabel,
  prevLabels,
  pairMark = null,
  vsLastLabels = [],
  inSetPrLabels = [],
  ordinalLabels,
  plateLine = null,
  barWeight,
  onBarWeightChange,
  onToggleWarmup,
  onSetKind,
  onRemovePlannedSet,
  input,
  onInputChange,
  knownMax = null,
  onSetLoadPct,
  onLog,
  onRate,
  onRateRir,
  onRateRpe10,
  onRateTempo,
  plusLoad = false,
  rowType = 'weight',
  lastSetGhost,
  onAcceptGhost,
  afterCompleteCites = [],
  workClockKind = null,
  workClockRemaining = 0,
  onStartWorkClock,
  onStopWorkClock,
}: Props) {
  const { t } = useTranslation();
  const [skippedCiteIds, setSkippedCiteIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [platesSkipped, setPlatesSkipped] = useState(false);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
    <table
      className="w-full table-fixed border-collapse text-sm"
      data-testid="set-log-table"
      data-row-type={rowType}
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
          <th
            scope="col"
            colSpan={rowType === 'duration' ? 2 : 1}
            className={cn(cell, 'text-start')}
          >
            {rowType === 'duration'
              ? t('activeColTime', { defaultValue: 'Time' })
              : rowType === 'assisted'
                ? t('activeColAssist', { defaultValue: 'Assist' })
                : rowType === 'bodyweight'
                  ? `+${weightLabel}`
                  : weightLabel}
          </th>
          {rowType === 'duration' ? null : (
            <th scope="col" className={cn(cell, 'text-start')}>
              {t('activeColReps', { defaultValue: 'Reps' })}
            </th>
          )}
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
          const inSetPr = inSetPrLabels[setIdx] ?? null;

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
                    className="house-btn house-btn-ghost house-warmup-toggle h-11 min-h-[44px] min-w-[44px] justify-start font-extrabold tabular-nums tap-target"
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
                  {rowType === 'duration' ? (
                    <td className={cell} colSpan={2}>
                      <SetRowDurationField
                        seconds={input.durationSeconds ?? 0}
                        onChange={(seconds) => onInputChange('duration', seconds)}
                      />
                    </td>
                  ) : (
                    <>
                      <td className={cell}>
                        <div className="flex items-center gap-1">
                          {plusLoad ? (
                            <span className="shrink-0 text-[11px] font-semibold uppercase text-muted-foreground">
                              {t('activeSetBodyweight', { defaultValue: 'BW' })}+
                            </span>
                          ) : null}
                          <SetRowLoadField
                            weight={input.weight}
                            ariaLabel={
                              rowType === 'assisted'
                                ? t('activeSetAssist', { defaultValue: 'Assist' })
                                : plusLoad
                                  ? t('activeSetAddedLoad', { defaultValue: 'Load' })
                                  : weightLabel
                            }
                            onChange={(next) => onInputChange('weight', next)}
                          />
                        </div>
                        {rowType === 'weight' && onSetLoadPct ? (
                          <SetRowPercentField
                            authored={set.loadPct}
                            weight={input.weight}
                            knownMax={knownMax}
                            onChange={(pct) => onSetLoadPct(setIdx, pct)}
                          />
                        ) : null}
                        {(rowType === 'weight' ||
                          (rowType === 'bodyweight' && input.weight > 0)) &&
                        plateLine &&
                        !platesSkipped &&
                        barWeight != null &&
                        onBarWeightChange ? (
                          <SetLogPlateLine
                            barWeight={barWeight}
                            platesLine={plateLine}
                            onBarWeightChange={onBarWeightChange}
                            onSkip={() => setPlatesSkipped(true)}
                          />
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
                    </>
                  )}
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
                    {kind === 'warmup' && onRemovePlannedSet ? (
                      <button
                        type="button"
                        onClick={() => onRemovePlannedSet(setIdx)}
                        data-testid="set-table-remove-warmup"
                        className="house-btn house-btn-ghost mt-1 min-h-[44px] w-full tap-target"
                      >
                        {t('activeRemoveSet', { defaultValue: 'Remove set' })}
                      </button>
                    ) : null}
                  </td>
                </>
              ) : (
                <>
                  {rowType === 'duration' ? (
                    <td className={cn(cell, completed && 'font-semibold')} colSpan={2}>
                      {completed
                        ? formatSetRowDuration(set.durationSeconds ?? 0) || '—'
                        : '—'}
                    </td>
                  ) : (
                    <>
                      <td className={cn(cell, completed && 'font-semibold')}>
                        {completed
                          ? rowType === 'assisted'
                            ? set.weight > 0
                              ? `−${set.weight}`
                              : '—'
                            : formatCompletedWeightCell(
                                set.weight,
                                t('activeSetBodyweight', { defaultValue: 'BW' }),
                                plusLoad
                              )
                          : kind === 'warmup' && set.weight > 0
                            ? set.weight
                            : '—'}
                        {completed && rowType === 'weight' ? (
                          <SetRowPercentCite
                            authored={set.loadPct}
                            weight={set.weight}
                            knownMax={knownMax}
                          />
                        ) : null}
                      </td>
                      <td className={cn(cell, completed && 'font-semibold')}>
                        {set.reps}
                      </td>
                    </>
                  )}
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
                    {kind === 'warmup' && !completed && onRemovePlannedSet ? (
                      <button
                        type="button"
                        onClick={() => onRemovePlannedSet(setIdx)}
                        data-testid="set-table-remove-warmup"
                        className="house-btn house-btn-ghost ms-auto mt-1 min-h-[44px] tap-target"
                      >
                        {t('activeRemoveSet', { defaultValue: 'Remove set' })}
                      </button>
                    ) : null}
                  </td>
                </>
              )}
            </tr>
            {onSetKind && !completed ? (
              <tr className={cn(!isActive && 'text-muted-foreground')}>
                <td colSpan={5} className={cn(cell, 'min-w-0 pt-0')}>
                  <SetRowTagChips
                    kind={kind}
                    onPick={(tag) => onSetKind(setIdx, toggleSetTag(kind, tag))}
                  />
                </td>
              </tr>
            ) : null}
            {isActive && onStartWorkClock ? (
              <tr>
                <td colSpan={5} className={cn(cell, 'min-w-0 pt-0')}>
                  <SetRowWorkClock
                    kind={workClockKind ?? null}
                    remaining={workClockRemaining}
                    onStart={onStartWorkClock}
                    onStop={onStopWorkClock}
                  />
                </td>
              </tr>
            ) : null}
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
                    {onSetKind ? (
                      <SetRowTagChips
                        kind={kind}
                        onPick={(tag) => onSetKind(setIdx, toggleSetTag(kind, tag))}
                      />
                    ) : kind !== 'normal' ? (
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] uppercase', setKindBadgeClass(kind))}
                      >
                        {t(setKindLabelKey(kind), { defaultValue: setKindDefaultLabel(kind) })}
                      </Badge>
                    ) : null}
                    {inSetPr ? (
                      <span
                        className="inline-flex min-h-[44px] items-center gap-1 text-[11px] text-muted-foreground"
                        data-testid="set-table-in-set-pr"
                        aria-label={t('activeInSetPrAria', {
                          kinds: inSetPr,
                          defaultValue: 'Personal record: {{kinds}}',
                        })}
                      >
                        <span aria-hidden="true">✓</span>
                        {inSetPr}
                      </span>
                    ) : null}
                    {!inSetPr && !set.rpe && (
                      <div className="flex min-w-0 flex-wrap items-center justify-end gap-0.5">
                        {(['easy', 'med', 'hard'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => onRate(setIdx, r)}
                            className="house-state min-h-[44px] tap-target"
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
                    <SetRpe10Select
                      rpe10={set.rpe10}
                      onRateRpe10={(rpe10) => onRateRpe10(setIdx, rpe10)}
                      testId="set-table-rpe10"
                    />
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
              const parts = formatAfterCompleteParts(cite, t, restClock, knownMax, {
                rowType,
                bodyweightLabel: t('activeSetBodyweight', { defaultValue: 'BW' }),
              });
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
        rowType={rowType}
        bodyweightLabel={t('activeSetBodyweight', { defaultValue: 'BW' })}
      />
    ) : null}
    </div>
  );
}

function SetRowLoadField({
  weight,
  ariaLabel,
  onChange,
}: {
  weight: number;
  ariaLabel: string;
  onChange: (weight: number) => void;
}) {
  const [draft, setDraft] = useState(() => formatOpenLoadInput(weight));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(formatOpenLoadInput(weight));
  }, [weight, focused]);
  const commit = (raw: string) =>
    onChange(clampOpenLoadWeight(parseOpenLoadInput(raw)));
  return (
    <input
      type="text"
      inputMode="decimal"
      className={numberInput}
      value={displayOpenLoadDraft({ focused, draft, weight })}
      aria-label={ariaLabel}
      data-testid="set-table-open-load"
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
      }}
      onChange={(e) => {
        setDraft(e.target.value);
        commit(e.target.value);
      }}
      onBlur={() => {
        setFocused(false);
        commit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit(draft);
        }
      }}
    />
  );
}

function SetRowDurationField({
  seconds,
  onChange,
}: {
  seconds: number;
  onChange: (seconds: number) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(seconds > 0 ? formatSetRowDuration(seconds) : '');
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(seconds > 0 ? formatSetRowDuration(seconds) : '');
  }, [seconds, focused]);
  const commit = (raw: string) => onChange(parseDurationSeconds(raw));
  return (
    <input
      type="text"
      inputMode="decimal"
      className={numberInput}
      value={draft}
      placeholder="0:45"
      aria-label={t('activeSetTime', { defaultValue: 'Time' })}
      data-testid="set-table-duration"
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
      }}
      onChange={(e) => {
        setDraft(e.target.value);
        commit(e.target.value);
      }}
      onBlur={() => {
        setFocused(false);
        commit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit(draft);
        }
      }}
    />
  );
}

function SetRowPercentField({
  authored,
  weight,
  knownMax,
  onChange,
}: {
  authored?: number;
  weight: number;
  knownMax: number | null;
  onChange: (pct: number | undefined) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(authored != null ? String(authored) : '');
  useEffect(() => {
    setDraft(authored != null ? String(authored) : '');
  }, [authored]);
  const computed = authored == null ? loadPctOfKnownMax(knownMax, weight) : null;
  const commit = () => onChange(parseOptionalLoadPct(draft));
  return (
    <div className="mt-1 flex min-w-0 items-center gap-1">
      <input
        type="text"
        inputMode="decimal"
        data-testid="set-table-load-pct"
        className={numberInput}
        value={draft}
        placeholder={
          computed != null
            ? formatKnownMaxPct(computed) ?? '%'
            : t('activeSetPct', { defaultValue: '%' })
        }
        aria-label={t('activeSetPctAria', {
          defaultValue: 'Percent of known one-rep max. Optional.',
        })}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
      />
    </div>
  );
}

function SetRowPercentCite({
  authored,
  weight,
  knownMax,
}: {
  authored?: number;
  weight: number;
  knownMax: number | null;
}) {
  const token =
    formatKnownMaxPct(authored) ?? formatKnownMaxPct(loadPctOfKnownMax(knownMax, weight));
  if (!token) return null;
  return (
    <span
      className="ms-1 text-[11px] font-semibold tabular-nums text-muted-foreground"
      data-testid="set-table-load-pct-cite"
    >
      {token}
    </span>
  );
}

function SetRowWorkClock({
  kind,
  remaining,
  onStart,
  onStop,
}: {
  kind: WorkClockKind | null;
  remaining: number;
  onStart: (kind: WorkClockKind, seconds?: number) => void;
  onStop?: () => void;
}) {
  const { t } = useTranslation();
  const chip = 'house-state min-h-[44px] tap-target';

  if (!kind) {
    return (
      <div
        className="flex flex-wrap items-center gap-1"
        data-testid="set-row-work-clock-start"
        role="group"
        aria-label={t('activeWorkClockStartAria', { defaultValue: 'Optional interval or countdown' })}
      >
        <button
          type="button"
          className={chip}
          data-testid="set-row-work-clock-emom"
          onClick={() => onStart('interval')}
          aria-label={t('activeWorkClockEmomAria', { defaultValue: 'Start EMOM minute' })}
        >
          {t('activeWorkClockEmom', { defaultValue: 'EMOM' })}
        </button>
        <button
          type="button"
          className={chip}
          data-testid="set-row-work-clock-amrap"
          onClick={() => onStart('countdown')}
          aria-label={t('activeWorkClockAmrapAria', { defaultValue: 'Start AMRAP window' })}
        >
          {t('activeWorkClockAmrap', { defaultValue: 'AMRAP' })}
        </button>
      </div>
    );
  }

  const clock = formatWorkClock(remaining);
  const kindLabel =
    kind === 'interval'
      ? t('activeWorkClockEmom', { defaultValue: 'EMOM' })
      : t('activeWorkClockAmrap', { defaultValue: 'AMRAP' });

  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-1"
      data-testid="set-row-work-clock"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={t('activeWorkClockRunningAria', {
        kind: kindLabel,
        clock,
        defaultValue: '{{kind}} {{clock}}',
      })}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {kindLabel}
      </span>
      <span
        className="font-extrabold tabular-nums text-foreground"
        data-testid="set-row-work-clock-digits"
      >
        {clock}
      </span>
      {kind === 'countdown'
        ? AMRAP_PRESETS.map((sec) => (
            <button
              key={sec}
              type="button"
              className={chip}
              data-testid={`set-row-work-clock-preset-${sec}`}
              onClick={() => onStart('countdown', sec)}
            >
              {sec / 60}m
            </button>
          ))
        : null}
      {onStop ? (
        <button
          type="button"
          className={chip}
          data-testid="set-row-work-clock-stop"
          onClick={onStop}
          aria-label={t('activeWorkClockStopAria', { defaultValue: 'Stop clock' })}
        >
          {t('activeWorkClockStop', { defaultValue: 'Stop' })}
        </button>
      ) : null}
    </div>
  );
}

function SetRowTagChips({
  kind,
  onPick,
}: {
  kind: SetKind;
  onPick: (tag: (typeof SET_ROW_TAGS)[number]) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-wrap items-center gap-1"
      data-testid="set-table-set-tags"
      role="group"
      aria-label={t('activeSetKindMore', { defaultValue: 'Kind' })}
    >
      {SET_ROW_TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={kind === tag}
          data-testid={`set-table-tag-${tag}`}
          onClick={() => onPick(tag)}
          className={cn(
            'house-state min-h-[44px] tap-target',
            kind === tag && 'is-on'
          )}
        >
          {t(setKindLabelKey(tag), { defaultValue: setKindDefaultLabel(tag) })}
        </button>
      ))}
    </div>
  );
}
