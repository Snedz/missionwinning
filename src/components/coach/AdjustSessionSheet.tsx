'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MAJOR_GROUPS, type MuscleGroup } from '@/lib/muscleGroups';
import type { SessionConstraint } from '@/lib/coach/adjust';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdjust: (c: SessionConstraint) => void;
  className?: string;
};

export function AdjustSessionSheet({ open, onClose, onAdjust, className }: Props) {
  const { t } = useTranslation();
  const [hurtMode, setHurtMode] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (!open) return null;

  const apply = (c: SessionConstraint, noteKey: string) => {
    onAdjust(c);
    setNote(noteKey);
    setHurtMode(false);
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-sm',
        className
      )}
      role="dialog"
      aria-label={t('coachAdjustTitle', { defaultValue: "Adjust today's session" })}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-sm">
          {t('coachAdjustTitle', { defaultValue: "Adjust today's session" })}
        </p>
        <button
          type="button"
          className="text-xs text-muted-foreground min-h-[44px] px-2"
          onClick={() => {
            setHurtMode(false);
            setNote(null);
            onClose();
          }}
        >
          {t('coachAdjustClose', { defaultValue: 'Done' })}
        </button>
      </div>

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
    </div>
  );
}
