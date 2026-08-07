'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useUnits,
  bodyweightUnitLabel,
  heightUnitLabel,
} from '@/hooks/useUnits';
import {
  defaultCalcInputs,
  type CalcSex,
} from '@/lib/calcHelpers';
import { saveMacroTargets } from '@/lib/macroTargets';
import { latest as latestBodyMetrics } from '@/lib/bodyMetrics';
import {
  activityLevelsList,
  computeGoalTargets,
  defaultBodyweightForWizard,
  loadFuelGoalChoice,
  saveFuelGoalChoice,
  type FuelGoalChoice,
} from '@/lib/fuelGoalWizard';
import { cn } from '@/lib/utils';

type Props = {
  onApplied: (next: {
    cals: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
};

const GOALS: FuelGoalChoice[] = ['lose', 'maintain', 'gain'];

/**
 * Compact lose/maintain/gain → macro targets wizard for Fuel.
 * Uses Mifflin-St Jeor + activity; applies to mw_macro_targets.
 */
export function FuelGoalWizard({ onApplied }: Props) {
  const { t } = useTranslation();
  const units = useUnits();
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState<FuelGoalChoice>(
    () => loadFuelGoalChoice() ?? 'maintain'
  );
  const [bw, setBw] = useState(() =>
    defaultBodyweightForWizard(units, latestBodyMetrics()?.weightKg)
  );
  const [height, setHeight] = useState(() => defaultCalcInputs(units).height);
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<CalcSex>('male');
  const [activity, setActivity] = useState(1.55);
  const [details, setDetails] = useState(false);
  const [flash, setFlash] = useState(false);

  const openWizard = () => {
    setBw(defaultBodyweightForWizard(units, latestBodyMetrics()?.weightKg));
    setHeight(defaultCalcInputs(units).height);
    setGoal(loadFuelGoalChoice() ?? 'maintain');
    setOpen(true);
  };

  const preview = useMemo(
    () =>
      computeGoalTargets({
        goal,
        bodyweight: bw,
        height,
        age,
        sex,
        activity,
        units,
      }),
    [goal, bw, height, age, sex, activity, units]
  );

  const goalLabel = (g: FuelGoalChoice) => {
    if (g === 'lose') return t('fuelGoalLose', { defaultValue: 'Lose' });
    if (g === 'gain') return t('fuelGoalGain', { defaultValue: 'Gain' });
    return t('fuelGoalMaintain', { defaultValue: 'Maintain' });
  };

  const activityLabel = (key: string) => {
    const map: Record<string, string> = {
      sedentary: t('calcActivitySedentary', { defaultValue: 'Sedentary' }),
      light: t('calcActivityLight', { defaultValue: 'Light' }),
      moderate: t('calcActivityModerate', { defaultValue: 'Moderate' }),
      active: t('calcActivityActive', { defaultValue: 'Active' }),
    };
    return map[key] ?? key;
  };

  const apply = () => {
    const next = {
      cals: preview.cals,
      protein: preview.protein,
      carbs: preview.carbs,
      fat: preview.fat,
    };
    saveMacroTargets(next);
    saveFuelGoalChoice(goal);
    onApplied(next);
    setFlash(true);
    setTimeout(() => setFlash(false), 1600);
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={openWizard}
        >
          {t('fuelGoalWizardCta', { defaultValue: 'Set from goal' })}
        </Button>
        {flash ? (
          <span className="text-xs text-primary">
            {t('fuelGoalApplied', { defaultValue: 'Goal targets applied' })}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="border-2 border-border bg-card p-3 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            {t('fuelGoalWizardTitle', { defaultValue: 'Targets from goal' })}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            {t('fuelGoalWizardHint', {
              defaultValue:
                'Lose ≈ 15% under maintain, gain ≈ 10% over. Estimates only — not medical advice.',
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('fuelGoalPick', { defaultValue: 'Goal' })}>
        {GOALS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGoal(g)}
            className={cn(
              ' px-3 py-1.5 text-xs font-medium border transition-colors',
              goal === g
                ? 'border-primary bg-muted text-primary'
                : 'border-border text-muted-foreground hover:bg-card'
            )}
          >
            {goalLabel(g)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="fuel-goal-bw">
            {t('calcBwLabel', {
              unit: bodyweightUnitLabel(units),
              defaultValue: `Weight (${bodyweightUnitLabel(units)})`,
            })}
          </label>
          <Input
            id="fuel-goal-bw"
            type="number"
            min={30}
            max={400}
            step={0.1}
            value={bw}
            onChange={(e) => setBw(parseFloat(e.target.value) || 0)}
            className="h-10 mt-0.5 tabular-nums"
          />
        </div>
        <div className="col-span-2 sm:col-span-2">
          <label className="text-xs text-muted-foreground" htmlFor="fuel-goal-act">
            {t('calcActivityLabel', { defaultValue: 'Activity' })}
          </label>
          <select
            id="fuel-goal-act"
            value={activity}
            onChange={(e) => setActivity(parseFloat(e.target.value))}
            className="mt-0.5 h-10 w-full  border border-input bg-background px-2 text-sm"
          >
            {activityLevelsList().map((a) => (
              <option key={a.key} value={a.value}>
                {activityLabel(a.key)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        onClick={() => setDetails((d) => !d)}
      >
        {details
          ? t('fuelGoalHideDetails', { defaultValue: 'Hide height, age, sex' })
          : t('fuelGoalShowDetails', { defaultValue: 'Height, age, sex' })}
      </button>

      {details ? (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="fuel-goal-h">
              {t('calcHeightLabel', {
                unit: heightUnitLabel(units),
                defaultValue: `Height (${heightUnitLabel(units)})`,
              })}
            </label>
            <Input
              id="fuel-goal-h"
              type="number"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              className="h-10 mt-0.5 tabular-nums"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="fuel-goal-age">
              {t('calcAgeLabel', { defaultValue: 'Age' })}
            </label>
            <Input
              id="fuel-goal-age"
              type="number"
              min={14}
              max={100}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 28)}
              className="h-10 mt-0.5 tabular-nums"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="fuel-goal-sex">
              {t('calcSexLabel', { defaultValue: 'Sex' })}
            </label>
            <select
              id="fuel-goal-sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as CalcSex)}
              className="mt-0.5 h-10 w-full  border border-input bg-background px-2 text-sm"
            >
              <option value="male">{t('calcSexMale', { defaultValue: 'Male' })}</option>
              <option value="female">{t('calcSexFemale', { defaultValue: 'Female' })}</option>
            </select>
          </div>
        </div>
      ) : null}

      <div className="border-2 border-border bg-background px-3 py-2 text-xs space-y-1">
        <p className="font-medium tabular-nums">
          {t('fuelGoalPreview', {
            cals: preview.cals,
            protein: preview.protein,
            defaultValue: `${preview.cals} kcal · ${preview.protein}g protein`,
          })}
        </p>
        <p className="text-muted-foreground tabular-nums">
          {t('fuelGoalPreviewMacros', {
            carbs: preview.carbs,
            fat: preview.fat,
            tdee: preview.tdee,
            defaultValue: `${preview.carbs}g C · ${preview.fat}g F · TDEE ~${preview.tdee}`,
          })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="default" size="sm" className="h-9" onClick={apply}>
          {t('fuelApplyGoalTargets', { defaultValue: 'Apply targets' })}
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => setOpen(false)}>
          {t('cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </div>
  );
}
