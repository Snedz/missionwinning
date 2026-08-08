'use client';
/**
 * Who you are, on your own page.
 *
 * The call sign already existed — `operatorName`, 24 chars, in
 * `leaderboard/computeLocalStats.ts` — but the only place to set it was a field
 * on `/leaderboard`, a parkable surface most athletes never open. Identity was
 * therefore editable only from the one screen that ranks people, which is
 * exactly backwards for a product whose whole social thesis is
 * profile-not-feed (docs/IDENTITY_SOCIAL_PLAN.md).
 *
 * Storage is unchanged and shared: `saveOperatorName` is still the single
 * writer, so this editor and the leaderboard's read the same value and cannot
 * drift.
 *
 * **No red action.** This is a record, not a task — red means "do this now"
 * (DESIGN_REVIEW colour semantics), and a name field never does. The Save is an
 * outline button, which is what pins `/profile` at a red-action cap of 0.
 *
 * **The verdict is shown, never swallowed.** `.611` made `saveOperatorName`
 * return a `DisplayNameCheck` — it rejects impersonation, links and bidi/control
 * characters before a name can reach a board. An editor that discards that return
 * value looks like it saved and did not: the field snaps back to the old name with
 * no reason given, which is the worst version of a validated field. Each rejection
 * reason gets its own line.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadOperatorName, saveOperatorName } from '@/lib/leaderboard/computeLocalStats';
import { DISPLAY_NAME_MAX, type DisplayNameRejection } from '@/lib/identity/displayName';
import { formatLocalDateKey } from '@/lib/time/localDate';
import type { CareerLine } from '@/lib/careerLine';

export function AthleteIdentityCard({ career }: { career: CareerLine }) {
  // `i18n.language`, never the ambient locale — `localeFormat.test.ts` discovers
  // any `toLocale*`/`Intl` call that omits it, and a date on an identity page is
  // exactly the kind of number that renders wrong for a whole timezone band.
  const { t, i18n } = useTranslation();
  const [callSign, setCallSign] = useState('');
  const [saved, setSaved] = useState(false);
  const [rejection, setRejection] = useState<DisplayNameRejection | null>(null);

  // localStorage is client-only; reading during render would differ between the
  // server pass and the first client pass.
  useEffect(() => setCallSign(loadOperatorName()), []);

  const commit = () => {
    const verdict = saveOperatorName(callSign);
    if (!verdict.ok) {
      setRejection(verdict.reason ?? 'unsafe-characters');
      setSaved(false);
      return;
    }
    setRejection(null);
    setCallSign(loadOperatorName());
    setSaved(true);
  };

  const rejectionText = (reason: DisplayNameRejection) => {
    switch (reason) {
      case 'empty':
        return t('athleteIdentityRejectEmpty', { defaultValue: 'Pick a call sign first.' });
      case 'too-long':
        return t('athleteIdentityRejectLong', { defaultValue: 'Too long — 24 characters at most.' });
      case 'reserved':
        return t('athleteIdentityRejectReserved', {
          defaultValue: 'That one reads as the app or its staff. Pick something that is yours.',
        });
      case 'link':
        return t('athleteIdentityRejectLink', { defaultValue: 'No links or addresses in a call sign.' });
      default:
        return t('athleteIdentityRejectUnsafe', {
          defaultValue: 'That contains characters that break a shared list. Try letters and numbers.',
        });
    }
  };

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <p className="eyebrow mb-3">{t('athleteIdentityTitle', { defaultValue: 'Call sign' })}</p>

        <label htmlFor="athlete-call-sign" className="sr-only">
          {t('athleteIdentityTitle', { defaultValue: 'Call sign' })}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="athlete-call-sign"
            value={callSign}
            maxLength={DISPLAY_NAME_MAX}
            onChange={(e) => {
              setCallSign(e.target.value);
              setSaved(false);
              setRejection(null);
            }}
            onBlur={commit}
            className="max-w-[16rem]"
          />
          <Button variant="outline" onClick={commit} className="tap-target">
            {t('athleteIdentitySave', { defaultValue: 'Save' })}
          </Button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {career.firstSessionOn
            ? t('athleteIdentitySince', {
                date: formatLocalDateKey(career.firstSessionOn, i18n.language),
                defaultValue: `Training here since ${formatLocalDateKey(career.firstSessionOn, i18n.language)}`,
              })
            : t('athleteIdentityNoStart', {
                defaultValue: 'Your first logged session starts the record.',
              })}
        </p>

        {rejection && (
          <p className="mt-2 text-sm text-primary" role="alert">
            {rejectionText(rejection)}
          </p>
        )}

        {saved && (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            {t('athleteIdentitySaved', { defaultValue: 'Saved on this device.' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
