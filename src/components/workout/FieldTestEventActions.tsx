'use client';

/**
 * Garage / skip actions on the SDC card during a field-test session only.
 */

import { useTranslation } from 'react-i18next';

type Props = {
  isGarage: boolean;
  skipped: boolean;
  canSwap: boolean;
  onGarage: () => void;
  onSkip: () => void;
};

export function FieldTestEventActions({
  isGarage,
  skipped,
  canSwap,
  onGarage,
  onSkip,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-1 border-t-2 border-border pt-2">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {canSwap && !isGarage ? (
          <button
            type="button"
            onClick={onGarage}
            className="min-h-[44px] text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t('fieldTestGarageAction', {
              defaultValue: 'No sled — shuttle + farmer carry',
            })}
          </button>
        ) : null}
        {!skipped ? (
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[44px] text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t('fieldTestSkipAction', { defaultValue: 'Skip this event' })}
          </button>
        ) : null}
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {isGarage || skipped
          ? t('fieldTestGarageHint', {
              defaultValue: 'Unscored. Drops the 0–500 total.',
            })
          : t('fieldTestStartHint', {
              defaultValue:
                'Optional: pick a published scale column on the receipt to see points.',
            })}
      </p>
    </div>
  );
}
