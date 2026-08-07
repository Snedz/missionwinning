'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { MAJOR_GROUPS, type MuscleGroup } from '@/lib/muscleGroups';
import { muscleGroupLabel } from '@/lib/readinessDisplay';
import type { SessionConstraint } from '@/lib/coach/adjust';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdjust: (c: SessionConstraint) => void;
  className?: string;
};

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
      {children}
    </p>
  );
}

export function AdjustSessionSheet({ open, onClose, onAdjust }: Props) {
  const { t } = useTranslation();
  const [hurtMode, setHurtMode] = useState(false);
  const [applied, setApplied] = useState<SessionConstraint | null>(null);

  const apply = (c: SessionConstraint) => {
    onAdjust(c);
    setApplied(c);
    setHurtMode(false);
  };

  const handleClose = () => {
    setHurtMode(false);
    setApplied(null);
    onClose();
  };

  /**
   * What the session became, not that something happened. The sheet used to
   * confirm with a generic note key in 12px grey — true, but it did not say
   * which of the four things you pressed took effect.
   */
  const appliedLabel = (c: SessionConstraint): string => {
    if (c.type === 'time') {
      return t('coachAdjustAppliedTime', {
        minutes: c.minutes,
        defaultValue: `Trimmed to about ${c.minutes} minutes`,
      });
    }
    if (c.type === 'equipment') {
      return t('coachAdjustAppliedEquipment', {
        defaultValue: 'Rebuilt with bodyweight movements only',
      });
    }
    if (c.type === 'avoid') {
      return t('coachAdjustAppliedAvoid', {
        group: muscleGroupLabel(c.group, t),
        defaultValue: `Working around ${muscleGroupLabel(c.group, t)}`,
      });
    }
    return t('coachAdjustAppliedReadiness', {
      defaultValue: 'Scaled to how recovered you are',
    });
  };

  return (
    <AdaptiveOverlay
      open={open}
      onClose={handleClose}
      size="sm"
      className="min-h-[44px] tap-target"
      title={t('coachAdjustTitle', { defaultValue: "Adjust today's session" })}
      bodyClassName="p-5 space-y-5"
    >
      {/* Three labelled groups, not four flat chips. "20 min", "30 min", "No
          equipment today" and "Something hurts" sat in one row as peers, so
          nothing said that the first two were the same question. */}
      {!hurtMode ? (
        <>
          <div>
            <GroupLabel>{t('coachAdjustGroupTime', { defaultValue: 'Less time today' })}</GroupLabel>
            <div className="flex flex-wrap gap-2">
              {([20, 30] as const).map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant="outline"
                  className="min-h-[44px] border-2"
                  onClick={() => apply({ type: 'time', minutes })}
                >
                  {t('coachAdjustMinutes', { minutes, defaultValue: `${minutes} min` })}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <GroupLabel>{t('coachAdjustGroupGear', { defaultValue: 'Different gear' })}</GroupLabel>
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] border-2"
              onClick={() => apply({ type: 'equipment', equipment: 'bodyweight' })}
            >
              {t('coachAdjustBodyweight', { defaultValue: 'No equipment today' })}
            </Button>
          </div>

          <div>
            <GroupLabel>{t('coachAdjustGroupHurt', { defaultValue: 'Something hurts' })}</GroupLabel>
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] border-2"
              onClick={() => setHurtMode(true)}
            >
              {t('coachAdjustPickArea', { defaultValue: 'Pick the area' })}
            </Button>
          </div>
        </>
      ) : (
        <div>
          <GroupLabel>{t('coachAdjustGroupHurt', { defaultValue: 'Something hurts' })}</GroupLabel>
          {/* Rows, not chips — and the real labels, not the raw group ids the
              chips were printing. */}
          <ul className="border-t-2 border-border">
            {MAJOR_GROUPS.map((g) => (
              <li key={g} className="border-b border-border">
                <button
                  type="button"
                  className="flex min-h-[52px] w-full items-center px-1 text-start text-[15px] font-semibold transition-colors hover:bg-muted"
                  onClick={() => apply({ type: 'avoid', group: g as MuscleGroup })}
                >
                  {muscleGroupLabel(g as MuscleGroup, t)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {applied ? (
        <div className="card-boss p-4" role="status">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('coachAdjustAppliedTitle', { defaultValue: 'Applied' })}
          </p>
          <p className="text-[15px] font-semibold leading-snug">{appliedLabel(applied)}</p>
        </div>
      ) : null}
    </AdaptiveOverlay>
  );
}
