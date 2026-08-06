'use client';

/**
 * Set-options overflow for ActiveExerciseCard (Apply targets / Remove set).
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  shouldShowApplyTargetsMenuitem,
  shouldShowRemoveSetMenuitem,
} from '@/lib/workout/activeWorkoutHelpers';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasLastSets: boolean;
  hasPlanned: boolean;
  plannedSetCount: number;
  onApplyAllTargets: () => void;
  onRemoveSet: () => void;
};

export function ActiveSetOptionsMenu({
  open,
  onOpenChange,
  hasLastSets,
  hasPlanned,
  plannedSetCount,
  onApplyAllTargets,
  onRemoveSet,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="relative ms-auto">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="min-h-[44px] text-muted-foreground tap-target"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
      >
        {open
          ? t('activeSetLess', { defaultValue: 'Less' })
          : t('activeSetOptions', { defaultValue: 'Set options' })}
      </Button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label={t('activeCloseMenu', { defaultValue: 'Close menu' })}
            onClick={() => onOpenChange(false)}
          />
          <div
            role="menu"
            className="absolute end-0 bottom-full z-50 mb-1 min-w-[10rem] border-2 border-border bg-card p-1"
          >
            {shouldShowApplyTargetsMenuitem(hasLastSets, hasPlanned) && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full min-h-[44px] items-center px-3 text-sm hover:bg-muted text-start text-primary"
                onClick={() => {
                  onApplyAllTargets();
                  onOpenChange(false);
                }}
              >
                {t('activeApplyAllTargets', { defaultValue: 'Apply targets' })}
              </button>
            )}
            {shouldShowRemoveSetMenuitem(hasPlanned, plannedSetCount) && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full min-h-[44px] items-center px-3 text-sm hover:bg-muted text-start text-muted-foreground"
                onClick={() => {
                  onRemoveSet();
                  onOpenChange(false);
                }}
              >
                {t('activeRemoveSet', { defaultValue: 'Remove set' })}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
