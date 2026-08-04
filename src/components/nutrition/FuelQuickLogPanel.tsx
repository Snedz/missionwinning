'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus } from 'lucide-react';
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
  recentFoods: QuickFoodTuple[];
  frequentFoods: QuickFoodTuple[];
  onQuickLog: (name: string, protein: number, cals: number, carbs?: number, fat?: number) => void;
  /** Open draft for edit-before-log (speed: chip = log; pencil path = draft). */
  onOpenFoodDraft?: (name: string, protein: number, cals: number, carbs: number, fat: number) => void;
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
  recentFoods,
  frequentFoods,
  onQuickLog,
  onOpenFoodDraft,
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
  const [manualDraft, setManualDraft] = useState(false);

  useEffect(() => {
    if (manualDraft) return;
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
  }, [nlPreview, manualDraft]);

  const sourceLabel = draftFromDb
    ? t('fuelSourceDb', { defaultValue: 'Database' })
    : manualDraft
      ? t('fuelSourceRecent', { defaultValue: 'Recent' })
      : nlPreview
        ? nlPreview.source === 'matched'
          ? t('fuelSourceMatched', { defaultValue: 'Matched foods' })
          : t('fuelSourceRough', { defaultValue: 'Rough estimate' })
        : undefined;
  const confidence = draftFromDb || manualDraft ? ('high' as const) : nlPreview?.confidence;

  const openDraftFromChip = (
    name: string,
    p: number,
    c: number,
    carbs: number,
    fat: number
  ) => {
    setManualDraft(true);
    setDraftFromDb(false);
    setDraft({ name, protein: p, cals: c, carbs, fat });
    onOpenFoodDraft?.(name, p, c, carbs, fat);
  };

  return (
    <>
      {recentFoods.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t('fuelRecents', { defaultValue: 'Recent' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {recentFoods.map(([name, p, c, carbs, fat]) => (
              <div key={`recent-${name}`} className="inline-flex items-center gap-0.5">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs "
                  onClick={() => onQuickLog(name, p, c, carbs, fat)}
                >
                  {name}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0  text-muted-foreground"
                  aria-label={t('fuelEditThenLog', { defaultValue: 'Edit servings then log' })}
                  onClick={() => openDraftFromChip(name, p, c, carbs, fat)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t('fuelRecentsHint', {
              defaultValue: 'Tap to log · pencil to adjust servings first',
            })}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="fuel-nl-meal">
          {t('fuelNlTitle', { defaultValue: 'Describe what you ate' })}
        </label>
        {/* Two-up on a phone, not four left-packed chips: the fourth chip lands in
            the Fuel FAB's column, narrow enough to be 100% hidden at some scroll
            offset (tests/e2e/fuel-floating-action.spec.ts). Half-width tabs clear
            the FAB's left edge whatever the label says in any locale. */}
        <div
          className="grid grid-cols-2 gap-1.5 sm:grid-cols-4"
          role="group"
          aria-label={t('fuelMealPicker', { defaultValue: 'Meal' })}
        >
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={activeMeal === m ? 'selected' : 'outline'}
              className="h-8 text-xs "
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
          className="w-full h-11  border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {draft && (nlPreview || manualDraft) ? (
          <div className="space-y-3">
            <MealEstimateDraft
              draft={draft}
              onChange={(next) => {
                setDraft(next);
              }}
              confidence={confidence}
              sourceLabel={sourceLabel}
              requireEdit={
                !draftFromDb &&
                !manualDraft &&
                (nlPreview?.source === 'rough' || nlPreview?.confidence === 'low')
              }
              onLog={() => {
                onLogNlMeal(draft);
                setDraft(null);
                setManualDraft(false);
                setDraftFromDb(false);
              }}
              onDismiss={() => {
                setDraft(null);
                setDraftFromDb(false);
                setManualDraft(false);
                onNlMealTextChange('');
              }}
            />
            {nlPreview &&
              !manualDraft &&
              (nlPreview.source === 'rough' || nlPreview.confidence === 'low') && (
              <div className="border-2 border-border bg-background p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t('fuelSearchToImprove', {
                    defaultValue: 'Search the food database for better macros',
                  })}
                </p>
                <FoodSearchBar
                  compact
                  initialQuery={nlMealText.trim().length >= 2 ? nlMealText.trim() : draft.name}
                  onSelect={(item) => {
                    setManualDraft(false);
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

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">
          {t('fuelFrequent', { defaultValue: 'Frequent' })}
        </p>
        <div className="flex flex-wrap gap-2">
          {frequentFoods.map(([name, p, c, carbs, fat]) => (
            <Button
              key={name}
              variant="outline"
              size="sm"
              className="text-xs "
              onClick={() => onQuickLog(name, p, c, carbs, fat)}
            >
              {name}
            </Button>
          ))}
        </div>
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
                className="text-xs "
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
        {/* `ms-auto` only from `sm`: on a phone this row wraps and the end-aligned
            water stepper puts a 33px "+" wholly inside the Fuel FAB's column
            (tests/e2e/fuel-floating-action.spec.ts). */}
        <div className="flex items-center gap-1 sm:ms-auto">
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
