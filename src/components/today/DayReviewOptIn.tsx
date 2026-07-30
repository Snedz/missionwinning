'use client';

/**
 * Offer the evening day-review push — with the athlete choosing the hour.
 *
 * Modelled on `WindDownOptIn` and bound by the same two rules: never
 * pre-prompt (the button calls `subscribePush` directly, which checks
 * everything failable before touching `Notification.requestPermission`, since a
 * granted-then-discarded permission poisons the origin permanently), and on iOS
 * offer the install instead, because Safari refuses the permission outright
 * until the site is on the home screen.
 *
 * One difference that matters: the hour is picked, not assumed. The research on
 * push fatigue is blunt — a third of users uninstall past six notifications, and
 * a single weekly push already costs about a tenth of them — so this is one
 * notification a day at a time the athlete named, or none.
 *
 * `.196` — this is now a thin adapter over `dayReviewOfferState`. It used to
 * decide with a chain of early returns, one of which (`hasLocalPushSubscription`
 * → return) meant **every athlete with the wind-down note already on could never
 * set an hour**, so `day_review_hour` stayed NULL and the feature fired for
 * nobody. Having push and having an evening hour are different facts; the
 * decision moved to a pure total function so a test can enumerate the table
 * rather than re-derive a control flow.
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { mayOfferDayReview } from '@/lib/dayReviewNudge';
import {
  DAY_REVIEW_DEFAULT_HOUR,
  DAY_REVIEW_HOURS,
  dayReviewOfferState,
  readDayReviewHour,
} from '@/lib/dayReviewPrefs';

type Mode = 'hidden' | 'offer' | 'install' | 'done';

export function DayReviewOptIn() {
  const [mode, setMode] = useState<Mode>('hidden');
  const [hour, setHour] = useState(DAY_REVIEW_DEFAULT_HOUR);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const m = await import('@/lib/pushClient');
      const hasPush = await m.hasLocalPushSubscription();
      if (cancelled) return;
      setMode(
        dayReviewOfferState({
          hasPush,
          supported: m.isPushSupported(),
          iosNeedsInstall:
            typeof navigator !== 'undefined' &&
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !('PushManager' in window),
          storedHour: readDayReviewHour(readRaw(STORAGE_KEYS.dayReviewHour)),
          dismissed: !mayOfferDayReview(readRaw(STORAGE_KEYS.dayReviewAskedAt), Date.now()),
        })
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remember = () => writeRaw(STORAGE_KEYS.dayReviewAskedAt, String(Date.now()));

  const enable = async () => {
    remember();
    track('day_review_optin_tapped');
    const m = await import('@/lib/pushClient');
    // A device that already has a subscription only needs the hour synced onto
    // its row; asking it to subscribe again would re-prompt for a permission it
    // has already granted.
    const ok = (await m.hasLocalPushSubscription())
      ? await m.syncPushSubscription({ dayReviewHour: hour })
      : (await m.subscribePush({ dayReviewHour: hour })) === 'ok';
    if (ok) {
      // Stored here as well as on the row so Profile opens showing the real
      // setting, and so this card knows it has been answered.
      writeRaw(STORAGE_KEYS.dayReviewHour, String(hour));
      setMode('done');
      toast({
        title: 'Evening review on',
        description: `One note at ${String(hour).padStart(2, '0')}:00. The recap itself opens on this device.`,
      });
      return;
    }
    setMode('hidden');
    toast({
      title: 'Not enabled',
      description: 'Notifications stayed off. Everything else works exactly as before.',
    });
  };

  if (mode === 'hidden' || mode === 'done') return null;

  if (mode === 'install') {
    return (
      <div className="border-2 border-border px-3 py-2">
        <p className="text-sm">
          Add Mission Winning to your home screen and an evening review can find you here.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Share → Add to Home Screen.</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-border px-3 py-2">
      <p className="text-sm">Want your day in review as an evening note?</p>
      <p className="mt-1 text-xs text-muted-foreground">
        One a day, at an hour you pick. The note carries no numbers — the recap opens on this
        device.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="text-xs text-muted-foreground" htmlFor="day-review-hour">
          At
        </label>
        <select
          id="day-review-hour"
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="min-h-[44px] border-2 border-border bg-background px-2 text-sm tabular-nums"
        >
          {DAY_REVIEW_HOURS.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
        {/* `variant="outline"` and a 44px floor, not the default fill.
            The default is `bg-primary-fill` — poster red — which put a **second
            red CTA on Today**, competing with the one docked action the whole
            screen is built around. It passed the one-primary-action e2e test
            because that test counts elements with the `.primary-action` class,
            and this button never had the class; it only had the colour. And
            `size="sm"` is 36px, which the ≥44px sweep never saw because the
            sweep was scoped to `/active`. Two tests, both green, neither
            measuring what it was named for. */}
        <Button variant="outline" size="sm" className="min-h-[44px]" onClick={enable}>
          Turn on
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px]"
          onClick={() => {
            remember();
            setMode('hidden');
          }}
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
