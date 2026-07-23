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
  onCustomNameChange: (v: string) => void;
  onCustomPChange: (v: number) => void;
  onCustomCChange: (v: number) => void;
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
  onCustomNameChange,
  onCustomPChange,
  onCustomCChange,
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
    <div className="flex gap-2 overflow-x-auto pb-1">
      {MEALS.map((m) => (
        <Button
          key={m}
          size="sm"
          variant={meal === m ? 'default' : 'outline'}
          className="shrink-0"
          onClick={() => onMealChange(m)}
        >
          {mealLabel(m)}
        </Button>
      ))}
    </div>
  );

  const modeTabs = (
    <div className="flex gap-1 border-b border-border/30 pb-3">
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
          className="flex-1 gap-1"
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
          {quickFoods.map(([name, p, c, carbs, fat], i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => {
                onLog(name as string, p as number, c as number, carbs as number, fat as number);
                onClose();
              }}
            >
              {name as string}
            </Button>
          ))}
        </div>
      )}

      {tab === 'custom' && (
        <div className="space-y-3">
          <Input
            value={customName}
            onChange={(e) => onCustomNameChange(e.target.value)}
            placeholder={t('fuelFoodLabel', { defaultValue: 'Food' })}
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-xs mb-1">{t('fuelProteinGLabel', { defaultValue: 'Protein g' })}</div>
              <Input
                type="number"
                value={customP}
                onChange={(e) => onCustomPChange(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex-1">
              <div className="text-xs mb-1">{t('fuelCalsLabel', { defaultValue: 'Cals' })}</div>
              <Input
                type="number"
                value={customC}
                onChange={(e) => onCustomCChange(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <Button
            variant="fitness"
            className="w-full"
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
      eyebrow={t('fuelLogSheetTitle', { defaultValue: 'Log to Fuel' })}
      title={mealLabel(meal)}
      bodyClassName="p-0"
    >
      {/* Compact / medium: stacked. Expanded (xl+): meal+mode left, body right. */}
      <div
        className={cn(
          'p-5 space-y-4',
          'xl:grid xl:grid-cols-[minmax(12rem,16rem)_1fr] xl:gap-6 xl:space-y-0 xl:items-start'
        )}
      >
        <div className="space-y-3 xl:sticky xl:top-0">
          {mealTabs}
          {modeTabs}
        </div>
        <div className="space-y-4 min-w-0">{tabBody}</div>
      </div>
    </AdaptiveOverlay>
  );
}
