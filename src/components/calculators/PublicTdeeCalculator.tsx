'use client';

import { useState } from 'react';
import {
  mifflinBmr,
  ACTIVITY_LEVELS,
  defaultCalcInputs,
  type CalcSex,
} from '@/lib/calcHelpers';
import { getAthleteSex, setAthleteSex } from '@/lib/athleteSex';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import {
  CalcField,
  Seg,
  displayWeight,
  toKg,
  type CalcUnits,
} from '@/components/calculators/publicCalcUi';

const ACTIVITY_LABELS: Record<(typeof ACTIVITY_LEVELS)[number]['key'], string> = {
  sedentary: 'Desk',
  light: 'Light',
  moderate: 'Moderate',
  active: 'Hard',
};

type Goal = 'cut' | 'maintain' | 'bulk';

/**
 * Public TDEE + macros (Calculator TDEE mockup): Mifflin-St Jeor BMR ×
 * activity; goal −15% / +10%; protein 1.8 g/kg first, fat 25% of calories,
 * carbs the remainder (handoff spec — deliberately a touch higher protein
 * than the in-app Fuel default). Metric internally; live recompute.
 */
export function PublicTdeeCalculator() {
  const fmt = useLocaleFormat();
  const initialSex = getAthleteSex();
  const seed = defaultCalcInputs('metric', initialSex);
  const [units, setUnits] = useState<CalcUnits>('kg');
  const [sex, setSexState] = useState<CalcSex | null>(() => initialSex);
  const [age, setAge] = useState(28);
  const [heightCm, setHeightCm] = useState(seed.height);
  const [bodyweightKg, setBodyweightKg] = useState(seed.bw);
  const [activity, setActivity] = useState<number>(1.55);
  const [goal, setGoal] = useState<Goal>('maintain');

  const setSex = (s: CalcSex) => {
    setSexState(s);
    setAthleteSex(s);
    const next = defaultCalcInputs('metric', s);
    setHeightCm(next.height);
    setBodyweightKg(next.bw);
  };

  const bmr = sex != null ? mifflinBmr(bodyweightKg, heightCm, age, 'metric', sex) : null;
  const tdee = bmr != null ? Math.round(bmr * activity) : null;
  const cals =
    tdee == null
      ? null
      : goal === 'cut'
        ? Math.round(tdee * 0.85)
        : goal === 'bulk'
          ? Math.round(tdee * 1.1)
          : tdee;
  const protein = Math.round(bodyweightKg * 1.8);
  const fat = cals != null ? Math.round((cals * 0.25) / 9) : null;
  const carbs =
    cals != null && fat != null
      ? Math.max(0, Math.round((cals - protein * 4 - fat * 9) / 4))
      : null;

  const unitLabel = units;
  const heightDisplay = units === 'lb' ? Math.round(heightCm / 2.54) : heightCm;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-5">
        <p className="eyebrow-live">You and your day</p>
        <Seg
          name="td-units"
          legend="Units"
          value={units}
          options={[
            { value: 'kg', label: 'kg · cm' },
            { value: 'lb', label: 'lb · in' },
          ]}
          onChange={setUnits}
        />
        <Seg
          name="td-sex"
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
            Select sex for Mifflin–St Jeor BMR. We do not assume male.
          </p>
        )}
        <div className="grid max-w-md grid-cols-2 gap-5">
          <CalcField
            id="td-age"
            label="Age"
            value={age}
            onChange={(v) => Number.isFinite(v) && setAge(Math.min(Math.max(Math.round(v), 14), 90))}
            min={14}
            max={90}
          />
          <CalcField
            id="td-h"
            label={units === 'lb' ? 'Height (in)' : 'Height (cm)'}
            value={heightDisplay}
            onChange={(v) =>
              Number.isFinite(v) && setHeightCm(units === 'lb' ? Math.round(v * 2.54) : Math.round(v))
            }
            min={units === 'lb' ? 48 : 120}
            max={units === 'lb' ? 88 : 225}
          />
        </div>
        <CalcField
          id="td-bw"
          label={`Bodyweight (${unitLabel})`}
          value={displayWeight(bodyweightKg, units)}
          onChange={(v) => Number.isFinite(v) && setBodyweightKg(toKg(v, units))}
          min={35}
          max={550}
          step={0.5}
        />
        <Seg
          name="td-act"
          legend="Activity outside training"
          value={String(activity)}
          options={ACTIVITY_LEVELS.map((a) => ({
            value: String(a.value),
            label: ACTIVITY_LABELS[a.key],
          }))}
          onChange={(v) => setActivity(parseFloat(v))}
        />
        <Seg
          name="td-goal"
          legend="Goal"
          value={goal}
          options={[
            { value: 'cut', label: 'Cut −15%' },
            { value: 'maintain', label: 'Maintain' },
            { value: 'bulk', label: 'Build +10%' },
          ]}
          onChange={setGoal}
        />
      </div>

      <div aria-live="polite">
        {cals == null || tdee == null || bmr == null || fat == null || carbs == null ? (
          <p className="max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground">
            Choose sex to see BMR, maintenance calories, and macro targets.
          </p>
        ) : (
          <>
        <p className="eyebrow-live mb-2">Daily target</p>
        <p className="display-mega text-poster tabular-nums">
          {fmt.num(cals)} <span className="text-2xl text-muted-foreground">kcal</span>
        </p>
        <p className="mt-3 text-sm tabular-nums text-muted-foreground">
          Maintenance {fmt.num(tdee)} kcal · BMR {fmt.num(bmr)} kcal
        </p>
        <table className="mt-7 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border text-left">
              <th className="py-2 pr-2 font-semibold">Macro</th>
              <th className="py-2 pr-2 text-right font-semibold">Grams</th>
              <th className="py-2 text-right font-semibold">kcal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border bg-tint font-semibold">
              <td className="py-2 pr-2">Protein — 1.8 g/kg, first</td>
              <td className="py-2 pr-2 text-right tabular-nums">{protein}</td>
              <td className="py-2 text-right tabular-nums">{protein * 4}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-2">Fat — 25% of calories</td>
              <td className="py-2 pr-2 text-right tabular-nums">{fat}</td>
              <td className="py-2 text-right tabular-nums">{fat * 9}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-2">Carbs — the remainder</td>
              <td className="py-2 pr-2 text-right tabular-nums">{carbs}</td>
              <td className="py-2 text-right tabular-nums">{carbs * 4}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          Estimates, not prescriptions — equations carry ±10% for most people. Hold a target for
          two weeks, watch the trend in your log, then adjust. Educational tool, not medical
          advice.
        </p>
          </>
        )}
      </div>
    </div>
  );
}
