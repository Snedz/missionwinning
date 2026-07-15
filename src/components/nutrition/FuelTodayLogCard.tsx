'use client';

import { useTranslation } from 'react-i18next';
import { ChevronDown, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { MealType } from '@/components/nutrition/FuelLogSheet';

export type FuelLogEntry = {
  name: string;
  protein: number;
  cals: number;
  carbs?: number;
  fat?: number;
  time: string;
  meal?: MealType;
};

type Props = {
  logged: FuelLogEntry[];
  totalProtein: number;
  totalCals: number;
  cloudStatus: string;
  mealLabel: (meal?: MealType) => string;
  onClearDay: () => void;
  onLoadCloud: () => void;
  onOpenLogSheet: () => void;
  onSaveMeal: (entry: FuelLogEntry) => void;
};

export function FuelTodayLogCard({
  logged,
  totalProtein,
  totalCals,
  cloudStatus,
  mealLabel,
  onClearDay,
  onLoadCloud,
  onOpenLogSheet,
  onSaveMeal,
}: Props) {
  const { t } = useTranslation();

  const groupedLog = logged.reduce<Record<string, FuelLogEntry[]>>((acc, entry) => {
    const key = entry.meal ?? 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <Card className="content-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('fuelTodayLogTitle', { defaultValue: "Today's Log" })}</CardTitle>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="ghost" size="sm" onClick={onClearDay}>
            {t('fuelClearDay', { defaultValue: 'Clear day' })}
          </Button>
          <Button variant="outline" size="sm" onClick={onLoadCloud}>
            {t('fuelLoadCloud', { defaultValue: 'Load from Cloud' })}
          </Button>
          {cloudStatus ? (
            <span className="text-[10px] text-primary self-center">{cloudStatus}</span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {logged.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title={t('fuelEmptyTitle', { defaultValue: 'No meals logged today' })}
            description={t('fuelNoEntries', {
              defaultValue:
                'After training, log one meal — protein and calories feed your Win Score. Describe a meal above or tap Log meal.',
            })}
            actionLabel={t('fuelLogFirstMeal', { defaultValue: 'Log first meal' })}
            onAction={onOpenLogSheet}
          />
        ) : (
          Object.entries(groupedLog).map(([mealKey, entries]) => (
            <details
              key={mealKey}
              className="group mb-3 last:mb-0 rounded-lg border border-border/40"
              open
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 min-h-[44px] [&::-webkit-details-marker]:hidden">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {mealKey === 'other' ? mealLabel() : mealLabel(mealKey as MealType)}
                  <span className="ms-2 normal-case font-normal tabular-nums">
                    ({entries.length})
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <ul className="space-y-1 text-sm px-3 pb-3 border-t border-border/30 pt-2">
                {entries.map((l, i) => (
                  <li key={`${mealKey}-${i}`} className="flex justify-between gap-2 items-center">
                    <span className="min-w-0 truncate">
                      {l.time} — {l.name}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-muted-foreground tabular-nums text-xs">
                        +{l.protein}g P • {l.cals} kcal
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px]"
                        onClick={() => onSaveMeal(l)}
                      >
                        {t('fuelSaveMeal', { defaultValue: 'Save' })}
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ))
        )}
        <div className="mt-4 pt-3 border-t text-sm flex justify-between font-medium">
          <span>{t('fuelTotals', { defaultValue: 'Totals' })}</span>
          <span className="tabular-nums">
            {t('fuelTotalsLine', {
              protein: totalProtein,
              cals: totalCals,
              defaultValue: `${totalProtein}g protein • ${totalCals} kcal`,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
