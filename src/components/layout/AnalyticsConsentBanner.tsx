'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  saveAnalyticsPreference,
  shouldShowAnalyticsBanner,
} from '@/lib/analyticsOptOut';
import { discardPendingAttribution, flushPendingAttribution } from '@/lib/attribution';
import { initAnalytics, stopAnalyticsCapture } from '@/lib/analytics';

/**
 * First-visit privacy banner: product analytics off until the user chooses.
 * Primary action keeps data private (opt out of product metrics).
 * Workouts stay local-first either way.
 */
export function AnalyticsConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [manage, setManage] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);

  useEffect(() => {
    setVisible(shouldShowAnalyticsBanner());
    const onPref = () => setVisible(shouldShowAnalyticsBanner());
    window.addEventListener('mw-analytics-pref', onPref);
    return () => window.removeEventListener('mw-analytics-pref', onPref);
  }, []);

  if (!visible) return null;

  const rejectNonEssential = () => {
    saveAnalyticsPreference('opted_out');
    discardPendingAttribution();
    stopAnalyticsCapture();
    setVisible(false);
  };

  const acceptAnalytics = () => {
    saveAnalyticsPreference('allowed');
    flushPendingAttribution();
    initAnalytics();
    setVisible(false);
  };

  const saveManage = () => {
    if (analyticsOn) acceptAnalytics();
    else rejectNonEssential();
  };

  return (
    <div
      role="dialog"
      aria-label={t('cookieBannerAria', { defaultValue: 'Cookie and analytics preference' })}
      className="fixed bottom-0 inset-x-0 z-[60] border-t-2 border-border bg-background px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="flex gap-2 text-xs sm:text-sm text-muted-foreground">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p>
            {t('cookieBannerBody', {
              defaultValue:
                'Workouts stay on this device. Strictly necessary cookies remember language, country, and sign-in. Optional analytics (no ads, no session replay) stay off until you accept.',
            })}{' '}
            <Link href="/privacy" className="underline underline-offset-2 text-foreground">
              {t('cookieBannerPrivacyLink', { defaultValue: 'Privacy' })}
            </Link>
            {' · '}
            <Link href="/cookies" className="underline underline-offset-2 text-foreground">
              {t('cookieBannerCookiesLink', { defaultValue: 'Cookies' })}
            </Link>
          </p>
        </div>
        {manage ? (
          <div className="border-2 border-border p-3">
            <p className="text-sm font-medium">
              {t('cookieManageTitle', { defaultValue: 'Optional analytics' })}
            </p>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={analyticsOn}
                onChange={(e) => setAnalyticsOn(e.target.checked)}
              />
              {t('cookieManageAnalytics', {
                defaultValue: 'Product analytics (PostHog EU, no session replay)',
              })}
            </label>
            <Button type="button" size="sm" className="mt-3 min-h-[40px]" onClick={saveManage}>
              {t('cookieManageSave', { defaultValue: 'Save choices' })}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap shrink-0 gap-2">
            <Button type="button" size="sm" className="min-h-[40px]" onClick={acceptAnalytics}>
              {t('cookieBannerAccept', { defaultValue: 'Accept' })}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-[40px]"
              onClick={rejectNonEssential}
            >
              {t('cookieBannerReject', { defaultValue: 'Reject non-essential' })}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-[40px]"
              onClick={() => setManage(true)}
            >
              {t('cookieBannerManage', { defaultValue: 'Manage' })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
