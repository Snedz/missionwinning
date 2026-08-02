'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileDayReviewRow } from '@/components/profile/ProfileDayReviewRow';

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
  /** The evening-review hour on this device, or null for off. */
  dayReviewHour: number | null;
  onChangeDayReviewHour: (hour: number | null) => void;
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
  dayReviewHour,
  onChangeDayReviewHour,
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
            variant={reminders ? 'selected' : 'outline'}
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
        <CardContent className={signedIn ? 'border-t border-border pt-4' : ''}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t('remindersPushDesc', {
                defaultValue:
                  'On this device only — the subscription is tied to this browser, not to your account.',
              })}
            </p>
            <Button
              variant={pushOn ? 'selected' : 'outline'}
              disabled={pushBusy}
              className="shrink-0 min-h-[44px]"
              aria-pressed={pushOn}
              onClick={onTogglePush}
            >
              {pushOn
                ? t('remindersOn', { defaultValue: 'On' })
                : t('remindersOff', { defaultValue: 'Off' })}
            </Button>
          </div>

          {/*
            Each kind, and when it fires.

            `.228` — this description said *"Two kinds"* and named two, while the
            device actually receives the evening review configured one row below
            and, for a signed-in athlete, the two pushes that ride along with the
            weekly emails: five, behind one toggle described as two. Listing them
            is the reference app's one good structural idea in this batch, and it
            costs only honest copy because every line below is a note the app
            already sends. Nothing here is a new preference — the toggle is still
            one subscription, which is why these are statements rather than rows
            with their own switches.
          */}
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            {t('remindersKindsLabel', { defaultValue: 'What this device will receive' })}
          </p>
          <ul className="mt-2 space-y-2 border-t-2 border-border pt-2 text-[13px] text-muted-foreground">
            <li>
              {t('remindersKindComeback', {
                defaultValue:
                  'If you go quiet — one check-in, at your own cadence rather than a fixed day.',
              })}
            </li>
            <li>
              {t('remindersKindWindDown', {
                defaultValue:
                  'After a session that ran hotter than your recent usual — one evening note.',
              })}
            </li>
            {signedIn ? (
              <>
                <li>
                  {t('remindersKindWeekRecap', {
                    defaultValue:
                      'A recap at the end of your first week, with what you logged in it.',
                  })}
                </li>
                <li>
                  {t('remindersKindWeekBehind', {
                    defaultValue:
                      'Near the end of a week where you are short of the target you set — never framed as a deficit.',
                  })}
                </li>
              </>
            ) : null}
          </ul>
          {signedIn ? (
            <p className="mt-2 text-[13px] text-muted-foreground">
              {t('remindersKindsAccountNote', {
                defaultValue:
                  'The last two need an account, because they are sent alongside an email.',
              })}
            </p>
          ) : null}
        </CardContent>
      ) : null}

      {/* Under `pushSupported`, not under `pushOn`: choosing the hour is how an
          athlete turns the evening review on, so gating it behind push already
          being enabled would recreate the `.176` dead end from the other side. */}
      {pushSupported ? (
        <ProfileDayReviewRow
          hour={dayReviewHour}
          busy={pushBusy}
          onChange={onChangeDayReviewHour}
          separated
        />
      ) : null}
    </Card>
  );
}
