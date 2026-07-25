'use client';

import { useState } from 'react';
import { brzycki1rm, epley1rm } from '@/lib/calcHelpers';
import {
  CalcField,
  Seg,
  displayWeight,
  toKg,
  type CalcUnits,
} from '@/components/calculators/publicCalcUi';

/**
 * Public 1RM estimator (Calculator 1RM mockup): Epley headline, Brzycki as the
 * honesty check, and the working-weight table 1–12 as percentages of the
 * estimated single. Kilograms internally; live recompute.
 */
export function PublicOneRmCalculator() {
  const [units, setUnits] = useState<CalcUnits>('kg');
  const [weightKg, setWeightKg] = useState(100);
  const [reps, setReps] = useState(5);

  const unitLabel = units;
  const w = displayWeight(weightKg, units);
  const e1rm = epley1rm(w, reps);
  const alt = brzycki1rm(w, reps);

  const repRows = Array.from({ length: 12 }, (_, i) => {
    const r = i + 1;
    const pct = 1 / (1 + r / 30);
    return { reps: r, pct: Math.round(pct * 100), weight: displayWeight(toKg(e1rm * pct, units), units) };
  });

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-5">
        <p className="eyebrow-live">The set you did</p>
        <Seg
          name="rm-units"
          legend="Units"
          value={units}
          options={[
            { value: 'kg', label: 'kg' },
            { value: 'lb', label: 'lb' },
          ]}
          onChange={setUnits}
        />
        <div className="grid max-w-md grid-cols-2 gap-5">
          <CalcField
            id="rm-w"
            label={`Weight (${unitLabel})`}
            value={w}
            onChange={(v) => Number.isFinite(v) && setWeightKg(toKg(v, units))}
            min={1}
            max={999}
            step={0.5}
          />
          <CalcField
            id="rm-r"
            label="Reps (1–12)"
            value={reps}
            onChange={(v) => Number.isFinite(v) && setReps(Math.min(Math.max(Math.round(v), 1), 12))}
            min={1}
            max={12}
          />
        </div>
        <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Best from a hard set of 1–10 reps. Heavier sets estimate more reliably; a set of 12 is
          the honest ceiling for this math.
        </p>
      </div>

      <div aria-live="polite">
        <p className="eyebrow-live mb-2">Estimated one-rep max</p>
        <p className="display-mega text-poster tabular-nums">
          {e1rm} <span className="text-2xl text-muted-foreground">{unitLabel}</span>
        </p>
        {alt !== e1rm && (
          <p className="mt-3 text-sm tabular-nums text-muted-foreground">
            Brzycki cross-check: {alt} {unitLabel}. When the two disagree, the truth is usually
            between them.
          </p>
        )}
        <table className="mt-7 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border text-left">
              <th className="py-2 pr-2 font-semibold">Reps</th>
              <th className="py-2 pr-2 text-right font-semibold">% of 1RM</th>
              <th className="py-2 text-right font-semibold">Weight ({unitLabel})</th>
            </tr>
          </thead>
          <tbody>
            {repRows.map((row) => (
              <tr
                key={row.reps}
                className={
                  row.reps === reps
                    ? 'border-b border-border bg-tint font-semibold'
                    : 'border-b border-border'
                }
              >
                <td className="py-2 pr-2 tabular-nums">{row.reps}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{row.pct}%</td>
                <td className="py-2 text-right tabular-nums">{row.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          Epley: weight × (1 + reps/30). A calculator is a starting point — test a real single
          only when trained for it, with a spotter or safeties.
        </p>
      </div>
    </div>
  );
}
