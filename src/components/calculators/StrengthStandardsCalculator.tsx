'use client';

import { useState } from 'react';
import {
  STANDARDS_LIFT_NAMES,
  standardsResult,
  type StandardsLift,
  type StandardsSex,
} from '@/lib/strengthStandards';
import { getAthleteSex, setAthleteSex } from '@/lib/athleteSex';
import {
  CalcField,
  Seg,
  displayWeight,
  toKg,
  type CalcUnits,
} from '@/components/calculators/publicCalcUi';

/**
 * Public strength-standards calculator (Calculator Strength Standards mockup).
 * Kilograms internally; converted at the input/display edge. Live recompute —
 * every keystroke re-renders the ladder, no submit.
 */
export function StrengthStandardsCalculator() {
  const [units, setUnits] = useState<CalcUnits>('kg');
  const [sex, setSexState] = useState<StandardsSex | null>(() => getAthleteSex());
  const [lift, setLift] = useState<StandardsLift>('squat');
  const [bodyweightKg, setBodyweightKg] = useState(78);
  const [weightKg, setWeightKg] = useState(100);
  const [reps, setReps] = useState(5);

  const setSex = (s: StandardsSex) => {
    setSexState(s);
    setAthleteSex(s);
  };

  const result =
    sex != null ? standardsResult({ sex, lift, bodyweightKg, weightKg, reps }) : null;
  const unitLabel = units;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-5">
        <p className="eyebrow-live">You and the set</p>
        <Seg
          name="ss-units"
          legend="Units"
          value={units}
          options={[
            { value: 'kg', label: 'kg' },
            { value: 'lb', label: 'lb' },
          ]}
          onChange={setUnits}
        />
        <Seg
          name="ss-sex"
          legend="Sex"
          value={sex}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
          onChange={setSex}
        />
        {sex == null && (
          <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Select sex for the correct ladder — female and male standards differ. We do not assume
            male.
          </p>
        )}
        <CalcField
          id="ss-bw"
          label={`Bodyweight (${unitLabel})`}
          value={displayWeight(bodyweightKg, units)}
          onChange={(v) => Number.isFinite(v) && setBodyweightKg(toKg(v, units))}
          min={35}
          max={550}
          step={0.5}
        />
        <Seg
          name="ss-lift"
          legend="Lift"
          value={lift}
          options={[
            { value: 'squat', label: 'Squat' },
            { value: 'bench', label: 'Bench' },
            { value: 'deadlift', label: 'Deadlift' },
            { value: 'press', label: 'Press' },
          ]}
          onChange={setLift}
        />
        <div className="grid max-w-md grid-cols-2 gap-5">
          <CalcField
            id="ss-w"
            label={`Weight lifted (${unitLabel})`}
            value={displayWeight(weightKg, units)}
            onChange={(v) => Number.isFinite(v) && setWeightKg(toKg(v, units))}
            min={1}
            max={999}
            step={0.5}
          />
          <CalcField
            id="ss-r"
            label="Reps (1–12)"
            value={reps}
            onChange={(v) => Number.isFinite(v) && setReps(Math.min(Math.max(Math.round(v), 1), 12))}
            min={1}
            max={12}
          />
        </div>
        <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Multi-rep sets convert to an estimated single via Epley — the same math as the{' '}
          <a href="/calculators/1rm" className="underline underline-offset-2 hover:text-primary">
            1RM calculator
          </a>
          .
        </p>
      </div>

      <div aria-live="polite">
        {result == null || sex == null ? (
          <p className="max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground">
            Choose sex to grade this set against the correct standards ladder.
          </p>
        ) : (
          <>
            <p className="eyebrow-live mb-2 tabular-nums">
              {STANDARDS_LIFT_NAMES[lift]} · {sex === 'female' ? 'Female' : 'Male'} standards · e1RM{' '}
              {displayWeight(result.oneRmKg, units)} {unitLabel} · {result.ratio.toFixed(2)}×
              bodyweight
            </p>
            <p className="display-mega text-poster">{result.levelLabel}</p>
            <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground">
              {result.nextLevel === undefined
                ? 'Top of this ladder. Keep the log honest and enjoy the view.'
                : `${displayWeight(result.toNextKg ?? 0, units)} ${unitLabel} on the estimated single to reach ${result.nextLevel} at this bodyweight.`}
            </p>
            <table className="mt-7 w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border text-left">
                  <th className="py-2 pr-2 font-semibold">Level</th>
                  <th className="py-2 pr-2 text-right font-semibold">× bodyweight</th>
                  <th className="py-2 text-right font-semibold">Threshold ({unitLabel})</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.level}
                    className={
                      row.current
                        ? 'border-b border-border bg-tint font-semibold'
                        : 'border-b border-border'
                    }
                  >
                    <td className="py-2 pr-2">{row.level}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{row.multiplier}×</td>
                    <td className="py-2 text-right tabular-nums">
                      {displayWeight(row.thresholdKg, units)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              Population-level conventions for adults, barbell lifts, full range of motion. Age,
              limb lengths, and training history all bend the ladder — the trend in your own log
              matters more than the label.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
