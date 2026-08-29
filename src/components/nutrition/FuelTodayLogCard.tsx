'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
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
    <section
      data-testid="fuel-today-log"
      className="house-card house-fuel-today"
    >
      <div className="house-fuel-today-head">
        <h2 className="house-fuel-today-name">
          {t('fuelTodayLogTitle', { defaultValue: "Today's meals" })}
        </h2>
        <div className="house-fuel-today-tools">
          <button
            type="button"
            className="house-btn house-btn-ghost min-h-[44px] tap-target"
            onClick={onLoadCloud}
          >
            {t('fuelLoadCloud', { defaultValue: 'Load from Cloud' })}
          </button>
          {cloudStatus ? <span className="house-lede">{cloudStatus}</span> : null}
        </div>
      </div>

      {logged.length === 0 ? (
        <EmptyState
          className="house-empty"
          icon={UtensilsCrossed}
          title={t('fuelEmptyTitle', { defaultValue: 'No meals logged today' })}
          description={t('fuelNoEntries', {
            defaultValue: 'Describe what you ate above, or tap Log food — always review macros before logging.',
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
            <details key={mealKey} className="house-fuel-meal" open>
              <summary className="house-fuel-meal-sum min-h-[44px] tap-target">
                <span>
                  {mealKey === 'other' ? mealLabel() : mealLabel(mealKey as MealType)}
                  <span className="house-lede">
                    {entries.length} · {mealP}g P · {mealC} kcal
                  </span>
                </span>
                <ChevronDown className="house-fuel-meal-chevron h-4 w-4 shrink-0" />
              </summary>
              <ul className="house-fuel-meal-list">
                {entries.map(({ entry: l, index }) => (
                  <li key={`${mealKey}-${index}`}>
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
                      <div className="house-fuel-meal-row">
                        <span className="house-fuel-meal-name">
                          <span className="house-lede">{l.time}</span>
                          {l.name}
                        </span>
                        <span className="house-fuel-meal-acts">
                          <span className="house-lede">
                            +{l.protein}g P · {l.cals} kcal
                          </span>
                          <button
                            type="button"
                            className="house-btn house-btn-ghost min-h-[44px] w-11 p-0 tap-target"
                            aria-label={t('fuelEditEntry', { defaultValue: 'Edit entry' })}
                            onClick={() => startEdit(index, l)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="house-btn house-btn-ghost min-h-[44px] tap-target"
                            onClick={() => onSaveMeal(l)}
                          >
                            {t('fuelSaveMeal', { defaultValue: 'Save' })}
                          </button>
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

      <div className="house-fuel-today-totals">
        <span>{t('fuelTotals', { defaultValue: 'Totals' })}</span>
        <span>
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
            className="min-h-[44px] tap-target"
            label={t('fuelClearTodaysMeals', { defaultValue: "Clear today's meals" })}
            onConfirm={onClearDay}
          />
        </DangerZone>
      ) : null}
    </section>
  );
}
