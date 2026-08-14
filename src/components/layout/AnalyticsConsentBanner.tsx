'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { CONSENT_BANNER_HOST_ID } from './ScreenDock';

export { CONSENT_BANNER_HOST_ID };

/**
 * First-visit privacy banner: product analytics off until the user chooses.
 * Primary action keeps data private (opt out of product metrics).
 * Workouts stay local-first either way.
 *
 * Not `position: fixed`. On app pages it portals into a reserved flex sibling
 * so Today's Start and the tab bar keep their own height. On marketing pages
 * (no host) it renders in document flow after the page — still not an overlay.
 */
export function AnalyticsConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setVisible(shouldShowAnalyticsBanner());
    const onPref = () => setVisible(shouldShowAnalyticsBanner());
    window.addEventListener('mw-analytics-pref', onPref);
    return () => window.removeEventListener('mw-analytics-pref', onPref);
  }, []);

  useEffect(() => {
    setHost(document.getElementById(CONSENT_BANNER_HOST_ID));
  }, [visible]);

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

  const node = (
    <div
      role="dialog"
      data-mw-consent-banner=""
      aria-label={t('analyticsBannerAria', { defaultValue: 'Product analytics preference' })}
      className="border-t-2 border-border bg-background px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
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

  if (host) return createPortal(node, host);
  return node;
}
