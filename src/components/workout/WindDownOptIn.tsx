'use client';

/**
 * Offer evening notifications, at the one moment they make sense.
 *
 * Push has been reachable through exactly one control since it shipped: a toggle
 * inside Profile → Reminders. So the wind-down nudge, however well built, would have
 * fired for approximately nobody. This asks after a session that actually ran hot —
 * when the value of "a heads-up on evenings like this" is concrete rather than
 * hypothetical.
 *
 * Two rules it must not break:
 *
 * 1. **Never pre-prompt.** The button calls `subscribePush` directly, which checks
 *    everything failable *before* touching `Notification.requestPermission` (see the
 *    ordering contract at the top of `pushClient.ts`). A granted-then-discarded
 *    permission poisons the origin permanently and the browser will not ask again.
 * 2. **On iOS, push exists only inside an installed PWA.** Safari refuses the
 *    permission entirely until the site is on the home screen, so offering a
 *    notification button there is offering something that cannot work. That branch
 *    offers the install instead.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { mayOfferWindDown } from '@/lib/windDown';

type Mode = 'hidden' | 'offer' | 'install' | 'done';

type MwWindow = Window & { triggerPwaInstall?: () => Promise<void> };

export function WindDownOptIn() {
  // `.243` — this component had six raw string literals in JSX and was not wired
  // to i18n at all, so the one surface that asks an athlete to grant notification
  // permission spoke English in fifteen languages. A permission ask nobody can
  // read is a permission nobody grants.
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('hidden');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!mayOfferWindDown(readRaw(STORAGE_KEYS.windDownAskedAt), Date.now())) return;
      const m = await import('@/lib/pushClient');

      // Already subscribed — nothing to offer.
      if (await m.hasLocalPushSubscription()) return;
      if (cancelled) return;

      if (m.isPushSupported()) {
        setMode('offer');
        return;
      }
      // iOS Safari before install: no PushManager at all. Offer the install, which is
      // the actual prerequisite, rather than a button that would silently fail.
      const iosLike =
        typeof navigator !== 'undefined' &&
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !('PushManager' in window);
      if (iosLike) setMode('install');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remember = () => writeRaw(STORAGE_KEYS.windDownAskedAt, String(Date.now()));

  const enable = async () => {
    remember();
    track('wind_down_optin_tapped');
    const m = await import('@/lib/pushClient');
    const result = await m.subscribePush({ lastSessionHigh: true });
    if (result === 'ok') {
      setMode('done');
      track('wind_down_optin_granted');
      return;
    }
    setMode('hidden');
    toast({
      title:
        result === 'denied'
          ? 'Notifications are off for this site'
          : 'Could not turn that on',
      description:
        result === 'denied'
          ? 'You can change it in your browser settings whenever you like.'
          : 'No harm done — the debrief is always here after a session.',
    });
  };

  const install = () => {
    remember();
    track('wind_down_optin_install');
    void (window as MwWindow).triggerPwaInstall?.();
  };

  if (mode === 'hidden') return null;

  if (mode === 'done') {
    return (
      <p className="border-t border-border pt-3 text-xs text-muted-foreground" role="status">
        {t('windDownDone', { defaultValue: 'Done — you’ll get a note on evenings like this one.' })}
      </p>
    );
  }

  return (
    <div className="border-t border-border pt-3">
      <p className="text-sm">
        {t('windDownAsk', { defaultValue: 'Want a heads-up on evenings like this?' })}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t('windDownDesc', {
          defaultValue:
            'One note after a session that runs hot. Nothing else, and no account needed.',
        })}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {mode === 'offer' ? (
          <Button size="sm" variant="outline" className="min-h-[44px]" onClick={enable}>
            {t('windDownEnable', { defaultValue: 'Turn on evening notes' })}
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="min-h-[44px]" onClick={install}>
            {t('windDownInstallFirst', { defaultValue: 'Add to Home Screen first' })}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="min-h-[44px]"
          onClick={() => {
            remember();
            setMode('hidden');
            track('wind_down_optin_dismissed');
          }}
        >
          {t('windDownNotNow', { defaultValue: 'Not now' })}
        </Button>
      </div>
    </div>
  );
}
