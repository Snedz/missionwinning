'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FoodSearchBar } from '@/components/nutrition/FoodSearchBar';
import { BarcodeLookup } from '@/components/nutrition/BarcodeLookup';
import {
  MealEstimateDraft,
  type MealDraftFields,
} from '@/components/nutrition/MealEstimateDraft';
import type { FoodSearchItem } from '@/lib/foodSearch';

type Props = {
  onLogFood: (name: string, protein: number, cals: number, carbs: number, fat: number) => void;
};

function formatFoodName(item: FoodSearchItem): string {
  return item.brand ? `${item.name} (${item.brand})` : item.name;
}

function itemToDraft(item: FoodSearchItem): MealDraftFields {
  return {
    name: formatFoodName(item),
    protein: item.protein,
    cals: item.calories,
    carbs: item.carbs,
    fat: item.fat,
  };
}

export function FuelMoreTools({ onLogFood }: Props) {
  const { t } = useTranslation();
  const [showScience, setShowScience] = useState(false);
  const [draft, setDraft] = useState<MealDraftFields | null>(null);

  const handleSelect = (item: FoodSearchItem) => {
    setDraft(itemToDraft(item));
  };

  return (
    <>
      <Card className="border-border/40 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {t('fuelSearchTitle', { defaultValue: 'Search foods' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BarcodeLookup onSelect={handleSelect} />
          <FoodSearchBar onSelect={handleSelect} />
          {draft ? (
            <MealEstimateDraft
              draft={draft}
              onChange={setDraft}
              confidence="high"
              sourceLabel={t('fuelSourceDb', { defaultValue: 'Database' })}
              logLabel={t('fuelLogMeal', { defaultValue: 'Log meal' })}
              onLog={() => {
                if (!draft.name.trim()) return;
                onLogFood(
                  draft.name.trim(),
                  draft.protein,
                  draft.cals,
                  draft.carbs,
                  draft.fat
                );
                setDraft(null);
              }}
              onDismiss={() => setDraft(null)}
            />
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('fuelSearchThenEdit', {
                defaultValue: 'Scan or search, then review macros before logging.',
              })}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="text-sm">
        <button
          type="button"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => setShowScience((v) => !v)}
          aria-expanded={showScience}
        >
          {showScience
            ? t('fuelHideScience', { defaultValue: 'Hide protein notes' })
            : t('fuelShowScience', { defaultValue: 'Why protein matters' })}
        </button>
        {showScience ? (
          <div className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
            <p>
              {t('fuelScienceCh5', {
                defaultValue:
                  'Protein helps repair and grow. Many active people do well around 1.6–2.2g per kg of body weight — use complete proteins and variety.',
              })}
            </p>
            <p>
              {t('fuelScienceCh12', {
                defaultValue:
                  'Carbs fuel hard sessions; fats support hormones. Whole foods and hydration do most of the work — recipes below follow that idea.',
              })}
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
