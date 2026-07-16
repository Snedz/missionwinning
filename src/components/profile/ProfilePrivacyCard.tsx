'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  loadAnalyticsPreference,
  saveAnalyticsPreference,
  type AnalyticsPreference,
} from '@/lib/analyticsOptOut';
import { initAnalytics, stopAnalyticsCapture } from '@/lib/analytics';

/**
 * Profile controls for product analytics — local workouts are always local-first;
 * this only toggles optional PostHog product metrics.
 */
export function ProfilePrivacyCard() {
  const { t } = useTranslation();
  const [pref, setPref] = useState<AnalyticsPreference | null>(null);
  const [dnt, setDnt] = useState(false);
  const hasKey = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

  useEffect(() => {
    setPref(loadAnalyticsPreference());
    try {
      setDnt(navigator.doNotTrack === '1');
    } catch {
      setDnt(false);
    }
    const onPref = (e: Event) => {
      const detail = (e as CustomEvent<{ preference: AnalyticsPreference }>).detail;
      if (detail?.preference) setPref(detail.preference);
      else setPref(loadAnalyticsPreference());
    };
    window.addEventListener('mw-analytics-pref', onPref);
    return () => window.removeEventListener('mw-analytics-pref', onPref);
  }, []);

  const setAllowed = (allowed: boolean) => {
    const next: AnalyticsPreference = allowed ? 'allowed' : 'opted_out';
    saveAnalyticsPreference(next);
    setPref(next);
    if (allowed) initAnalytics();
    else stopAnalyticsCapture();
  };

  const statusLabel = dnt
    ? t('privacyAnalyticsDnt', {
        defaultValue: 'Off — your browser sent Do Not Track.',
      })
    : pref === 'allowed'
      ? t('privacyAnalyticsOn', {
          defaultValue: 'On — optional product metrics only (no session replay).',
        })
      : pref === 'opted_out'
        ? t('privacyAnalyticsOff', {
            defaultValue: 'Off — product analytics disabled on this device.',
          })
        : t('privacyAnalyticsUndecided', {
            defaultValue: 'Not set — no product analytics until you choose.',
          });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('privacyControlsTitle', { defaultValue: 'Privacy & analytics' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          {t('privacyControlsLead', {
            defaultValue:
              'Workouts, nutrition, and journey progress stay on this device until you sign in to sync. Product analytics are optional and off until you allow them.',
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {t('privacyAnalyticsStatus', { defaultValue: 'Product analytics:' })}{' '}
          </span>
          {statusLabel}
        </p>
        {hasKey && !dnt ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant={pref === 'opted_out' || pref === null ? 'default' : 'outline'}
              className="min-h-[40px]"
              onClick={() => setAllowed(false)}
            >
              {t('privacyKeepPrivate', { defaultValue: 'Keep analytics off' })}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={pref === 'allowed' ? 'default' : 'outline'}
              className="min-h-[40px]"
              onClick={() => setAllowed(true)}
            >
              {t('privacyAllowAnalytics', { defaultValue: 'Allow product analytics' })}
            </Button>
          </div>
        ) : !hasKey ? (
          <p className="text-xs text-muted-foreground">
            {t('privacyAnalyticsNotConfigured', {
              defaultValue: 'Product analytics are not configured in this environment.',
            })}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          <Link href="/privacy" className="underline underline-offset-2">
            {t('privacyPolicyLink', { defaultValue: 'Read the privacy policy' })}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
