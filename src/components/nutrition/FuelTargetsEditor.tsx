'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveMacroTargets } from '@/lib/macroTargets';

type Props = {
  targetCals: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  onSaved: (next: {
    cals: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
};

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Edit daily calorie/protein targets (persisted in localStorage).
 */
export function FuelTargetsEditor({
  targetCals,
  targetProtein,
  targetCarbs,
  targetFat,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [cals, setCals] = useState(targetCals);
  const [protein, setProtein] = useState(targetProtein);
  const [carbs, setCarbs] = useState(targetCarbs);
  const [fat, setFat] = useState(targetFat);
  const [savedFlash, setSavedFlash] = useState(false);

  const openEditor = () => {
    setCals(targetCals);
    setProtein(targetProtein);
    setCarbs(targetCarbs);
    setFat(targetFat);
    setOpen(true);
  };

  const save = () => {
    const next = {
      cals: clamp(cals, 800, 6000),
      protein: clamp(protein, 20, 400),
      carbs: clamp(carbs, 0, 800),
      fat: clamp(fat, 0, 300),
    };
    saveMacroTargets(next);
    onSaved(next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
    setOpen(false);
  };

  if (!open) {
    /* Start-aligned until `sm`: end-aligning a short button on a phone parks it
       under the Fuel FAB's column, where it is 100% hidden at some scroll offset
       (tests/e2e/fuel-floating-action.spec.ts). */
    return (
      <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <span className="tabular-nums">
          {t('fuelTargetsSummary', {
            cals: targetCals,
            protein: targetProtein,
            defaultValue: `Targets: ${targetCals} kcal · ${targetProtein}g protein`,
          })}
        </span>
        <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={openEditor}>
          {t('fuelEditTargets', { defaultValue: 'Edit targets' })}
        </Button>
        {savedFlash ? (
          <span className="text-primary w-full sm:w-auto">
            {t('fuelTargetsSaved', { defaultValue: 'Targets saved' })}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="border-2 border-border bg-card p-3 space-y-3">
      <p className="text-sm font-medium">
        {t('fuelEditTargetsTitle', { defaultValue: 'Daily targets' })}
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t('fuelEditTargetsHint', {
          defaultValue: 'Used for remaining calories and protein. Stored on this device.',
        })}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="fuel-target-cals">
            {t('fuelCalsLabel', { defaultValue: 'Cals' })}
          </label>
          <Input
            id="fuel-target-cals"
            type="number"
            min={800}
            max={6000}
            value={cals}
            onChange={(e) => setCals(parseInt(e.target.value, 10) || 0)}
            className="h-10 mt-0.5"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="fuel-target-p">
            {t('fuelProteinGLabel', { defaultValue: 'Protein g' })}
          </label>
          <Input
            id="fuel-target-p"
            type="number"
            min={20}
            max={400}
            value={protein}
            onChange={(e) => setProtein(parseInt(e.target.value, 10) || 0)}
            className="h-10 mt-0.5"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="fuel-target-c">
            {t('fuelCarbsShort', { defaultValue: 'Carbs' })}
          </label>
          <Input
            id="fuel-target-c"
            type="number"
            min={0}
            max={800}
            value={carbs}
            onChange={(e) => setCarbs(parseInt(e.target.value, 10) || 0)}
            className="h-10 mt-0.5"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="fuel-target-f">
            {t('fuelFatShort', { defaultValue: 'Fat' })}
          </label>
          <Input
            id="fuel-target-f"
            type="number"
            min={0}
            max={300}
            value={fat}
            onChange={(e) => setFat(parseInt(e.target.value, 10) || 0)}
            className="h-10 mt-0.5"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="default" size="sm" className="h-9" onClick={save}>
          {t('fuelSaveTargets', { defaultValue: 'Save targets' })}
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => setOpen(false)}>
          {t('cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </div>
  );
}
