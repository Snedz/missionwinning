'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { scaleMealMacros } from '@/lib/nutritionQuickLog';
import type { MealDraftFields } from '@/lib/mealDraft';

export type { MealDraftFields };

type Props = {
  draft: MealDraftFields;
  onChange: (next: MealDraftFields) => void;
  onLog: () => void;
  onDismiss?: () => void;
  confidence?: 'low' | 'medium' | 'high';
  /** Short source chip, e.g. "Matched foods" / "Rough estimate" / "Vision" */
  sourceLabel?: string;
  className?: string;
  logLabel?: string;
};

const SERVINGS = [0.5, 1, 1.5, 2, 3] as const;

function num(v: string): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function servingLabel(s: number): string {
  if (s === 0.5) return '½';
  if (s === 1.5) return '1½';
  return String(s);
}

/**
 * Editable macro draft before logging — accuracy depends on user correction.
 * Serving chips scale from a base snapshot (speed logging steal from MFP/MacroFactor).
 */
export function MealEstimateDraft({
  draft,
  onChange,
  onLog,
  onDismiss,
  confidence = 'medium',
  sourceLabel,
  className,
  logLabel,
}: Props) {
  const { t } = useTranslation();
  const low = confidence === 'low';
  const baseRef = useRef<MealDraftFields>({ ...draft });
  const [servings, setServings] = useState(1);

  // When name changes from parent (new food), reset base + servings
  useEffect(() => {
    baseRef.current = {
      name: draft.name,
      protein: draft.protein,
      cals: draft.cals,
      carbs: draft.carbs,
      fat: draft.fat,
    };
    setServings(1);
    // Only when identity of food changes — parent replaces whole draft
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: name identity
  }, [draft.name]);

  const applyServings = (s: number) => {
    setServings(s);
    const scaled = scaleMealMacros(baseRef.current, s);
    onChange({
      name: draft.name,
      ...scaled,
    });
  };

  const onManualField = (patch: Partial<MealDraftFields>) => {
    const next = { ...draft, ...patch };
    onChange(next);
    // Manual edit becomes new base at 1 serving
    baseRef.current = { ...next };
    setServings(1);
  };

  return (
    <div
      className={cn(
        ' border p-4 space-y-3',
        low ? 'border-primary bg-accent-100' : 'border-border bg-card',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">
          {t('fuelEstimateDraftTitle', { defaultValue: 'Review estimate' })}
        </p>
        {sourceLabel ? (
          <span className="text-[11px] font-medium text-muted-foreground border-2 border-border  px-2 py-0.5">
            {sourceLabel}
          </span>
        ) : null}
        {confidence ? (
          <span
            className={cn(
              'text-[11px] font-medium  px-2 py-0.5 border',
              low
                ? 'border-primary text-primary'
                : 'border-border text-muted-foreground'
            )}
          >
            {confidence === 'high'
              ? t('fuelConfHigh', { defaultValue: 'Higher confidence' })
              : confidence === 'medium'
                ? t('fuelConfMed', { defaultValue: 'Medium confidence' })
                : t('fuelConfLow', { defaultValue: 'Low confidence — fix numbers' })}
          </span>
        ) : null}
      </div>

      {low ? (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('fuelEstimateLowHint', {
            defaultValue:
              'We could not match this well. Edit protein and calories before logging, or search foods instead.',
          })}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('fuelEstimateEditHint', {
            defaultValue: 'Estimates are approximate — adjust anything that looks off, then log.',
          })}
        </p>
      )}

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">
          {t('fuelServings', { defaultValue: 'Servings' })}
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('fuelServings', { defaultValue: 'Servings' })}>
          {SERVINGS.map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={servings === s ? 'selected' : 'outline'}
              className="h-8 min-w-[2.5rem]  px-2.5 text-xs tabular-nums"
              onClick={() => applyServings(s)}
            >
              {servingLabel(s)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground" htmlFor="meal-draft-name">
          {t('fuelFoodLabel', { defaultValue: 'Food' })}
        </label>
        <Input
          id="meal-draft-name"
          value={draft.name}
          onChange={(e) => onManualField({ name: e.target.value })}
          className="h-10"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="meal-draft-p">
            {t('fuelProteinGLabel', { defaultValue: 'Protein g' })}
          </label>
          <Input
            id="meal-draft-p"
            type="number"
            min={0}
            value={draft.protein}
            onChange={(e) => onManualField({ protein: num(e.target.value) })}
            className="h-10 mt-0.5"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="meal-draft-cals">
            {t('fuelCalsLabel', { defaultValue: 'Cals' })}
          </label>
          <Input
            id="meal-draft-cals"
            type="number"
            min={0}
            value={draft.cals}
            onChange={(e) => onManualField({ cals: num(e.target.value) })}
            className="h-10 mt-0.5"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="meal-draft-c">
            {t('fuelCarbsShort', { defaultValue: 'Carbs' })}
          </label>
          <Input
            id="meal-draft-c"
            type="number"
            min={0}
            value={draft.carbs}
            onChange={(e) => onManualField({ carbs: num(e.target.value) })}
            className="h-10 mt-0.5"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="meal-draft-f">
            {t('fuelFatShort', { defaultValue: 'Fat' })}
          </label>
          <Input
            id="meal-draft-f"
            type="number"
            min={0}
            value={draft.fat}
            onChange={(e) => onManualField({ fat: num(e.target.value) })}
            className="h-10 mt-0.5"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="default"
          className="h-10"
          disabled={!draft.name.trim()}
          onClick={onLog}
        >
          {logLabel ?? t('fuelLogMeal', { defaultValue: 'Log meal' })}
        </Button>
        {onDismiss ? (
          <Button type="button" variant="outline" className="h-10" onClick={onDismiss}>
            {t('fuelEstimateDismiss', { defaultValue: 'Clear' })}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
