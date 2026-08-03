'use client';

/**
 * Adding an exercise to the live session, as a sheet.
 *
 * It was an inline `max-h-48` list sitting inside the scrolling logger header:
 * a search field, up to forty results in a 192px window, and a separate `+`
 * button beside it. So the list competed for height with the session it was
 * adding to, and choosing an exercise did nothing visible until you found and
 * pressed a `+` two elements away.
 *
 * In a sheet the list gets the room, and the choice confirms in the footer
 * where every other sheet's action is.
 */

import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { Button } from '@/components/ui/button';
import { ExercisePicker } from '@/components/library/ExercisePicker';

type Props = {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (exerciseId: string) => void;
  onConfirm: () => void;
};

export function AddExerciseSheet({ open, onClose, value, onChange, onConfirm }: Props) {
  const { t } = useTranslation();

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      size="sm"
      eyebrow={t('activeAddExerciseEyebrow', { defaultValue: 'This session' })}
      title={t('activeAddExerciseTitle', { defaultValue: 'Add exercise' })}
      bodyClassName="p-4"
      footer={
        <Button
          type="button"
          variant="default"
          className="w-full min-h-[52px]"
          disabled={!value}
          // Kept verbatim: `logger-depth` and `first-90` both drive this name.
          aria-label={t('activeAddSelectedExercise', {
            defaultValue: 'Add selected exercise',
          })}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          <Plus className="h-4 w-4 me-2" aria-hidden />
          {t('activeAddSelectedExercise', { defaultValue: 'Add selected exercise' })}
        </Button>
      }
    >
      <ExercisePicker value={value} onChange={onChange} listClassName="max-h-[52vh]" />
    </AdaptiveOverlay>
  );
}
