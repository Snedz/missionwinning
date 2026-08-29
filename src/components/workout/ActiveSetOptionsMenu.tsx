'use client';

/**
 * Set-options overflow for ActiveExerciseCard (Apply targets / Remove set).
 */

import { useTranslation } from 'react-i18next';
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
      <button
        type="button"
        className="house-btn house-btn-ghost min-h-[44px] tap-target"
        data-testid="active-set-options"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
      >
        {open
          ? t('activeSetLess', { defaultValue: 'Less' })
          : t('activeSetOptions', { defaultValue: 'Set options' })}
      </button>
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
            className="house-card house-set-options absolute end-0 bottom-full z-50 mb-1 min-w-[10rem]"
          >
            {shouldShowApplyTargetsMenuitem(hasLastSets, hasPlanned) && (
              <button
                type="button"
                role="menuitem"
                className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
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
                className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
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
