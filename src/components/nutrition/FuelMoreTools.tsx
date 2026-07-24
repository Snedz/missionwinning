'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FoodSearchBar } from '@/components/nutrition/FoodSearchBar';
import { BarcodeLookup } from '@/components/nutrition/BarcodeLookup';
import type { FoodSearchItem } from '@/lib/foodSearch';

type Props = {
  onLogFood: (name: string, protein: number, cals: number, carbs: number, fat: number) => void;
};

function formatFoodName(item: FoodSearchItem): string {
  return item.brand ? `${item.name} (${item.brand})` : item.name;
}

export function FuelMoreTools({ onLogFood }: Props) {
  const { t } = useTranslation();
  const [showScience, setShowScience] = useState(false);

  const handleSelect = (item: FoodSearchItem) => {
    onLogFood(formatFoodName(item), item.protein, item.calories, item.carbs, item.fat);
  };

  return (
    <>
      <Card className="content-card border-border/40 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {t('fuelSearchTitle', { defaultValue: 'Search foods' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BarcodeLookup onSelect={handleSelect} />
          <FoodSearchBar onSelect={handleSelect} />
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
