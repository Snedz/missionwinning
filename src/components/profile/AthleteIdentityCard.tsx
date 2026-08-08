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
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadOperatorName, saveOperatorName } from '@/lib/leaderboard/computeLocalStats';
import { formatLocalDateKey } from '@/lib/time/localDate';
import type { CareerLine } from '@/lib/careerLine';

const MAX_CALL_SIGN = 24;

export function AthleteIdentityCard({ career }: { career: CareerLine }) {
  // `i18n.language`, never the ambient locale — `localeFormat.test.ts` discovers
  // any `toLocale*`/`Intl` call that omits it, and a date on an identity page is
  // exactly the kind of number that renders wrong for a whole timezone band.
  const { t, i18n } = useTranslation();
  const [callSign, setCallSign] = useState('');
  const [saved, setSaved] = useState(false);

  // localStorage is client-only; reading during render would differ between the
  // server pass and the first client pass.
  useEffect(() => setCallSign(loadOperatorName()), []);

  const commit = () => {
    saveOperatorName(callSign);
    setCallSign(loadOperatorName());
    setSaved(true);
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
            maxLength={MAX_CALL_SIGN}
            onChange={(e) => {
              setCallSign(e.target.value);
              setSaved(false);
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

        {saved && (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            {t('athleteIdentitySaved', { defaultValue: 'Saved on this device.' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
