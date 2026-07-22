'use client';

import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MealType } from '@/components/nutrition/FuelLogSheet';
import type { NlMealEstimate } from '@/lib/nlMealLog';
import type { NutritionLogRow, QuickFoodTuple } from '@/lib/nutritionQuickLog';
import type { SavedMealPreset } from '@/lib/savedMeals';

type Props = {
  activeMeal: MealType;
  onActiveMealChange: (meal: MealType) => void;
  mealLabel: (meal?: MealType) => string;
  nlMealText: string;
  onNlMealTextChange: (text: string) => void;
  nlPreview: NlMealEstimate | null;
  onLogNlMeal: () => void;
  frequentFoods: QuickFoodTuple[];
  onQuickLog: (name: string, protein: number, cals: number, carbs?: number, fat?: number) => void;
  savedMeals: SavedMealPreset[];
  onOpenLogSheet: () => void;
  water: number;
  onWaterChange: (water: number) => void;
  yesterdayMeals: NutritionLogRow[];
  onRepeatYesterday: () => void;
};

export function FuelQuickLogPanel({
  activeMeal,
  onActiveMealChange,
  mealLabel,
  nlMealText,
  onNlMealTextChange,
  nlPreview,
  onLogNlMeal,
  frequentFoods,
  onQuickLog,
  savedMeals,
  onOpenLogSheet,
  water,
  onWaterChange,
  yesterdayMeals,
  onRepeatYesterday,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="fuel-nl-meal">
          {t('fuelNlTitle', { defaultValue: 'Describe what you ate' })}
        </label>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={t('fuelMealPicker', { defaultValue: 'Meal' })}
        >
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={activeMeal === m ? 'fitness' : 'outline'}
              className="h-8 text-xs"
              onClick={() => onActiveMealChange(m)}
            >
              {mealLabel(m)}
            </Button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="fuel-nl-meal"
            type="text"
            value={nlMealText}
            placeholder={t('fuelNlPlaceholder', {
              defaultValue: 'chicken rice broccoli…',
            })}
            onChange={(e) => onNlMealTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              if (!nlPreview) return;
              onLogNlMeal();
            }}
            className="flex-1 h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            variant="fitness"
            className="h-11 gap-2 shrink-0"
            disabled={!nlPreview}
            onClick={onLogNlMeal}
          >
            <Plus className="h-4 w-4" />
            {t('fuelLogMeal', { defaultValue: 'Log meal' })}
          </Button>
        </div>
        {nlPreview && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {t('fuelNlPreview', {
              name: nlPreview.name,
              protein: nlPreview.protein,
              cals: nlPreview.cals,
              defaultValue: `Est. ${nlPreview.name} — ${nlPreview.protein}g P · ${nlPreview.cals} kcal (${nlPreview.confidence})`,
            })}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {frequentFoods.map(([name, p, c, carbs, fat]) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onQuickLog(name, p, c, carbs, fat)}
          >
            {name}
          </Button>
        ))}
      </div>

      {savedMeals.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {t('fuelSavedMeals', { defaultValue: 'Saved meals' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {savedMeals.map((m) => (
              <Button
                key={m.id}
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={() => onQuickLog(m.name, m.protein, m.cals, m.carbs, m.fat)}
              >
                {m.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="outline" size="sm" onClick={onOpenLogSheet}>
          <Plus className="h-3.5 w-3.5 me-1" />
          {t('fuelLogDetailed', { defaultValue: 'Detailed log' })}
        </Button>
        <div className="flex items-center gap-1 ms-auto">
          <Button size="sm" variant="ghost" onClick={() => onWaterChange(Math.max(0, water - 1))}>
            −
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground min-w-[4.5rem] text-center">
            {water} {t('fuelGlasses', { defaultValue: 'glasses' })}
          </span>
          <Button size="sm" variant="ghost" onClick={() => onWaterChange(water + 1)}>
            +
          </Button>
        </div>
      </div>

      {yesterdayMeals.length > 0 && (
        <Button variant="secondary" size="sm" onClick={onRepeatYesterday}>
          {t('fuelRepeatYesterday', {
            count: yesterdayMeals.length,
            defaultValue: `Repeat yesterday (${yesterdayMeals.length} items)`,
          })}
        </Button>
      )}
    </>
  );
}
