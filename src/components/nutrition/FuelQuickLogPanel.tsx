'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MealType } from '@/components/nutrition/FuelLogSheet';
import {
  MealEstimateDraft,
  type MealDraftFields,
} from '@/components/nutrition/MealEstimateDraft';
import { FoodSearchBar } from '@/components/nutrition/FoodSearchBar';
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
  onLogNlMeal: (draft: MealDraftFields) => void;
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
  const [draft, setDraft] = useState<MealDraftFields | null>(null);
  const [draftFromDb, setDraftFromDb] = useState(false);

  useEffect(() => {
    if (!nlPreview) {
      setDraft(null);
      setDraftFromDb(false);
      return;
    }
    setDraftFromDb(false);
    setDraft({
      name: nlPreview.name,
      protein: nlPreview.protein,
      cals: nlPreview.cals,
      carbs: nlPreview.carbs,
      fat: nlPreview.fat,
    });
  }, [nlPreview]);

  const sourceLabel = draftFromDb
    ? t('fuelSourceDb', { defaultValue: 'Database' })
    : nlPreview
      ? nlPreview.source === 'matched'
        ? t('fuelSourceMatched', { defaultValue: 'Matched foods' })
        : t('fuelSourceRough', { defaultValue: 'Rough estimate' })
      : undefined;
  const confidence = draftFromDb ? ('high' as const) : nlPreview?.confidence;

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
              className="h-8 text-xs rounded-full"
              onClick={() => onActiveMealChange(m)}
            >
              {mealLabel(m)}
            </Button>
          ))}
        </div>
        <input
          id="fuel-nl-meal"
          type="text"
          value={nlMealText}
          placeholder={t('fuelNlPlaceholder', {
            defaultValue: 'chicken rice broccoli… or 3 eggs',
          })}
          onChange={(e) => onNlMealTextChange(e.target.value)}
          className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {draft && nlPreview ? (
          <div className="space-y-3">
            <MealEstimateDraft
              draft={draft}
              onChange={(next) => {
                setDraft(next);
                setDraftFromDb(false);
              }}
              confidence={confidence}
              sourceLabel={sourceLabel}
              onLog={() => onLogNlMeal(draft)}
              onDismiss={() => {
                setDraft(null);
                setDraftFromDb(false);
                onNlMealTextChange('');
              }}
            />
            {(nlPreview.source === 'rough' || nlPreview.confidence === 'low') && (
              <div className="rounded-xl border border-border/50 bg-background/50 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t('fuelSearchToImprove', {
                    defaultValue: 'Search the food database for better macros',
                  })}
                </p>
                <FoodSearchBar
                  compact
                  initialQuery={nlMealText.trim().length >= 2 ? nlMealText.trim() : draft.name}
                  onSelect={(item) => {
                    setDraft({
                      name: item.brand ? `${item.name} (${item.brand})` : item.name,
                      protein: item.protein,
                      cals: item.calories,
                      carbs: item.carbs,
                      fat: item.fat,
                    });
                    setDraftFromDb(true);
                  }}
                />
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {frequentFoods.map(([name, p, c, carbs, fat]) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            className="text-xs rounded-full"
            onClick={() => onQuickLog(name, p, c, carbs, fat)}
          >
            {name}
          </Button>
        ))}
      </div>

      {savedMeals.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t('fuelSavedMeals', { defaultValue: 'Saved meals' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {savedMeals.map((m) => (
              <Button
                key={m.id}
                variant="secondary"
                size="sm"
                className="text-xs rounded-full"
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
          {t('fuelLogDetailed', { defaultValue: 'Photo & detailed log' })}
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
