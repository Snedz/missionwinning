'use client';

/**
 * D12 — Pump-inspired manage-program menu, Modernist register.
 * Adjust today · Change schedule · Regenerate · Ask coach.
 * Refuse: pause / restart / week numbers (no durable plan history).
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { Button } from '@/components/ui/button';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { CoachScheduleEditor } from '@/components/coach/CoachScheduleEditor';

type Panel = 'menu' | 'schedule';

type Props = {
  open: boolean;
  onClose: () => void;
  canAdjustToday: boolean;
  onAdjustToday: () => void;
  canRegenerate: boolean;
  onRegenerate: () => void;
};

export function CoachManageSheet({
  open,
  onClose,
  canAdjustToday,
  onAdjustToday,
  canRegenerate,
  onRegenerate,
}: Props) {
  const { t } = useTranslation();
  const [panel, setPanel] = useState<Panel>('menu');
  const [scheduleDirty, setScheduleDirty] = useState(false);

  const handleClose = () => {
    setPanel('menu');
    setScheduleDirty(false);
    onClose();
  };

  return (
    <AdaptiveOverlay
      open={open}
      onClose={handleClose}
      size="sm"
      title={
        panel === 'schedule'
          ? t('coachChangeSchedule', { defaultValue: 'Change schedule' })
          : t('coachManageWeek', { defaultValue: 'Manage this week' })
      }
      eyebrow={t('coachPageTitle', { defaultValue: 'Mission Coach' })}
    >
      {panel === 'menu' ? (
        <div className="space-y-2">
          {canAdjustToday ? (
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[44px] justify-start"
              onClick={() => {
                handleClose();
                onAdjustToday();
              }}
            >
              {t('coachAdjustToday', { defaultValue: 'Adjust today' })}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] justify-start"
            onClick={() => setPanel('schedule')}
          >
            {t('coachChangeSchedule', { defaultValue: 'Change schedule' })}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] justify-start"
            onClick={() => {
              handleClose();
              // Chat already mounts on Coach — bring it into view.
              requestAnimationFrame(() => {
                document.getElementById('coach-chat')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              });
            }}
          >
            {t('coachAskCoach', { defaultValue: 'Ask coach' })}
          </Button>

          {canRegenerate ? (
            <div className="pt-2">
              <HoldToConfirmButton
                variant="destructive"
                className="w-full"
                label={t('coachRegenerateWeekPlan', {
                  defaultValue: 'Regenerate week plan',
                })}
                onConfirm={() => {
                  onRegenerate();
                  handleClose();
                }}
              />
            </div>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            className="w-full min-h-[44px]"
            onClick={handleClose}
          >
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('coachScheduleRemapNote', {
              defaultValue:
                'Changing days updates the next generate. Remap this week now so today’s strip matches — it replaces the current plan.',
            })}
          </p>
          <CoachScheduleEditor onChange={() => setScheduleDirty(true)} />
          {canRegenerate && scheduleDirty ? (
            <HoldToConfirmButton
              variant="default"
              className="w-full primary-action"
              label={t('coachRemapThisWeek', {
                defaultValue: 'Remap this week',
              })}
              onConfirm={() => {
                onRegenerate();
                handleClose();
              }}
            />
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px]"
            onClick={() => {
              setPanel('menu');
              setScheduleDirty(false);
            }}
          >
            {t('back', { defaultValue: 'Back' })}
          </Button>
        </div>
      )}
    </AdaptiveOverlay>
  );
}
