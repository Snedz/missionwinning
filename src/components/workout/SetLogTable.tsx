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
 * Completed rows mirror compact `SetLogRow` cues (primary edge, check, a11y).
 */

import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { LoggedSet, SetKind } from '@/types';
import { setKindBadgeClass, setKindDefaultLabel, setKindLabelKey } from '@/lib/workout/setKind';
import { rpeDefaultLabel, rpeLabelKey } from '@/lib/workout/rpeLabel';
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
  'h-11 min-h-[44px] border-2 border-border bg-background px-2 text-center text-sm font-semibold tabular-nums ' +
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
          <th scope="col" className={cn(cell, 'w-[110px]')}>
            <span className="sr-only">{t('activeColAction', { defaultValue: 'Action' })}</span>
          </th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {sets.map((set, setIdx) => {
          const isActive = setIdx === activeSetIdx;
          const kind = set.kind ?? ('normal' as SetKind);
          const completed = Boolean(set.completed);

          return (
            <tr
              key={set.id}
              data-set-complete={completed ? 'true' : 'false'}
              className={cn(
                'border-b border-border',
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
                    <button
                      type="button"
                      onClick={onLog}
                      className="primary-action min-h-[44px] tap-target bg-primary-fill px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[hsl(var(--primary-fill-hover))]"
                    >
                      {t('activeLogSet', { defaultValue: 'Log set' })}
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className={cn(cell, completed && 'font-semibold')}>
                    {completed ? set.weight : '—'}
                  </td>
                  <td className={cn(cell, completed && 'font-semibold')}>
                    {completed ? set.reps : set.reps}
                  </td>
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
                      {completed && !set.isPr && !set.rpe && (
                        <div className="flex items-center gap-0.5">
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
                      {completed && set.rpe && (
                        <span className="text-[11px] text-muted-foreground">
                          {t(rpeLabelKey(set.rpe), {
                            defaultValue: rpeDefaultLabel(set.rpe),
                          })}
                        </span>
                      )}
                      {completed && (
                        <>
                          <Check
                            className="h-4 w-4 shrink-0 text-primary"
                            aria-hidden
                            data-testid="set-table-logged-check"
                          />
                          <span className="sr-only">
                            {t('activeSetLoggedSr', { defaultValue: 'Logged' })}
                          </span>
                        </>
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
