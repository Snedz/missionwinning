'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { Camera, PenLine, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { estimateMealFromDescription } from '@/lib/nlMealLog';
import { cn } from '@/lib/utils';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

const PhotoMealLogger = dynamic(
  () => import('@/components/nutrition/PhotoMealLogger').then((m) => m.PhotoMealLogger),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted-foreground py-6 text-center" role="status" aria-busy="true">
        Loading photo log…
      </p>
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
  const [tab, setTab] = useState<'quick' | 'describe' | 'custom' | 'photo'>('quick');
  const [description, setDescription] = useState('');
  const [describeMiss, setDescribeMiss] = useState(false);
  /** Honesty strip on Custom after Describe — source + confidence, never silent. */
  const [estimateMeta, setEstimateMeta] = useState<{
    source: 'matched' | 'rough';
    confidence: 'low' | 'medium' | 'high';
    matched: string[];
  } | null>(null);

  /**
   * Fills Custom fields and hands over — edit-before-log, one review path.
   * Always carries source/confidence onto Custom so a rough guess is never
   * dressed as a match. `describeMiss` is only for empty/too-short input
   * (the estimator never invents numbers for blank text).
   */
  const runEstimate = () => {
    const estimate = estimateMealFromDescription(description);
    if (!estimate) {
      setDescribeMiss(true);
      setEstimateMeta(null);
      return;
    }
    setDescribeMiss(false);
    setEstimateMeta({
      source: estimate.source,
      confidence: estimate.confidence,
      matched: estimate.matched,
    });
    onCustomNameChange(estimate.name);
    onCustomPChange(estimate.protein);
    onCustomCChange(estimate.cals);
    onCustomCarbsChange(estimate.carbs);
    onCustomFatChange(estimate.fat);
    setTab('custom');
  };

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

  // One ruled strip with 1px divisions, not four pills in a sideways scroller.
  // There are exactly four meals and they always fit.
  const mealTabs = (
    <SegmentedControl
      options={MEALS.map((m) => ({ value: m, label: mealLabel(m) }))}
      value={meal}
      onChange={onMealChange}
      ariaLabel={t('fuelMealStripLabel', { defaultValue: 'Meal' })}
      fill
    />
  );

  const modeTabs = (
    /* `.240` — was four `Button`s whose active state was `bg-card` on a
       `bg-card` parent: 1.01:1, the same invisible-control trap `.155` found on
       the check-in scales. Now the one segmented control, where selected is a
       tint ground under a 2px poster rule. */
    <SegmentedControl
      options={[
        { value: 'quick' as const, label: t('fuelTabQuick', { defaultValue: 'Quick' }), icon: Search },
        { value: 'describe' as const, label: t('fuelTabDescribe', { defaultValue: 'Describe' }), icon: PenLine },
        { value: 'custom' as const, label: t('fuelTabCustom', { defaultValue: 'Custom' }), icon: Plus },
        { value: 'photo' as const, label: t('fuelTabPhoto', { defaultValue: 'Photo' }), icon: Camera },
      ]}
      value={tab}
      onChange={setTab}
      ariaLabel={t('fuelModeStripLabel', { defaultValue: 'Log method' })}
      fill
    />
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

      {tab === 'describe' && (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('fuelDescribeHint', {
              defaultValue:
                'Type what you ate in plain words. We estimate the macros, then you check them before logging.',
            })}
          </p>
          <Input
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDescribeMiss(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runEstimate();
            }}
            placeholder={t('fuelDescribePlaceholder', {
              defaultValue: 'chicken rice broccoli',
            })}
            className="h-11"
          />
          <Button
            type="button"
            variant="fitness"
            className="w-full min-h-[44px]"
            disabled={!description.trim()}
            onClick={runEstimate}
          >
            {t('fuelDescribeEstimate', { defaultValue: 'Estimate macros' })}
          </Button>
          {describeMiss ? (
            /* An honest miss, not a fabricated guess: the estimator returns
               null when it recognises nothing, and inventing numbers there
               would be worse than saying so. */
            <p className="border-s-2 border-primary ps-2 text-xs font-semibold text-primary">
              {t('fuelDescribeMiss', {
                defaultValue: 'No foods recognised in that — try Custom and enter it yourself.',
              })}
            </p>
          ) : null}
        </div>
      )}

      {tab === 'custom' && (
        <div className="space-y-4">
          {estimateMeta ? (
            <div
              className={
                estimateMeta.source === 'rough' || estimateMeta.confidence === 'low'
                  ? 'border-2 border-primary bg-accent-100 p-3 space-y-1.5'
                  : 'border-2 border-border bg-card p-3 space-y-1.5'
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium border-2 border-border px-2 py-0.5 text-muted-foreground">
                  {estimateMeta.source === 'matched'
                    ? t('fuelSourceMatched', { defaultValue: 'Matched foods' })
                    : t('fuelSourceRough', { defaultValue: 'Rough estimate' })}
                </span>
                <span
                  className={
                    estimateMeta.confidence === 'low'
                      ? 'text-[11px] font-medium border-2 border-primary px-2 py-0.5 text-primary'
                      : 'text-[11px] font-medium border-2 border-border px-2 py-0.5 text-muted-foreground'
                  }
                >
                  {estimateMeta.confidence === 'high'
                    ? t('fuelConfHigh', { defaultValue: 'Higher confidence' })
                    : estimateMeta.confidence === 'medium'
                      ? t('fuelConfMed', { defaultValue: 'Medium confidence' })
                      : t('fuelConfLow', { defaultValue: 'Low confidence — edit before log' })}
                </span>
              </div>
              {estimateMeta.matched.length > 0 ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('fuelEstimateMatchedList', {
                    list: estimateMeta.matched.join(' · '),
                    defaultValue: `Detected: ${estimateMeta.matched.join(' · ')}`,
                  })}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('fuelEstimateRoughNote', {
                    defaultValue:
                      'No foods matched — these numbers are a placeholder. Edit them before logging.',
                  })}
                </p>
              )}
            </div>
          ) : null}
          <Input
            value={customName}
            onChange={(e) => {
              onCustomNameChange(e.target.value);
              setEstimateMeta(null);
            }}
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
                onChange={(e) => {
                  onCustomPChange(parseInt(e.target.value) || 0);
                  setEstimateMeta((m) => (m ? { ...m, confidence: 'low' } : m));
                }}
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
                onChange={(e) => {
                  onCustomCChange(parseInt(e.target.value) || 0);
                  setEstimateMeta((m) => (m ? { ...m, confidence: 'low' } : m));
                }}
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
                onChange={(e) => {
                  onCustomCarbsChange(parseInt(e.target.value) || 0);
                  setEstimateMeta((m) => (m ? { ...m, confidence: 'low' } : m));
                }}
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
                onChange={(e) => {
                  onCustomFatChange(parseInt(e.target.value) || 0);
                  setEstimateMeta((m) => (m ? { ...m, confidence: 'low' } : m));
                }}
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
              setEstimateMeta(null);
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
