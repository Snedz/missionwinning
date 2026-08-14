'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SCREEN_DOCK_HOST_ID } from '@/components/layout/ScreenDock';
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
 *
 * ## `.765` — it docks; it does not float
 *
 * This was `fixed bottom-0 inset-x-0 z-[60]` over a `z-50` tab bar. Measured at
 * 390×844 with `NEXT_PUBLIC_POSTHOG_KEY` set, it occupied y=702–844 and covered
 * **Start Workout on `/active`, the Just Go card on `/log`, and all five tabs**.
 * Hard rule 2 is that the free logger is never gated; chrome parked on top of
 * the logger's own button is a gate with better manners.
 *
 * The fix is the one `ScreenDock` already documents for `RestTimerBar`: portal
 * into the host `AppLayout` renders as a flex sibling of `main`, so the banner
 * reserves its height and `main` shrinks by it. Outside the app shell (the
 * private gate, the landing page) there is no host and no bottom nav, so the
 * fixed bar is correct there and stays.
 */
export function AnalyticsConsentBanner() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dockHost, setDockHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setVisible(shouldShowAnalyticsBanner());
    const onPref = () => setVisible(shouldShowAnalyticsBanner());
    window.addEventListener('mw-analytics-pref', onPref);
    return () => window.removeEventListener('mw-analytics-pref', onPref);
  }, []);

  // Re-read per route: the host only exists while AppLayout is mounted, and the
  // gate and landing page are not inside it.
  useEffect(() => {
    setDockHost(document.getElementById(SCREEN_DOCK_HOST_ID));
  }, [pathname, visible]);

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

  const banner = (
    <div
      role="dialog"
      aria-label={t('analyticsBannerAria', { defaultValue: 'Product analytics preference' })}
      className={
        dockHost
          ? 'border-t-2 border-border bg-background px-3 py-3 sm:px-4'
          : 'fixed bottom-0 inset-x-0 z-[60] border-t-2 border-border bg-background px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4'
      }
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

  return dockHost ? createPortal(banner, dockHost) : banner;
}
