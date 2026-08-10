'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronDown, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FuelMealPlanCard } from '@/components/nutrition/FuelMealPlanCard';
import {
  MealEstimateDraft,
  type MealDraftFields,
} from '@/components/nutrition/MealEstimateDraft';
import {
  FREE_RECIPE_COUNT,
  PREMIUM_RECIPE_COUNT,
  PREMIUM_RECIPE_TEASERS,
} from '@/data/recipes/catalogMeta';
import type { Recipe } from '@/data/recipes/types';
import { isFreeBeta } from '@/lib/freeBeta';

type Props = {
  freeRecipes: Recipe[];
  premium: boolean;
  premiumRecipes: Recipe[];
  premiumFetchError: boolean;
  onLogRecipe: (draft: MealDraftFields) => void;
  /** Optional retry when premium catalog fails */
  onRetryPremium?: () => void;
};

function recipeToDraft(r: Recipe): MealDraftFields {
  return {
    name: r.name,
    protein: r.protein,
    cals: r.cals,
    carbs: r.carbs ?? 0,
    fat: r.fat ?? 0,
  };
}

export function FuelRecipesPanel({
  freeRecipes,
  premium,
  premiumRecipes,
  premiumFetchError,
  onLogRecipe,
  onRetryPremium,
}: Props) {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();
  const [draft, setDraft] = useState<MealDraftFields | null>(null);

  const pickRecipe = (r: Recipe) => {
    setDraft(recipeToDraft(r));
  };

  return (
    <>
      {/* Upsell above the free recipe list so free users see Fuel Coach without scrolling. */}
      <FuelMealPlanCard />

      {draft ? (
        <MealEstimateDraft
          draft={draft}
          onChange={setDraft}
          confidence="high"
          sourceLabel={t('fuelSourceRecipe', { defaultValue: 'Recipe' })}
          logLabel={t('logRecipe', { defaultValue: 'Log recipe' })}
          onLog={() => {
            onLogRecipe(draft);
            setDraft(null);
          }}
          onDismiss={() => setDraft(null)}
        />
      ) : null}

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t('fuelFreeRecipesTitle', {
              count: freeRecipes.length || FREE_RECIPE_COUNT,
              defaultValue: `Recipes (${freeRecipes.length || FREE_RECIPE_COUNT})`,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {freeRecipes.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              className="py-6"
              title={t('fuelRecipesEmptyTitle', { defaultValue: 'No recipes loaded' })}
              description={t('fuelRecipesEmptyDesc', {
                defaultValue: 'Log meals manually above — recipes return on refresh.',
              })}
              actionLabel={t('fuelEmptyCta', { defaultValue: 'Log food' })}
              href="#fuel-log"
            />
          ) : (
            freeRecipes.map((r, i) => (
              <details key={i} className="group border-2 border-border  p-3 bg-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {r.protein}g protein · {r.cals} kcal
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      className="min-h-[44px] tap-target"
                      onClick={(e) => {
                        e.preventDefault();
                        pickRecipe(r);
                      }}
                    >
                      {t('fuelUseRecipe', { defaultValue: 'Use' })}
                    </Button>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="text-xs mt-2 pt-2 border-t border-border text-muted-foreground leading-relaxed">
                  {r.ingredients}
                </div>
              </details>
            ))
          )}
        </CardContent>
      </Card>

      {premiumFetchError && premium && (
        <ErrorState
          className="py-6"
          title={
            freeBeta
              ? t('fuelPremiumFetchFailedOpenBeta', {
                  defaultValue: 'Could not load extra recipes',
                })
              : t('fuelPremiumFetchFailed', {
                  defaultValue: 'Could not load premium recipes',
                })
          }
          description={
            freeBeta
              ? t('fuelPremiumOfflineOpenBeta', {
                  defaultValue:
                    'Extra recipes unavailable offline — free recipes above still work.',
                })
              : t('fuelPremiumOffline', {
                  defaultValue:
                    'Premium recipes unavailable offline — free recipes above still work.',
                })
          }
          actionLabel={
            onRetryPremium
              ? t('fuelPremiumRetry', { defaultValue: 'Try again' })
              : undefined
          }
          onAction={onRetryPremium}
        />
      )}

      {premium && !premiumFetchError ? (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {freeBeta
                ? t('fuelPremiumRecipesTitleCountBeta', {
                    count: premiumRecipes.length || PREMIUM_RECIPE_COUNT,
                    defaultValue: `More recipes (${premiumRecipes.length || PREMIUM_RECIPE_COUNT})`,
                  })
                : t('fuelPremiumRecipesTitleCountPaid', {
                    count: premiumRecipes.length || PREMIUM_RECIPE_COUNT,
                    defaultValue: `Premium recipes (${premiumRecipes.length || PREMIUM_RECIPE_COUNT})`,
                  })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {premiumRecipes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {freeBeta
                  ? t('fuelPremiumRecipesEmptyOpenBeta', {
                      defaultValue:
                        'Extra recipes could not load — free list above still works. Try again when you are online.',
                    })
                  : t('fuelPremiumRecipesEmpty', {
                      defaultValue:
                        'No premium recipes in this response — free list above still works.',
                    })}
              </p>
            ) : (
              premiumRecipes.map((r, i) => (
                <details key={i} className="group border-2 border-border  p-3 bg-card">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {r.protein}g protein · {r.cals} kcal
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.preventDefault();
                          pickRecipe(r);
                        }}
                      >
                        {t('fuelUseRecipe', { defaultValue: 'Use' })}
                      </Button>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </div>
                  </summary>
                  <div className="mt-2 pt-2 border-t border-border space-y-1">
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {r.ingredients}
                    </div>
                    <div className="text-xs leading-relaxed">{r.instructions}</div>
                    {r.tip ? (
                      <div className="text-[11px] text-muted-foreground italic">{r.tip}</div>
                    ) : null}
                  </div>
                </details>
              ))
            )}
            <div className="text-xs text-muted-foreground leading-relaxed">
              {t('fuelPremiumRecipesFoot', {
                defaultValue: 'Practical plates with protein first — edit macros before logging.',
              })}
            </div>
          </CardContent>
        </Card>
      ) : freeBeta || premium ? null : (
        <Card className="card-elevated">
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
            <Button variant="default" asChild>
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
