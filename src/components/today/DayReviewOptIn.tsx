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
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import {
  DAY_REVIEW_MAX_HOUR,
  DAY_REVIEW_MIN_HOUR,
  mayOfferDayReview,
} from '@/lib/dayReviewNudge';

type Mode = 'hidden' | 'offer' | 'install' | 'done';

const HOURS = Array.from(
  { length: DAY_REVIEW_MAX_HOUR - DAY_REVIEW_MIN_HOUR + 1 },
  (_, i) => DAY_REVIEW_MIN_HOUR + i
);

export function DayReviewOptIn() {
  const [mode, setMode] = useState<Mode>('hidden');
  const [hour, setHour] = useState(20);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!mayOfferDayReview(readRaw(STORAGE_KEYS.dayReviewAskedAt), Date.now())) return;
      const m = await import('@/lib/pushClient');
      if (await m.hasLocalPushSubscription()) return;
      if (cancelled) return;

      if (m.isPushSupported()) {
        setMode('offer');
        return;
      }
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

  const remember = () => writeRaw(STORAGE_KEYS.dayReviewAskedAt, String(Date.now()));

  const enable = async () => {
    remember();
    track('day_review_optin_tapped');
    const m = await import('@/lib/pushClient');
    const result = await m.subscribePush({ dayReviewHour: hour });
    if (result === 'ok') {
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
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
        <Button size="sm" onClick={enable}>
          Turn on
        </Button>
        <Button
          variant="ghost"
          size="sm"
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
