'use client';

/**
 * The permanent home the evening-review hour never had.
 *
 * `.194` put the hour picker inside a Today card that offers itself once and
 * then remembers it asked. That is right for an offer and wrong for a setting:
 * an athlete who tapped "not now" in July had no way to change their mind, and
 * an athlete who chose 20:00 had no way to move it to 21:00. Every other push
 * preference already lives in this card; this one was reachable for one moment
 * and then never again.
 *
 * `variant="outline"` and a plain `<select>` deliberately — the evening review
 * is a preference, not a call to action, and a second red fill on a settings
 * screen competes with the one action that is.
 */

import { useTranslation } from 'react-i18next';
import { CardContent } from '@/components/ui/card';
import { DAY_REVIEW_HOURS } from '@/lib/dayReviewPrefs';

type Props = {
  /** The stored hour, or null for off. */
  hour: number | null;
  busy: boolean;
  /** `null` turns the evening review off. */
  onChange: (hour: number | null) => void;
  /** Renders the separating rule when a row sits above this one. */
  separated: boolean;
};

const OFF = 'off';

export function ProfileDayReviewRow({ hour, busy, onChange, separated }: Props) {
  const { t } = useTranslation();

  return (
    <CardContent
      className={`flex items-center justify-between gap-4 ${
        separated ? 'border-t border-border pt-4' : ''
      }`}
    >
      <p className="text-sm text-muted-foreground">
        {t('remindersDayReviewDesc', {
          defaultValue:
            'One evening note asking you to look back at the day, at an hour you pick. The review itself is written on this device — the note carries no numbers.',
        })}
      </p>
      <select
        aria-label={t('remindersDayReviewLabel', { defaultValue: 'Evening review time' })}
        value={hour === null ? OFF : String(hour)}
        disabled={busy}
        onChange={(e) => onChange(e.target.value === OFF ? null : Number(e.target.value))}
        className="min-h-[44px] shrink-0 border-2 border-border bg-background px-2 text-sm tabular-nums"
      >
        <option value={OFF}>{t('remindersOff', { defaultValue: 'Off' })}</option>
        {DAY_REVIEW_HOURS.map((h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, '0')}:00
          </option>
        ))}
      </select>
    </CardContent>
  );
}
