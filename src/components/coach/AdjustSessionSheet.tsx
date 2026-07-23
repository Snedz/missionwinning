'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { MAJOR_GROUPS, type MuscleGroup } from '@/lib/muscleGroups';
import type { SessionConstraint } from '@/lib/coach/adjust';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdjust: (c: SessionConstraint) => void;
  className?: string;
};

export function AdjustSessionSheet({ open, onClose, onAdjust }: Props) {
  const { t } = useTranslation();
  const [hurtMode, setHurtMode] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const apply = (c: SessionConstraint, noteKey: string) => {
    onAdjust(c);
    setNote(noteKey);
    setHurtMode(false);
  };

  const handleClose = () => {
    setHurtMode(false);
    setNote(null);
    onClose();
  };

  return (
    <AdaptiveOverlay
      open={open}
      onClose={handleClose}
      size="sm"
      title={t('coachAdjustTitle', { defaultValue: "Adjust today's session" })}
      bodyClassName="p-5 space-y-3"
    >
      {!hurtMode ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            onClick={() => apply({ type: 'time', minutes: 20 }, 'coachAdjustNoteTime')}
          >
            {t('coachAdjust20', { defaultValue: '20 min' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            onClick={() => apply({ type: 'time', minutes: 30 }, 'coachAdjustNoteTime')}
          >
            {t('coachAdjust30', { defaultValue: '30 min' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            onClick={() =>
              apply({ type: 'equipment', equipment: 'bodyweight' }, 'coachAdjustNoteEquipment')
            }
          >
            {t('coachAdjustBodyweight', { defaultValue: 'No equipment today' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            onClick={() => setHurtMode(true)}
          >
            {t('coachAdjustHurts', { defaultValue: 'Something hurts' })}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {MAJOR_GROUPS.map((g) => (
            <Button
              key={g}
              type="button"
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={() =>
                apply({ type: 'avoid', group: g as MuscleGroup }, 'coachAdjustNoteAvoid')
              }
            >
              {g}
            </Button>
          ))}
        </div>
      )}

      {note ? (
        <p className="text-xs text-muted-foreground" role="status">
          {t(note, { defaultValue: note })}
        </p>
      ) : null}
    </AdaptiveOverlay>
  );
}
