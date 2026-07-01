'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhotoLogStub } from '@/components/nutrition/PhotoLogStub';
import { cn } from '@/lib/utils';

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

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close log sheet"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[88vh] overflow-y-auto',
          'rounded-t-2xl border border-border/60 bg-card shadow-2xl',
          'animate-in slide-in-from-bottom duration-200 pb-[env(safe-area-inset-bottom)]'
        )}
        role="dialog"
        aria-labelledby="fuel-log-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-card/95 backdrop-blur px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {t('fuelLogSheetTitle', { defaultValue: 'Log to Fuel' })}
            </p>
            <h2 id="fuel-log-title" className="text-lg font-semibold">{mealLabel(meal)}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-3 flex gap-2 overflow-x-auto">
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

        <div className="px-5 pt-3 flex gap-1 border-b border-border/30 pb-3">
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

        <div className="p-5 space-y-4">
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
            <PhotoLogStub
              onLogEstimate={(est) => {
                onLog(est.name, est.protein, est.cals, est.carbs, est.fat);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
