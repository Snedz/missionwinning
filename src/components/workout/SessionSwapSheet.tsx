'use client';

/**
 * This-session swap door — garage stand-ins plus another catalog movement.
 * Confirm in the footer. Does not rewrite Wednesday or saved routines.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { ExercisePicker } from '@/components/library/ExercisePicker';
import { GarageSwapList } from '@/components/workout/GarageSwapList';
import type { Exercise } from '@/types';

type Props = {
  open: boolean;
  onClose: () => void;
  currentId: string;
  garageOptions: Exercise[];
  onConfirm: (id: string) => void;
};

export function SessionSwapSheet({
  open,
  onClose,
  currentId,
  garageOptions,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [pendingId, setPendingId] = useState('');

  useEffect(() => {
    if (!open) setPendingId('');
  }, [open]);

  const canConfirm = Boolean(pendingId && pendingId !== currentId);

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="sm"
      className="mw-house house-swap-sheet"
      eyebrow={t('activeSwapThisSessionEyebrow', { defaultValue: 'This session' })}
      title={t('activeSwapThisSessionTitle', { defaultValue: 'Swap this exercise' })}
      bodyClassName="p-4"
      footer={
        <button
          type="button"
          className="house-btn min-h-[52px] w-full tap-target"
          disabled={!canConfirm}
          data-testid="session-swap-confirm"
          aria-label={t('activeSwapConfirm', { defaultValue: 'Swap this session' })}
          onClick={() => {
            if (!canConfirm) return;
            onConfirm(pendingId);
            onClose();
          }}
        >
          {t('activeSwapConfirm', { defaultValue: 'Swap this session' })}
        </button>
      }
    >
      <div className="space-y-4" data-testid="session-swap-sheet">
        {garageOptions.length > 0 ? (
          <GarageSwapList
            options={garageOptions}
            selectedId={pendingId}
            onChoose={setPendingId}
          />
        ) : null}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('activeSwapAnotherMovement', { defaultValue: 'Another movement' })}
          </p>
          <ExercisePicker
            value={pendingId}
            onChange={setPendingId}
            listClassName="max-h-[36vh]"
          />
        </div>
      </div>
    </AdaptiveOverlay>
  );
}
