'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { Camera, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { cn } from '@/lib/utils';

const PhotoMealLogger = dynamic(
  () => import('@/components/nutrition/PhotoMealLogger').then((m) => m.PhotoMealLogger),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted-foreground py-6 text-center">Loading photo log…</p>
    ),
  }
);

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

type QuickFood = readonly [string, number, number, number, number];

type Props = {
  open: boolean;
  onClose: () => void;
  meal: MealType;
  onMealChange: (meal: MealType) => void;
  quickFoods: readonly QuickFood[];
  onLog: (name: string, protein: number, cals: number, carbs?: number, fat?: number) => void;
  customName: string;
  customP: number;
  customC: number;
  customCarbs: number;
  customFat: number;
  onCustomNameChange: (v: string) => void;
  onCustomPChange: (v: number) => void;
  onCustomCChange: (v: number) => void;
  onCustomCarbsChange: (v: number) => void;
  onCustomFatChange: (v: number) => void;
  onCustomLog: () => void;
};

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function FuelLogSheet({
  open,
  onClose,
  meal,
  onMealChange,
  quickFoods,
  onLog,
  customName,
  customP,
  customC,
  customCarbs,
  customFat,
  onCustomNameChange,
  onCustomPChange,
  onCustomCChange,
  onCustomCarbsChange,
  onCustomFatChange,
  onCustomLog,
}: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'quick' | 'custom' | 'photo'>('quick');

  const mealLabel = (m: MealType) => {
    const keys: Record<MealType, string> = {
      breakfast: 'fuelMealBreakfast',
      lunch: 'fuelMealLunch',
      dinner: 'fuelMealDinner',
      snack: 'fuelMealSnack',
    };
    const defaults: Record<MealType, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
    };
    return t(keys[m], { defaultValue: defaults[m] });
  };

  const mealTabs = (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
      {MEALS.map((m) => (
        <Button
          key={m}
          size="sm"
          variant={meal === m ? 'default' : 'outline'}
          className="shrink-0 h-9  px-3.5"
          onClick={() => onMealChange(m)}
        >
          {mealLabel(m)}
        </Button>
      ))}
    </div>
  );

  const modeTabs = (
    <div className="flex gap-1  bg-card p-1">
      {(
        [
          ['quick', 'fuelTabQuick', Search, 'Quick'],
          ['custom', 'fuelTabCustom', Plus, 'Custom'],
          ['photo', 'fuelTabPhoto', Camera, 'Photo'],
        ] as const
      ).map(([id, key, Icon, def]) => (
        <Button
          key={id}
          size="sm"
          variant={tab === id ? 'secondary' : 'ghost'}
          className={cn(
            'flex-1 gap-1.5 h-9 ',
            tab === id && 'bg-card'
          )}
          onClick={() => setTab(id)}
        >
          <Icon className="h-3.5 w-3.5" />
          {t(key, { defaultValue: def })}
        </Button>
      ))}
    </div>
  );

  const tabBody = (
    <>
      {tab === 'quick' && (
        <div className="flex flex-wrap gap-2">
          {quickFoods.length === 0 ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('fuelNoEntries', {
                defaultValue: 'No frequent foods yet — try Custom or describe a meal on the page.',
              })}
            </p>
          ) : (
            quickFoods.map(([name, p, c, carbs, fat], i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="h-10  px-3.5 font-normal"
                onClick={() => {
                  onLog(name as string, p as number, c as number, carbs as number, fat as number);
                  onClose();
                }}
              >
                {name as string}
              </Button>
            ))
          )}
        </div>
      )}

      {tab === 'custom' && (
        <div className="space-y-4">
          <Input
            value={customName}
            onChange={(e) => onCustomNameChange(e.target.value)}
            placeholder={t('fuelFoodLabel', { defaultValue: 'Food' })}
            className="h-11"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1.5">
                {t('fuelProteinGLabel', { defaultValue: 'Protein g' })}
              </div>
              <Input
                type="number"
                value={customP}
                onChange={(e) => onCustomPChange(parseInt(e.target.value) || 0)}
                className="h-11"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1.5">
                {t('fuelCalsLabel', { defaultValue: 'Cals' })}
              </div>
              <Input
                type="number"
                value={customC}
                onChange={(e) => onCustomCChange(parseInt(e.target.value) || 0)}
                className="h-11"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1.5">
                {t('fuelCarbsShort', { defaultValue: 'Carbs' })}
              </div>
              <Input
                type="number"
                value={customCarbs}
                onChange={(e) => onCustomCarbsChange(parseInt(e.target.value) || 0)}
                className="h-11"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1.5">
                {t('fuelFatShort', { defaultValue: 'Fat' })}
              </div>
              <Input
                type="number"
                value={customFat}
                onChange={(e) => onCustomFatChange(parseInt(e.target.value) || 0)}
                className="h-11"
              />
            </div>
          </div>
          <Button
            variant="fitness"
            className="w-full h-11"
            disabled={!customName.trim()}
            onClick={() => {
              onCustomLog();
              onClose();
            }}
          >
            {t('fuelLogBtn', { defaultValue: 'Log' })}
          </Button>
        </div>
      )}

      {tab === 'photo' && (
        <PhotoMealLogger
          onLogEstimate={(est) => {
            onLog(est.name, est.protein, est.cals, est.carbs, est.fat);
            onClose();
          }}
        />
      )}
    </>
  );

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="lg"
      eyebrow={t('fuelLogSheetTitle', { defaultValue: 'Log food' })}
      title={mealLabel(meal)}
      bodyClassName="p-0"
    >
      {/* Compact / medium: stacked. Expanded (xl+): meal+mode left, body right. */}
      <div
        className={cn(
          'p-5 space-y-5',
          'xl:grid xl:grid-cols-[minmax(12rem,16rem)_1fr] xl:gap-6 xl:space-y-0 xl:items-start'
        )}
      >
        <div className="space-y-4 xl:sticky xl:top-0">
          {mealTabs}
          {modeTabs}
        </div>
        <div className="space-y-4 min-w-0 min-h-[12rem]">{tabBody}</div>
      </div>
    </AdaptiveOverlay>
  );
}
