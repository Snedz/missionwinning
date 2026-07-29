'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Two independent channels, not one nested inside the other.
 *
 * Email reminders genuinely need an account — there is no address without one — so
 * that row stays behind `signedIn`. Device notifications do not, and nesting them
 * under the email toggle meant an anonymous athlete could never reach them: the free
 * logger's own default user had no way to be reminded of anything.
 */
type ProfileRemindersCardProps = {
  signedIn: boolean;
  reminders: boolean;
  remindersBusy: boolean;
  onToggleReminders: () => void;
  pushSupported: boolean;
  pushOn: boolean;
  pushBusy: boolean;
  onTogglePush: () => void;
};

export function ProfileRemindersCard({
  signedIn,
  reminders,
  remindersBusy,
  onToggleReminders,
  pushSupported,
  pushOn,
  pushBusy,
  onTogglePush,
}: ProfileRemindersCardProps) {
  const { t } = useTranslation();

  // Nothing to offer: no account for email, no support for push.
  if (!signedIn && !pushSupported) return null;

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle>{t('remindersTitle', { defaultValue: 'Training reminders' })}</CardTitle>
      </CardHeader>

      {signedIn ? (
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t('remindersDesc', {
              defaultValue:
                'Occasional emails when you go quiet — never more than one every two days. One-tap unsubscribe in every email.',
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
      ) : null}

      {pushSupported ? (
        <CardContent
          className={`flex items-center justify-between gap-4 ${
            signedIn ? 'border-t border-border pt-4' : ''
          }`}
        >
          <p className="text-sm text-muted-foreground">
            {t('remindersPushDesc', {
              defaultValue:
                'Notify me on this device when it has been a while. No account needed — the reminder is tied to this browser, not to you.',
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
