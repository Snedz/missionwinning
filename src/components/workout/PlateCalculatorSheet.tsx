'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { PlateCalculatorPanel } from '@/components/calculators/PlateCalculatorPanel';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  initialTarget?: number;
  onApplyTarget?: (weight: number) => void;
};

export function PlateCalculatorSheet({ open, onClose, initialTarget, onApplyTarget }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close plate calculator"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto',
          'rounded-t-2xl sm:rounded-2xl border border-border/60 bg-card shadow-2xl',
          'animate-in slide-in-from-bottom duration-200 pb-[env(safe-area-inset-bottom)]'
        )}
        role="dialog"
        aria-labelledby="plate-calc-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border/40 bg-card/95 backdrop-blur px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {t('activePlateCalcTitle', { defaultValue: 'Plate calculator' })}
            </p>
            <h2 id="plate-calc-title" className="text-lg font-semibold">
              {t('activePlateCalcSubtitle', { defaultValue: 'Load the bar' })}
            </h2>
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

        <div className="p-5">
          <PlateCalculatorPanel
            compact
            initialTarget={initialTarget}
            onApplyTarget={
              onApplyTarget
                ? (weight) => {
                    onApplyTarget(weight);
                    onClose();
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
