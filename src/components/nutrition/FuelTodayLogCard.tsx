'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { DangerZone } from '@/components/ui/DangerZone';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import {
  MealEstimateDraft,
  type MealDraftFields,
} from '@/components/nutrition/MealEstimateDraft';
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
  onRemoveEntry: (index: number) => void;
  onUpdateEntry: (index: number, next: MealDraftFields) => void;
  onLoadCloud: () => void;
  onSaveMeal: (entry: FuelLogEntry) => void;
};

const MEAL_ORDER: (MealType | 'other')[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

export function FuelTodayLogCard({
  logged,
  totalProtein,
  totalCals,
  cloudStatus,
  mealLabel,
  onClearDay,
  onRemoveEntry,
  onUpdateEntry,
  onLoadCloud,
  onSaveMeal,
}: Props) {
  const { t } = useTranslation();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<MealDraftFields | null>(null);

  const groupedLog = logged.reduce<Record<string, { entry: FuelLogEntry; index: number }[]>>(
    (acc, entry, index) => {
      const key = entry.meal ?? 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push({ entry, index });
      return acc;
    },
    {}
  );

  const orderedKeys = MEAL_ORDER.filter((k) => (groupedLog[k]?.length ?? 0) > 0);

  const startEdit = (index: number, entry: FuelLogEntry) => {
    setEditIndex(index);
    setEditDraft({
      name: entry.name,
      protein: entry.protein,
      cals: entry.cals,
      carbs: entry.carbs ?? 0,
      fat: entry.fat ?? 0,
    });
  };

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base font-semibold">
          {t('fuelTodayLogTitle', { defaultValue: "Today's meals" })}
        </CardTitle>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={onLoadCloud}>
            {t('fuelLoadCloud', { defaultValue: 'Load from cloud' })}
          </Button>
          {cloudStatus ? (
            <span className="text-[11px] text-primary self-center">{cloudStatus}</span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {logged.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title={t('fuelEmptyTitle', { defaultValue: 'No meals logged today' })}
            description={t('fuelNoEntries', {
              defaultValue: 'Log food above, or open Log food for a full entry.',
            })}
            actionLabel={t('fuelEmptyCta', { defaultValue: 'Log food' })}
            href="#fuel-log"
          />
        ) : (
          orderedKeys.map((mealKey) => {
            const entries = groupedLog[mealKey] ?? [];
            const mealP = entries.reduce((s, e) => s + e.entry.protein, 0);
            const mealC = entries.reduce((s, e) => s + e.entry.cals, 0);
            return (
              <details
                key={mealKey}
                className="group  border-2 border-border"
                open
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 min-h-[44px] [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-medium text-foreground">
                    {mealKey === 'other' ? mealLabel() : mealLabel(mealKey as MealType)}
                    <span className="ms-2 text-xs font-normal text-muted-foreground tabular-nums">
                      {entries.length} · {mealP}g P · {mealC} kcal
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 shrink-0" />
                </summary>
                <ul className="space-y-2 text-sm px-3 pb-3 border-t border-border pt-2">
                  {entries.map(({ entry: l, index }) => (
                    <li key={`${mealKey}-${index}`} className="space-y-2">
                      {editIndex === index && editDraft ? (
                        <MealEstimateDraft
                          draft={editDraft}
                          onChange={setEditDraft}
                          confidence="high"
                          sourceLabel={t('fuelEditEntry', { defaultValue: 'Edit entry' })}
                          logLabel={t('fuelSaveEntry', { defaultValue: 'Save changes' })}
                          onLog={() => {
                            onUpdateEntry(index, editDraft);
                            setEditIndex(null);
                            setEditDraft(null);
                          }}
                          onDismiss={() => {
                            setEditIndex(null);
                            setEditDraft(null);
                          }}
                        />
                      ) : (
                        <div className="flex justify-between gap-2 items-center py-0.5">
                          <span className="min-w-0 truncate">
                            <span className="text-muted-foreground tabular-nums text-xs me-1.5">
                              {l.time}
                            </span>
                            {l.name}
                          </span>
                          <span className="flex items-center gap-0.5 shrink-0">
                            <span className="text-muted-foreground tabular-nums text-xs me-1">
                              +{l.protein}g P · {l.cals} kcal
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-11 w-11 p-0 tap-target"
                              aria-label={t('fuelEditEntry', { defaultValue: 'Edit entry' })}
                              onClick={() => startEdit(index, l)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-11 min-h-[44px] px-2 text-[11px] tap-target"
                              onClick={() => onSaveMeal(l)}
                            >
                              {t('fuelSaveMeal', { defaultValue: 'Save' })}
                            </Button>
                            <HoldToConfirmButton
                              size="sm"
                              className="h-11 w-11 tap-target"
                              label={t('fuelDeleteMealEntry', { defaultValue: 'Delete meal entry' })}
                              icon={<Trash2 className="h-3.5 w-3.5" />}
                              onConfirm={() => onRemoveEntry(index)}
                            />
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            );
          })
        )}
        <div className="pt-3 border-t border-border text-sm flex justify-between font-medium">
          <span>{t('fuelTotals', { defaultValue: 'Totals' })}</span>
          <span className="tabular-nums">
            {t('fuelTotalsLine', {
              protein: totalProtein,
              cals: totalCals,
              defaultValue: `${totalProtein}g protein · ${totalCals} kcal`,
            })}
          </span>
        </div>
        {logged.length > 0 ? (
          <DangerZone
            title={t('fuelDangerZone', { defaultValue: 'Danger zone' })}
            description={t('fuelClearDayHint', {
              defaultValue: 'Clears every meal logged today. Hold to confirm.',
            })}
          >
            <HoldToConfirmButton
              size="sm"
              label={t('fuelClearTodaysMeals', { defaultValue: "Clear today's meals" })}
              onConfirm={onClearDay}
            />
          </DangerZone>
        ) : null}
      </CardContent>
    </Card>
  );
}
