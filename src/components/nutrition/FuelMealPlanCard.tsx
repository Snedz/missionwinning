'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FUEL_MEAL_PLAN } from '@/data/fuelMealPlan';

type Props = {
  premium: boolean;
};

export function FuelMealPlanCard({ premium }: Props) {
  const { t } = useTranslation();
  const visibleDays = premium ? FUEL_MEAL_PLAN : FUEL_MEAL_PLAN.slice(0, 1);
  const lockedCount = FUEL_MEAL_PLAN.length - visibleDays.length;

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle>
          {t('fuelMealPlanTitle', { defaultValue: '7-day high-protein meal outline' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleDays.map((day) => (
          <div key={day.dayKey} className="border border-white/10 rounded-lg p-3 bg-black/20">
            <div className="text-sm font-semibold mb-2">{day.label}</div>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc ps-4">
              {day.meals.map((meal) => (
                <li key={meal}>{meal}</li>
              ))}
            </ul>
          </div>
        ))}
        {!premium && lockedCount > 0 && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm space-y-2">
            <p className="text-muted-foreground">
              {t('fuelMealPlanLocked', {
                count: lockedCount,
                defaultValue: `+${lockedCount} more days — timing strategies and macro-synced meals in Super Bundle.`,
              })}
            </p>
            <Button variant="fitness" size="sm" asChild>
              <Link href="/bundle">{t('fuelExploreBundle', { defaultValue: 'Explore Super Bundle' })}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
