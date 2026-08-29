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
  /**
   * notepad — first paint: recents + type + water.
   * tools — Show all: meal chips, frequent, saved, photo, yesterday.
   */
  mode?: 'full' | 'notepad' | 'tools';
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
  mode = 'full',
}: Props) {
  const notepad = mode === 'notepad';
  const tools = mode === 'tools';
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
      {tools ? null : (
        <section
          data-testid="fuel-notepad"
          className="house-card house-fuel-notepad"
        >
          {recentFoods.length > 0 ? (
            <div className="house-collections">
              <p className="house-kicker">
                {t('fuelRecents', { defaultValue: 'Recent' })}
              </p>
              <div className="house-fuel-recents">
                {recentFoods.map(([name, p, c, carbs, fat]) => (
                  <div key={`recent-${name}`} className="house-fuel-recent">
                    <button
                      type="button"
                      className="house-state min-h-[44px] tap-target"
                      onClick={() => onQuickLog(name, p, c, carbs, fat)}
                    >
                      {name}
                    </button>
                    <button
                      type="button"
                      className="house-btn house-btn-ghost min-h-[44px] w-11 p-0 tap-target"
                      aria-label={t('fuelEditThenLog', { defaultValue: 'Edit servings then log' })}
                      onClick={() => openDraftFromChip(name, p, c, carbs, fat)}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="house-lede">
                {t('fuelRecentsHint', {
                  defaultValue: 'Tap to log · pencil to adjust servings first',
                })}
              </p>
            </div>
          ) : null}

          <div className="house-fuel-type">
            <label className="house-fuel-notepad-name" htmlFor="fuel-nl-meal">
              {t('fuelNlTitle', { defaultValue: 'Describe what you ate' })}
            </label>
            {notepad ? null : (
              <div
                className="house-fuel-meals"
                role="group"
                aria-label={t('fuelMealPicker', { defaultValue: 'Meal' })}
              >
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`house-state min-h-[44px] tap-target${activeMeal === m ? ' is-on' : ''}`}
                    onClick={() => onActiveMealChange(m)}
                  >
                    {mealLabel(m)}
                  </button>
                ))}
              </div>
            )}
            <input
              id="fuel-nl-meal"
              type="text"
              value={nlMealText}
              placeholder={t('fuelNlPlaceholder', {
                defaultValue: 'chicken rice broccoli… or 3 eggs',
              })}
              onChange={(e) => onNlMealTextChange(e.target.value)}
              className="house-field"
            />
            {draft && (nlPreview || manualDraft) ? (
              <div className="house-fuel-draft">
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
                  <div className="house-fuel-improve">
                    <p className="house-lede">
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

          <div className="house-fuel-water">
            <button
              type="button"
              className="house-btn house-btn-ghost min-h-[44px] tap-target"
              onClick={() => onWaterChange(Math.max(0, water - 1))}
            >
              −
            </button>
            <span className="house-lede">
              {water} {t('fuelGlasses', { defaultValue: 'glasses' })}
            </span>
            <button
              type="button"
              className="house-btn house-btn-ghost min-h-[44px] tap-target"
              onClick={() => onWaterChange(water + 1)}
            >
              +
            </button>
          </div>
        </section>
      )}

      {notepad ? null : (
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
              className="text-xs min-h-[44px] tap-target "
              onClick={() => onQuickLog(name, p, c, carbs, fat)}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
      )}

      {notepad ? null : savedMeals.length > 0 && (
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
                className="text-xs min-h-[44px] tap-target "
                onClick={() => onQuickLog(m.name, m.protein, m.cals, m.carbs, m.fat)}
              >
                {m.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {tools ? (
        <Button variant="outline" size="sm" className="min-h-[44px] tap-target" onClick={onOpenLogSheet}>
          <Plus className="h-3.5 w-3.5 me-1" />
          {t('fuelLogDetailed', { defaultValue: 'Photo & detailed log' })}
        </Button>
      ) : null}

      {notepad ? null : yesterdayMeals.length > 0 && (
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
