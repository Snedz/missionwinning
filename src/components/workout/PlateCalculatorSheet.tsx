'use client';

import { useTranslation } from 'react-i18next';
import { PlateCalculatorPanel } from '@/components/calculators/PlateCalculatorPanel';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';

type Props = {
  open: boolean;
  onClose: () => void;
  initialTarget?: number;
  onApplyTarget?: (weight: number) => void;
};

export function PlateCalculatorSheet({ open, onClose, initialTarget, onApplyTarget }: Props) {
  const { t } = useTranslation();

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="sm"
      eyebrow={t('activePlateCalcTitle', { defaultValue: 'Plate calculator' })}
      title={t('activePlateCalcSubtitle', { defaultValue: 'Load the bar' })}
      className="mw-house house-plates-sheet"
      bodyClassName="p-5"
    >
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
    </AdaptiveOverlay>
  );
}
