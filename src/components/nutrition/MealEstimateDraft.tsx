'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type MealDraftFields = {
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
};

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

function num(v: string): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Editable macro draft before logging — accuracy depends on user correction.
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

  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-3',
        low ? 'border-status-warn/40 bg-[hsl(var(--status-warn)/0.08)]' : 'border-border/50 bg-muted/15',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">
          {t('fuelEstimateDraftTitle', { defaultValue: 'Review estimate' })}
        </p>
        {sourceLabel ? (
          <span className="text-[11px] font-medium text-muted-foreground border border-border/50 rounded-full px-2 py-0.5">
            {sourceLabel}
          </span>
        ) : null}
        {confidence ? (
          <span
            className={cn(
              'text-[11px] font-medium rounded-full px-2 py-0.5 border',
              low
                ? 'border-status-warn/40 text-status-warn'
                : 'border-border/50 text-muted-foreground'
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

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground" htmlFor="meal-draft-name">
          {t('fuelFoodLabel', { defaultValue: 'Food' })}
        </label>
        <Input
          id="meal-draft-name"
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
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
            onChange={(e) => onChange({ ...draft, protein: num(e.target.value) })}
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
            onChange={(e) => onChange({ ...draft, cals: num(e.target.value) })}
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
            onChange={(e) => onChange({ ...draft, carbs: num(e.target.value) })}
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
            onChange={(e) => onChange({ ...draft, fat: num(e.target.value) })}
            className="h-10 mt-0.5"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="fitness"
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
