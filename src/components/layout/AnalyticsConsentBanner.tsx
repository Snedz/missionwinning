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

  useEffect(() => {
    setVisible(shouldShowAnalyticsBanner());
    const onPref = () => setVisible(shouldShowAnalyticsBanner());
    window.addEventListener('mw-analytics-pref', onPref);
    return () => window.removeEventListener('mw-analytics-pref', onPref);
  }, []);

  if (!visible) return null;

  const stayPrivate = () => {
    saveAnalyticsPreference('opted_out');
    discardPendingAttribution();
    stopAnalyticsCapture();
    setVisible(false);
  };

  const allowAnalytics = () => {
    saveAnalyticsPreference('allowed');
    // Flush before init so PostHog registers the now-stored first-touch fields.
    flushPendingAttribution();
    initAnalytics();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label={t('analyticsBannerAria', { defaultValue: 'Product analytics preference' })}
      className="fixed bottom-0 inset-x-0 z-[60] border-t-2 border-border bg-background px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 text-xs sm:text-sm text-muted-foreground">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p>
            {t('analyticsBannerBody', {
              defaultValue:
                'Your workouts stay on this device by default. Optional product analytics (no session replay, no autocapture) help improve Mission Winning. You can change this anytime in Profile.',
            })}{' '}
            <Link href="/privacy" className="underline underline-offset-2 text-foreground">
              {t('analyticsBannerPrivacyLink', { defaultValue: 'Privacy policy' })}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" size="sm" className="min-h-[40px]" onClick={stayPrivate}>
            {t('analyticsBannerStayPrivate', { defaultValue: 'Stay private' })}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-[40px]"
            onClick={allowAnalytics}
          >
            {t('analyticsBannerAllow', { defaultValue: 'Allow analytics' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
