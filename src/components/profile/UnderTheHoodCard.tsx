'use client';

/**
 * This-install week-4 diagnostic — not a vanity counter.
 * Shows retained_week_4 for the current device only. Never a live user count.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { week4HoodSnapshot } from '@/lib/week4Logger';

export function UnderTheHoodCard() {
  const { t } = useTranslation();
  const [snap, setSnap] = useState(() => week4HoodSnapshot());

  useEffect(() => {
    setSnap(week4HoodSnapshot());
  }, []);

  const yes = t('accountUnderTheHoodYes', { defaultValue: 'yes' });
  const no = t('accountUnderTheHoodNo', { defaultValue: 'no' });

  return (
    <Card className="border-2 border-border bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          {t('accountUnderTheHood', { defaultValue: 'Under the Hood' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          {t('accountUnderTheHoodHint', {
            defaultValue:
              'This install only — not a live user count. We do not invent traction.',
          })}
        </p>
        {!snap.firstIsoWeek ? (
          <p>{t('accountUnderTheHoodNone', { defaultValue: 'No working set logged yet' })}</p>
        ) : (
          <dl className="space-y-1 font-mono text-xs text-foreground">
            <div className="flex justify-between gap-4">
              <dt>{t('accountUnderTheHoodFirstWeek', { defaultValue: 'First logged week' })}</dt>
              <dd>{snap.firstIsoWeek}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{t('accountUnderTheHoodThisWeek', { defaultValue: 'This week' })}</dt>
              <dd>{snap.thisWeek}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>
                {t('accountUnderTheHoodLoggedThisWeek', { defaultValue: 'Working set this week' })}
              </dt>
              <dd>{snap.loggedThisWeek ? yes : no}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{t('accountUnderTheHoodRetained', { defaultValue: 'retained_week_4' })}</dt>
              <dd>{snap.retainedWeek4 ? yes : no}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
