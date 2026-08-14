'use client';

/**
 * Per-lift vs-last receipt on Victory — Hevy logged-out workout body:
 * Set · Prev · Load · vs last, PR. Presentation only; numbers from
 * buildVictoryReceipt. Prev is the actual last-time load, not only a delta.
 */

import { useTranslation } from 'react-i18next';
import type { VictoryReceipt } from '@/lib/workout/victoryReceipt';
import {
  formatReceiptSetLoad,
  formatReceiptSigned,
  receiptSetDeltas,
} from '@/lib/workout/victoryReceipt';
import { setKindDefaultLabel } from '@/lib/workout/setKind';

type Props = {
  receipt: VictoryReceipt;
  unitLabel: string;
};

const headCell =
  'py-1.5 pe-2 text-start text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground';

function SetDeltaCell({
  set,
  unitLabel,
}: {
  set: VictoryReceipt['exercises'][number]['sets'][number];
  unitLabel: string;
}) {
  const { t } = useTranslation();
  const d = receiptSetDeltas(set);
  const parts: string[] = [];
  if (d.weight !== null) {
    parts.push(
      t('victoryDeltaWeight', {
        signed: formatReceiptSigned(d.weight),
        unit: unitLabel,
        defaultValue: `${formatReceiptSigned(d.weight)} ${unitLabel}`,
      })
    );
  }
  if (d.reps !== null) {
    parts.push(
      t('victoryDeltaReps', {
        signed: formatReceiptSigned(d.reps),
        count: Math.abs(d.reps),
        defaultValue: `${formatReceiptSigned(d.reps)} reps`,
      })
    );
  }
  if (parts.length === 0) return <span className="text-muted-foreground">—</span>;
  return <span className="text-muted-foreground tabular-nums">{parts.join(' · ')}</span>;
}

export function VictoryReceiptStrip({ receipt, unitLabel }: Props) {
  const { t } = useTranslation();

  if (receipt.exercises.length === 0) return null;

  return (
    <section
      className="space-y-4 border-t-2 border-border pt-3"
      aria-label={t('victoryReceiptLabel', { defaultValue: 'This session' })}
      data-testid="victory-receipt"
    >
      <div className="flex items-baseline justify-between gap-2 px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {t('victoryReceiptLabel', { defaultValue: 'This session' })}
        </p>
        {receipt.prCount > 0 ? (
          <p className="text-xs font-semibold tabular-nums text-primary" data-testid="victory-pr-count">
            {receipt.prCount === 1
              ? t('victoryPrsOne', { defaultValue: '1 PR' })
              : t('victoryPrsMany', {
                  count: receipt.prCount,
                  defaultValue: `${receipt.prCount} PRs`,
                })}
          </p>
        ) : null}
      </div>

      {receipt.exercises.map((ex, exIdx) => {
        const showVs = ex.sets.some((s) => s.priorReps !== null);
        return (
          <div key={`${ex.exerciseId}-${exIdx}`} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 px-1">
              <h3 className="text-sm font-semibold text-foreground">{ex.exerciseName}</h3>
              {ex.prs.length > 0 ? (
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                  {t('victoryPrBadge', { defaultValue: 'PR' })}
                </span>
              ) : null}
            </div>
            {ex.note ? (
              <p className="px-1 text-xs italic text-muted-foreground">{ex.note}</p>
            ) : null}
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                {t('victoryReceiptSetsCaption', {
                  name: ex.exerciseName,
                  defaultValue: `${ex.exerciseName} sets`,
                })}
              </caption>
              <thead>
                <tr className="border-b-2 border-border">
                  <th scope="col" className={`${headCell} w-8`}>
                    {t('activeColSet', { defaultValue: 'Set' })}
                  </th>
                  {showVs ? (
                    <th scope="col" className={headCell}>
                      {t('activeColPrev', { defaultValue: 'Prev' })}
                    </th>
                  ) : null}
                  <th scope="col" className={headCell}>
                    {t('victoryReceiptLoad', { defaultValue: 'Load' })}
                  </th>
                  {showVs ? (
                    <th scope="col" className={`${headCell} pe-0 text-end`}>
                      {t('victoryVsLast', { defaultValue: 'vs last' })}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((set) => (
                  <tr key={set.setIndex} className="tabular-nums">
                    <td className="w-8 py-1.5 pe-2 align-top text-muted-foreground">
                      {set.setIndex + 1}
                      {set.kind && set.kind !== 'normal' ? (
                        <span className="ms-1 text-[10px] uppercase">
                          {setKindDefaultLabel(set.kind)}
                        </span>
                      ) : null}
                    </td>
                    {showVs ? (
                      <td
                        className="py-1.5 pe-2 align-top text-muted-foreground"
                        data-testid="victory-prev"
                      >
                        {set.priorReps !== null && set.priorWeight !== null
                          ? formatReceiptSetLoad(set.priorReps, set.priorWeight)
                          : '—'}
                      </td>
                    ) : null}
                    <td className="py-1.5 pe-2 align-top font-semibold text-foreground">
                      {formatReceiptSetLoad(set.reps, set.weight)}
                      {set.isPr ? (
                        <span className="ms-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                          {t('victoryPrBadge', { defaultValue: 'PR' })}
                        </span>
                      ) : null}
                    </td>
                    {showVs ? (
                      <td className="py-1.5 align-top text-end text-xs">
                        <SetDeltaCell set={set} unitLabel={unitLabel} />
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </section>
  );
}
