'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FuelMealPlanCard } from '@/components/nutrition/FuelMealPlanCard';
import {
  FREE_RECIPE_COUNT,
  PREMIUM_RECIPE_COUNT,
  PREMIUM_RECIPE_TEASERS,
} from '@/data/recipes/catalogMeta';
import type { Recipe } from '@/data/recipes/types';

type Props = {
  freeRecipes: Recipe[];
  premium: boolean;
  premiumRecipes: Recipe[];
  premiumFetchError: boolean;
  onLogRecipe: (r: Recipe) => void;
};

export function FuelRecipesPanel({
  freeRecipes,
  premium,
  premiumRecipes,
  premiumFetchError,
  onLogRecipe,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <Card className="content-card">
        <CardHeader>
          <CardTitle>
            {t('fuelFreeRecipesTitle', {
              count: FREE_RECIPE_COUNT,
              defaultValue: `Free Recipes (${FREE_RECIPE_COUNT} — core mission)`,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {freeRecipes.map((r, i) => (
            <details key={i} className="group border border-border/40 rounded p-3 bg-muted/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-primary">
                    {r.protein}g protein • {r.cals} kcal
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="fitness"
                    onClick={(e) => {
                      e.preventDefault();
                      onLogRecipe(r);
                    }}
                  >
                    {t('logRecipe', { defaultValue: 'Log Recipe' })}
                  </Button>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </div>
              </summary>
              <div className="text-xs mt-2 pt-2 border-t border-border/30 text-muted-foreground">
                {r.ingredients}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>

      <FuelMealPlanCard />

      {premiumFetchError && premium && (
        <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border/50 px-3 py-2">
          {t('fuelPremiumOffline', {
            defaultValue: 'Premium recipes unavailable offline — free recipes above still work.',
          })}
        </p>
      )}

      {premium ? (
        <Card className="content-card">
          <CardHeader>
            <CardTitle>
              {t('fuelPremiumRecipesTitle', {
                defaultValue: 'Premium Recipes & Meal Ideas (Super Bundle)',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {premiumRecipes.map((r, i) => (
              <details key={i} className="group border border-border/40 rounded p-3 bg-muted/10">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-primary">
                      {r.protein}g protein • {r.cals} kcal • {r.carbs}c {r.fat}f
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
                  <Button
                    size="sm"
                    variant="fitness"
                    className="w-full"
                    onClick={() => onLogRecipe(r)}
                  >
                    {t('logRecipe', { defaultValue: 'Log Entire Recipe + Boost Score' })}
                  </Button>
                  <div className="text-xs text-muted-foreground">{r.ingredients}</div>
                  <div className="text-xs">{r.instructions}</div>
                  <div className="text-[10px] text-primary italic">{r.tip}</div>
                </div>
              </details>
            ))}
            <div className="text-xs text-muted-foreground">
              {t('fuelPremiumRecipesFoot', {
                defaultValue:
                  'Seeded from protein science + DASH/Med principles for global accessibility.',
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="content-card border-primary/30">
          <CardHeader>
            <CardTitle>
              {t('fuelPremiumLockedTitle', {
                count: PREMIUM_RECIPE_COUNT,
                defaultValue: `+${PREMIUM_RECIPE_COUNT} Premium Recipes`,
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              {t('fuelPremiumLockedBody', {
                defaultValue:
                  'Unlock the full Fuel pillar recipe library, meal timing strategies, and advanced macro coaching via the Super Bundle.',
              })}
            </p>
            <ul className="text-xs space-y-1">
              {PREMIUM_RECIPE_TEASERS.map((name) => (
                <li key={name} className="flex gap-2">
                  <span className="text-primary">+</span>
                  <span>{name}</span>
                </li>
              ))}
            </ul>
            <Button variant="fitness" asChild>
              <Link href="/bundle">
                {t('fuelExploreBundle', { defaultValue: 'Explore Super Bundle' })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
