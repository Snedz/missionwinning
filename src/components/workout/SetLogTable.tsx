'use client';

/**
 * The desktop logger's set list — a table, per handoff 2.
 *
 * The desktop app and the mobile app are two designs (see
 * `src/hooks/useIsCompact.ts`). On a phone, entry is one docked `LogConsole`,
 * because ~340px of steppers does not fit in 326px of content. A 1440px window
 * has no such constraint, and the desktop handoff draws the thing that fits it:
 * every set on one row, the active row carrying its own inputs and its own
 * Log set, so the whole exercise is legible at a glance and nothing is docked.
 *
 * The mock's markup is the spec:
 *
 *   <table class="table" style="max-width:640px">
 *     <thead><tr><th width:44>Set</th><th>Prev</th>
 *                <th width:90>kg</th><th width:80>Reps</th><th width:110></th></tr>
 *     active row: background accent-100 + box-shadow inset 2px 0 0 accent
 *                 inputs 72px / 60px, inline `btn-primary` Log set
 *
 * Column order is the mock's — Prev before the inputs, so the number you are
 * beating is read before the number you are typing.
 */

import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { LoggedSet, SetKind } from '@/types';
import { setKindBadgeClass, setKindDefaultLabel, setKindLabelKey } from '@/lib/workout/setKind';
import { cn } from '@/lib/utils';

type Props = {
  sets: LoggedSet[];
  /** Index of the set the logger is holding, or -1 when the exercise is done. */
  activeSetIdx: number;
  weightLabel: string;
  /** "8 × 60" for each set index, when a previous performance exists. */
  prevLabels: (string | null)[];
  input: { reps: number; weight: number };
  onInputChange: (field: 'reps' | 'weight', value: number) => void;
  onLog: () => void;
  onRate: (setIdx: number, rpe: 'easy' | 'med' | 'hard') => void;
};

const cell = 'px-2 py-2 align-middle';

/** 2px rules and radius 0 come from the system; width is the mock's. */
const numberInput =
  'h-9 border-2 border-border bg-background px-2 text-center text-sm font-semibold tabular-nums ' +
  'focus:outline-none focus:ring-2 focus:ring-ring';

export function SetLogTable({
  sets,
  activeSetIdx,
  weightLabel,
  prevLabels,
  input,
  onInputChange,
  onLog,
  onRate,
}: Props) {
  const { t } = useTranslation();

  return (
    <table className="w-full max-w-[640px] border-collapse text-sm">
      <thead>
        <tr className="border-b-2 border-border text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <th scope="col" className={cn(cell, 'w-11 text-start')}>
            {t('activeColSet', { defaultValue: 'Set' })}
          </th>
          <th scope="col" className={cn(cell, 'text-start')}>
            {t('activeColPrev', { defaultValue: 'Prev' })}
          </th>
          <th scope="col" className={cn(cell, 'w-[90px] text-start')}>
            {weightLabel}
          </th>
          <th scope="col" className={cn(cell, 'w-20 text-start')}>
            {t('activeColReps', { defaultValue: 'Reps' })}
          </th>
          {/* Empty header over the action column — the mock's `width:110` th.
              Labelled for screen readers rather than left silent. */}
          <th scope="col" className={cn(cell, 'w-[110px]')}>
            <span className="sr-only">{t('activeColAction', { defaultValue: 'Action' })}</span>
          </th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {sets.map((set, setIdx) => {
          const isActive = setIdx === activeSetIdx;
          const kind = set.kind ?? ('normal' as SetKind);

          return (
            <tr
              key={set.id}
              className={cn(
                'border-b border-border',
                // The mock's `background:accent-100; box-shadow:inset 2px 0 0 accent`.
                // `is-active-row` already carries exactly that pair.
                isActive ? 'is-active-row' : 'text-muted-foreground'
              )}
            >
              <th
                scope="row"
                className={cn(cell, 'text-start', isActive ? 'font-extrabold' : 'font-normal')}
              >
                {setIdx + 1}
              </th>

              <td className={cn(cell, 'text-muted-foreground')}>{prevLabels[setIdx] ?? '—'}</td>

              {isActive ? (
                <>
                  <td className={cell}>
                    <input
                      type="text"
                      inputMode="decimal"
                      className={cn(numberInput, 'w-[72px]')}
                      value={input.weight}
                      aria-label={weightLabel}
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
                  </td>
                  <td className={cell}>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={cn(numberInput, 'w-[60px]')}
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
                    {/* `--primary-fill`, not poster: this label is 14px, and
                        poster red only clears AA at display sizes. */}
                    <button
                      type="button"
                      onClick={onLog}
                      className="min-h-[36px] bg-primary-fill px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[hsl(var(--primary-fill-hover))]"
                    >
                      {t('activeLogSet', { defaultValue: 'Log set' })}
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className={cell}>{set.completed ? set.weight : '—'}</td>
                  <td className={cell}>{set.completed ? set.reps : set.reps}</td>
                  <td className={cn(cell, 'text-end')}>
                    <div className="flex items-center justify-end gap-1.5">
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
                      {/* Rating stays available on desktop — it is the input
                          Coach learns from, and losing it here would make the
                          two surfaces differ in data, not just in layout. */}
                      {set.completed && !set.isPr && !set.rpe && (
                        <div className="flex items-center gap-0.5">
                          {(['easy', 'med', 'hard'] as const).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => onRate(setIdx, r)}
                              className="border-2 border-border px-1.5 py-0.5 text-[11px] font-semibold hover:bg-accent-100"
                            >
                              {t(
                                r === 'easy'
                                  ? 'activeRpeEasy'
                                  : r === 'med'
                                    ? 'activeRpeMed'
                                    : 'activeRpeHard',
                                { defaultValue: r }
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {set.completed && set.rpe && (
                        <span className="text-[11px] capitalize text-muted-foreground">
                          {set.rpe}
                        </span>
                      )}
                      {set.completed && (
                        <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      )}
                    </div>
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
