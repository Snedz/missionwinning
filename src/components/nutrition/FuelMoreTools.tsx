'use client';

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

  const handleSelect = (item: FoodSearchItem) => {
    onLogFood(formatFoodName(item), item.protein, item.calories, item.carbs, item.fat);
  };

  return (
    <>
      <div className="text-xs bg-muted/20 p-3 rounded space-y-2">
        <p>
          {t('fuelScienceCh5', {
            defaultValue:
              'Protein insight (textbook ch.5): Essential for growth, repair, enzymes, and hormones. Active clients often need 1.6–2.2g/kg. Use complete proteins; time intake around workouts. Variety covers essential aminos — recipes below follow these principles.',
          })}
        </p>
        <p>
          {t('fuelScienceCh12', {
            defaultValue:
              'Nutrition for bodybuilders (ch.12): Complex carbs fuel training; healthy fats support hormones (15–30% calories). Vitamins/minerals from whole foods; fiber 20–30g+. Post-workout protein + carbs aid recovery. Hydration matters — prioritize local whole foods.',
          })}
        </p>
      </div>

      <Card className="content-card">
        <CardHeader>
          <CardTitle>{t('fuelSearchTitle', { defaultValue: 'Search foods' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BarcodeLookup onSelect={handleSelect} />
          <FoodSearchBar onSelect={handleSelect} />
        </CardContent>
      </Card>
    </>
  );
}
