'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FuelLockedPreview } from '@/components/nutrition/FuelLockedPreview';
import { useFuelPlan } from '@/hooks/useFuelPlan';
import { RefreshCw, Sparkles } from 'lucide-react';

export function FuelMealPlanCard() {
  const { t } = useTranslation();
  const { plan, premium, loading, generate, regenerate, baseTargets } = useFuelPlan();

  if (!premium) {
    return <FuelLockedPreview baseTargets={baseTargets} />;
  }

  if (loading) {
    return (
      <Card className="content-card">
        <CardContent className="py-6 text-sm text-muted-foreground">
          {t('loading', { defaultValue: 'Loading…' })}
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="content-card border-primary/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t('fuelCoachTitle', { defaultValue: 'Fuel Coach — adaptive meal plan' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('fuelCoachGenerateDesc', {
              defaultValue:
                'Generate a 7-day plan from your macro targets and this week’s training load.',
            })}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {baseTargets.cals} kcal · {baseTargets.protein}g protein · {baseTargets.carbs}g carbs
          </p>
          <Button variant="fitness" size="sm" onClick={() => generate()}>
            {t('fuelCoachGenerate', { defaultValue: 'Generate meal plan' })}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="content-card border-primary/40">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="text-base">
          {t('fuelCoachWeekTitle', { defaultValue: 'Your adaptive meal plan' })}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => regenerate()} aria-label={t('fuelCoachRegenerate', { defaultValue: 'Regenerate plan' })}>
          <RefreshCw className="h-4 w-4 mr-1" aria-hidden />
          {t('fuelCoachRegenerate', { defaultValue: 'Regenerate' })}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {plan.days.map((day) => (
          <div key={day.dayKey} className="border border-white/10 rounded-lg p-3 bg-black/20 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{day.label}</div>
              <div className="text-xs text-primary capitalize">{day.trainingLoad} day</div>
            </div>
            {day.adaptedNote && (
              <p className="text-[11px] text-muted-foreground">{day.adaptedNote}</p>
            )}
            <ul className="text-xs text-muted-foreground space-y-1 list-disc ps-4">
              {day.meals.map((meal) => (
                <li key={`${day.dayKey}-${meal.slot}`}>
                  <span className="capitalize">{meal.slot}</span>: {meal.recipeName} ({meal.protein}g
                  P · {meal.cals} kcal)
                </li>
              ))}
            </ul>
            <p className="text-[11px] tabular-nums text-primary/90">
              {t('fuelCoachDayTotals', { defaultValue: 'Day totals' })}: {day.totals.protein}/
              {day.targets.protein}g P · {day.totals.carbs}/{day.targets.carbs}g C · {day.totals.cals}/
              {day.targets.cals} kcal
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
