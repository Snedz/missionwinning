'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UnlockButton } from '@/components/UnlockButton';
import { isFreeBeta } from '@/lib/freeBeta';
import type { FuelPlanDay } from '@/lib/fuelCoach/types';

const DEMO_DAY: FuelPlanDay = {
  dayKey: 'mon',
  label: 'Monday',
  dayOffset: 0,
  trainingLoad: 'heavy',
  adaptedNote: 'Heavy squat day — +40g carbs',
  targets: { cals: 2400, protein: 170, carbs: 240, fat: 70 },
  totals: { cals: 2380, protein: 168, carbs: 235, fat: 72 },
  meals: [
    {
      slot: 'breakfast',
      recipeId: 'demo-1',
      recipeName: 'Greek Yogurt Parfait',
      protein: 38,
      cals: 340,
      carbs: 32,
      fat: 8,
    },
    {
      slot: 'lunch',
      recipeId: 'demo-2',
      recipeName: 'Chicken Rice Power Bowl',
      protein: 52,
      cals: 620,
      carbs: 58,
      fat: 12,
    },
    {
      slot: 'dinner',
      recipeId: 'demo-3',
      recipeName: 'Salmon Plate',
      protein: 35,
      cals: 480,
      carbs: 22,
      fat: 28,
    },
    {
      slot: 'snack',
      recipeId: 'demo-4',
      recipeName: 'PB Banana Oats',
      protein: 18,
      cals: 420,
      carbs: 55,
      fat: 14,
    },
  ],
};

type Props = {
  baseTargets: { cals: number; protein: number; carbs: number; fat: number };
};

/** Premium Fuel Coach upsell — one adaptive day teased, rest gated. */
export function FuelLockedPreview({ baseTargets }: Props) {
  const { t } = useTranslation();

  // Free-first beta: hide paid upsells.
  if (isFreeBeta()) return null;
  const day = DEMO_DAY;

  return (
    <Card className="card-elevated card-glow-brass border-brass/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-primary" />
          {t('fuelCoachTitle', { defaultValue: 'Fuel Coach — adaptive meal plan' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('fuelCoachLockedDesc', {
            defaultValue:
              'Macro-synced 7-day plan from your targets and training load — not a static sample.',
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('fuelCoachTargets', {
            defaultValue: 'Your targets',
          })}
          : {baseTargets.cals} kcal · {baseTargets.protein}g P · {baseTargets.carbs}g C
        </p>
        <div className="relative rounded-lg border border-border/50 bg-black/20 p-3">
          <div className="pointer-events-none select-none opacity-60 blur-[1px] space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span>{day.label}</span>
              <span className="text-primary text-xs">{day.adaptedNote}</span>
            </div>
            <ul className="text-xs space-y-1 text-muted-foreground">
              {day.meals.map((m) => (
                <li key={m.slot}>
                  {m.slot}: {m.recipeName} ({m.protein}g P · {m.cals} kcal)
                </li>
              ))}
            </ul>
            <p className="text-xs tabular-nums">
              {day.totals.protein}g P / {day.targets.protein}g · {day.totals.carbs}g C /{' '}
              {day.targets.carbs}g
            </p>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t('fuelCoachPreviewNote', {
              defaultValue: 'Recipes from your library, adapted to heavy vs rest days',
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <UnlockButton productId="super-bundle" planId="12mo" price="59" title="Super Bundle" isSubscription />
          <Button variant="outline" size="sm" asChild>
            <Link href="/bundle">{t('fuelExploreBundle', { defaultValue: 'Explore Super Bundle' })}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
