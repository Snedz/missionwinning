'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ProfileRemindersCardProps = {
  reminders: boolean;
  remindersBusy: boolean;
  onToggleReminders: () => void;
  pushSupported: boolean;
  pushOn: boolean;
  pushBusy: boolean;
  onTogglePush: () => void;
};

export function ProfileRemindersCard({
  reminders,
  remindersBusy,
  onToggleReminders,
  pushSupported,
  pushOn,
  pushBusy,
  onTogglePush,
}: ProfileRemindersCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle>{t('remindersTitle', { defaultValue: 'Training reminders' })}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t('remindersDesc', {
            defaultValue:
              'Occasional emails when your streak is at risk or you go quiet — never more than one every two days. One-tap unsubscribe in every email.',
          })}
        </p>
        <Button
          variant={reminders ? 'default' : 'outline'}
          disabled={remindersBusy}
          onClick={onToggleReminders}
          className="shrink-0 min-h-[44px]"
          aria-pressed={reminders}
        >
          {reminders
            ? t('remindersOn', { defaultValue: 'On' })
            : t('remindersOff', { defaultValue: 'Off' })}
        </Button>
      </CardContent>
      {reminders && pushSupported ? (
        <CardContent className="flex items-center justify-between gap-4 border-t border-border/40 pt-4">
          <p className="text-sm text-muted-foreground">
            {t('remindersPushDesc', {
              defaultValue: 'Also notify on this device (web push).',
            })}
          </p>
          <Button
            variant={pushOn ? 'default' : 'outline'}
            disabled={pushBusy}
            className="shrink-0 min-h-[44px]"
            aria-pressed={pushOn}
            onClick={onTogglePush}
          >
            {pushOn
              ? t('remindersOn', { defaultValue: 'On' })
              : t('remindersOff', { defaultValue: 'Off' })}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
