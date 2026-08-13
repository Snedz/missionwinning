'use client';

/**
 * The logger's one console — the only place a set is entered (compact).
 *
 * Strong/Hevy density on ink: metric steppers under the thumb, one poster-red
 * Log set, no filled accent chrome competing with it (kind / Use next stay
 * outline-ink). Kind strip collapses to Work + expand so Log stays in the
 * easy thumb zone (F-003 / MatrAIx).
 *
 * See: src/components/workout/INDEX.md
 */

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { SetKind, SetSide } from '@/types';
import { setKindDefaultLabel, setKindLabelKey } from '@/lib/workout/setKind';
import {
  SET_SIDES,
  setSideDefaultLabel,
  setSideLabelKey,
} from '@/lib/workout/unilateral';
import {
  activeSetOfParams,
  shouldOfferUseNext,
  shouldShowSetKindExpand,
  visibleSetKinds,
} from '@/lib/workout/loggerSpeed';

/** Progressive-overload strip under the exercise name (last · next · why). */
export type LogConsoleOverloadCue = {
  lastLine?: string | null;
  nextLine?: string | null;
  reasonLine?: string | null;
  /** Numeric next target for one-tap fill (gym speed). */
  nextTarget?: { reps: number; weight: number } | null;
};

type Props = {
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  /**
   * @deprecated Prefer `overloadCue` — single last-time line only.
   * Kept so callers without next/reason still work.
   */
  targetLine?: string | null;
  /** Last · next · why — gym-speed progressive overload (industry table stakes). */
  overloadCue?: LogConsoleOverloadCue | null;
  reps: number;
  weight: number;
  weightLabel: string;
  weightStep: number;
  kind: SetKind;
  /** True when this exercise is unilateral — L/R/Alt chips. */
  unilateral?: boolean;
  side?: SetSide;
  onSideChange?: (side: SetSide | undefined) => void;
  onRepsChange: (reps: number) => void;
  onWeightChange: (weight: number) => void;
  onKindChange: (kind: SetKind) => void;
  onLog: () => void;
  /** Fill console from progressive-overload / coach next target. */
  onUseNext?: (target: { reps: number; weight: number }) => void;
};

/** 48 × 52px, 2px light rule — the ink ground needs a lighter border than paper. */
const stepper =
  'flex h-[52px] w-12 shrink-0 items-center justify-center text-neutral-100 transition-colors hover:bg-neutral-800 active:bg-neutral-700';

/** Selected kind / secondary CTA on ink — never filled accent (Log set owns red). */
const inkChip =
  'min-h-[44px] border-2 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors tap-target';

function Field({
  label,
  value,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  inputLabel,
  onInput,
  onSubmit,
  inputMode,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseLabel: string;
  increaseLabel: string;
  inputLabel: string;
  onInput: (raw: string) => void;
  /** Enter / Go on the soft keyboard logs the set (gym speed). */
  onSubmit?: () => void;
  inputMode: 'numeric' | 'decimal';
}) {
  return (
    <div className="min-w-0 flex-1">
      <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
        {label}
      </span>
      <div className="flex items-stretch border-2 border-neutral-700">
        <button type="button" className={stepper} aria-label={decreaseLabel} onClick={onDecrease}>
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <input
          type="text"
          inputMode={inputMode}
          enterKeyHint="done"
          value={value}
          aria-label={inputLabel}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSubmit) {
              e.preventDefault();
              onSubmit();
            }
          }}
          className="h-[52px] min-w-0 flex-1 bg-foreground text-center text-[26px] font-extrabold tabular-nums text-neutral-100"
        />
        <button type="button" className={stepper} aria-label={increaseLabel} onClick={onIncrease}>
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function LogConsole({
  exerciseName,
  setNumber,
  totalSets,
  targetLine,
  overloadCue,
  reps,
  weight,
  weightLabel,
  weightStep,
  kind,
  unilateral = false,
  side,
  onSideChange,
  onRepsChange,
  onWeightChange,
  onKindChange,
  onLog,
  onUseNext,
}: Props) {
  const { t } = useTranslation();
  /** Outdoor default: Work only. Expand once to pick warmup/fail/drop. */
  const [kindsExpanded, setKindsExpanded] = useState(false);
  const lastLine = overloadCue?.lastLine ?? null;
  const nextLine = overloadCue?.nextLine ?? null;
  const reasonLine = overloadCue?.reasonLine ?? null;
  const nextTarget = overloadCue?.nextTarget ?? null;
  const hasStructured = !!(lastLine || nextLine || reasonLine);
  const legacyLine = !hasStructured ? targetLine : null;
  const offerUseNext =
    !!onUseNext && shouldOfferUseNext(reps, weight, nextTarget ?? undefined);
  const kindOptions = visibleSetKinds(kind, kindsExpanded);
  const showKindExpand = shouldShowSetKindExpand(kind, kindsExpanded);

  return (
    <div
      className="border-t-2 border-neutral-900 bg-neutral-900 px-3 pb-3 pt-2.5 text-neutral-100"
      data-testid="log-console"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[15px] font-extrabold">{exerciseName}</span>
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] tabular-nums text-neutral-400">
          {t('activeSetOf', {
            ...activeSetOfParams(setNumber, totalSets),
            defaultValue: `Set ${setNumber} of ${totalSets}`,
          })}
        </span>
      </div>

      {hasStructured ? (
        <div className="mt-1 space-y-0.5 text-xs tabular-nums leading-snug">
          {lastLine ? (
            <p className="truncate text-neutral-400">
              <span className="me-1.5 font-semibold uppercase tracking-[0.06em] text-neutral-500">
                {t('activeOverloadLastLabel', { defaultValue: 'Last' })}
              </span>
              {lastLine}
            </p>
          ) : null}
          {nextLine ? (
            <p className="truncate text-neutral-100">
              <span className="me-1.5 font-semibold uppercase tracking-[0.06em] text-neutral-400">
                {t('activeOverloadNextLabel', { defaultValue: 'Next' })}
              </span>
              {nextLine}
              {reasonLine ? (
                <span className="text-neutral-500"> · {reasonLine}</span>
              ) : null}
            </p>
          ) : reasonLine && !nextLine ? (
            <p className="truncate text-neutral-500">{reasonLine}</p>
          ) : null}
        </div>
      ) : legacyLine ? (
        <p className="mt-1 truncate text-xs tabular-nums text-neutral-400">{legacyLine}</p>
      ) : null}

      {offerUseNext && nextTarget ? (
        <button
          type="button"
          onClick={() => onUseNext!(nextTarget)}
          className="mt-1.5 min-h-[44px] w-full border-2 border-neutral-500 px-3 text-start text-sm font-semibold text-neutral-100 tap-target hover:bg-neutral-800"
          data-testid="log-console-use-next"
        >
          {t('activeUseNextTarget', {
            defaultValue: 'Use next target',
          })}
        </button>
      ) : null}

      {/* Set kind: outdoor path collapses to Work + expand so reps/weight/Log
          stay in the thumb zone. Selected = ink fill, never accent fill. */}
      <div
        id="log-console-set-kinds"
        className="mt-2 flex flex-wrap gap-1"
        data-testid="log-console-set-kinds"
      >
        {kindOptions.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => onKindChange(k)}
            aria-label={t(setKindLabelKey(k), {
              defaultValue: k === 'normal' ? 'Work' : setKindDefaultLabel(k),
            })}
            className={cn(
              inkChip,
              kind === k
                ? 'border-neutral-100 bg-neutral-100 text-neutral-900'
                : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            )}
          >
            {t(setKindLabelKey(k), {
              defaultValue: k === 'normal' ? 'Work' : setKindDefaultLabel(k),
            })}
          </button>
        ))}
        {showKindExpand ? (
          <button
            type="button"
            onClick={() => setKindsExpanded(true)}
            className={cn(inkChip, 'border-neutral-700 text-neutral-300 hover:bg-neutral-800')}
            data-testid="log-console-expand-kinds"
            aria-expanded={false}
            aria-controls="log-console-set-kinds"
          >
            {t('activeSetKindMore', { defaultValue: 'Kind' })}
          </button>
        ) : null}
      </div>

      {unilateral && onSideChange ? (
        <div
          className="mt-1 flex flex-wrap gap-1"
          data-testid="log-console-set-side"
          role="group"
          aria-label={t('activeSetSideAria', { defaultValue: 'Set side' })}
        >
          {SET_SIDES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={side === s}
              onClick={() => onSideChange(side === s ? undefined : s)}
              className={cn(
                inkChip,
                side === s
                  ? 'border-neutral-100 bg-neutral-100 text-neutral-900'
                  : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
              )}
            >
              {t(setSideLabelKey(s), { defaultValue: setSideDefaultLabel(s) })}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex items-end gap-2.5">
        <Field
          label={t('activeReps', { defaultValue: 'Reps' })}
          value={reps}
          inputMode="numeric"
          inputLabel={t('activeReps', { defaultValue: 'Reps' })}
          decreaseLabel={t('activeDecreaseReps', { defaultValue: 'Decrease reps' })}
          increaseLabel={t('activeIncreaseReps', { defaultValue: 'Increase reps' })}
          onDecrease={() => onRepsChange(Math.max(1, reps - 1))}
          onIncrease={() => onRepsChange(reps + 1)}
          onSubmit={onLog}
          onInput={(raw) => {
            const parsed = parseInt(raw.replace(/\D/g, ''), 10);
            onRepsChange(Number.isFinite(parsed) ? Math.min(999, Math.max(1, parsed)) : 1);
          }}
        />
        {weight <= 0 ? (
          <div className="min-w-0 flex-1">
            <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
              {weightLabel}
            </span>
            <button
              type="button"
              onClick={() => onWeightChange(weightStep > 0 ? weightStep : 5)}
              className="flex h-[52px] w-full items-center justify-center border-2 border-neutral-700 bg-foreground text-[22px] font-extrabold text-neutral-100 tap-target"
              aria-label={t('activeSetBodyweightAddLoad', {
                defaultValue: 'Bodyweight — tap to add load',
              })}
            >
              {t('activeSetBodyweight', { defaultValue: 'BW' })}
            </button>
          </div>
        ) : (
          <Field
            label={weightLabel}
            value={weight}
            inputMode="decimal"
            inputLabel={weightLabel}
            decreaseLabel={t('activeDecreaseWeight', {
              unit: weightLabel,
              defaultValue: `Decrease ${weightLabel}`,
            })}
            increaseLabel={t('activeIncreaseWeight', {
              unit: weightLabel,
              defaultValue: `Increase ${weightLabel}`,
            })}
            onDecrease={() => onWeightChange(Math.max(0, weight - weightStep))}
            onIncrease={() => onWeightChange(weight + weightStep)}
            onSubmit={onLog}
            onInput={(raw) => {
              const cleaned = raw.replace(',', '.').replace(/[^0-9.]/g, '');
              const parsed = parseFloat(cleaned);
              onWeightChange(Number.isFinite(parsed) ? Math.min(9999, Math.max(0, parsed)) : 0);
            }}
          />
        )}
      </div>

      {/* Sole poster-red primary on the hero Active log path (compact dock). */}
      <button
        type="button"
        onClick={onLog}
        data-testid="log-console-log-set"
        className="primary-action mt-2.5 flex min-h-[52px] w-full items-center gap-2 bg-[hsl(var(--accent-poster))] px-4 text-[19px] font-extrabold text-background transition-colors hover:bg-[hsl(var(--primary-fill))]"
      >
        <span className="flex-1 text-start">{t('activeLogSet', { defaultValue: 'Log set' })}</span>
        <Check className="h-5 w-5 shrink-0" aria-hidden />
      </button>
    </div>
  );
}
