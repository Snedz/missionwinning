'use client';

/**
 * Product analytics — PostHog, privacy-first configuration.
 *
 * - Entirely disabled unless NEXT_PUBLIC_POSTHOG_KEY is set (dev/beta-off stays clean).
 * - Off until the user explicitly allows product analytics (see analyticsOptOut.ts).
 * - Respects Do Not Track (hard off).
 * - Anonymous events only until a user signs in (`person_profiles: 'identified_only'`).
 * - No session recording, no autocapture — only the typed events below.
 * - posthog-js is dynamic-imported so it never ships on first paint when unused.
 *
 * The funnel these events exist to answer (STRATEGY.md #1 metric):
 *   visit → iday_started → iday_completed → first_workout_completed →
 *   workout_completed (repeat) → week-4 retention cohort.
 */

import { isAnalyticsAllowed } from '@/lib/analyticsOptOut';
import { attributionAsProps, loadAttribution } from '@/lib/attribution';

type AnalyticsEvent =
  | 'iday_started'
  | 'iday_completed'
  | 'first_workout_completed'
  | 'workout_completed'
  | 'pillar_win'
  | 'bundle_viewed'
  | 'waitlist_joined'
  | 'checkout_clicked'
  | 'checkout_completed'
  | 'pwa_installed'
  | 'class_joined'
  | 'coach_week_generated'
  | 'coach_session_started'
  | 'just_go_started'
  | 'coach_plan_adapted'
  | 'coach_plan_regenerated_fatigue'
  | 'coach_taster_locked'
  | 'coach_premium_active'
  | 'fuel_plan_generated'
  | 'fuel_plan_regenerated'
  | 'backup_exported'
  | 'backup_restored'
  | 'guide_read'
  | 'exercise_page_viewed'
  | 'public_cta_clicked';

type PostHogClient = {
  init: (key: string, opts: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, string | number | boolean>) => void;
  identify: (userId: string) => void;
  reset: () => void;
  register?: (props: Record<string, string | number | boolean>) => void;
  opt_out_capturing?: () => void;
  opt_in_capturing?: () => void;
};

let initialized = false;
let initStarted = false;
let ph: PostHogClient | null = null;
const pending: Array<{
  type: 'track' | 'identify' | 'reset';
  event?: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
  userId?: string;
}> = [];

function flushPending() {
  if (!ph || !initialized) return;
  for (const item of pending) {
    try {
      if (item.type === 'track' && item.event) ph.capture(item.event, item.properties);
      else if (item.type === 'identify' && item.userId) ph.identify(item.userId);
      else if (item.type === 'reset') ph.reset();
    } catch {
      /* Analytics must never break the app. */
    }
  }
  pending.length = 0;
}

export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsAllowed()) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  if (initialized && ph) {
    try {
      ph.opt_in_capturing?.();
    } catch {
      /* noop */
    }
    return;
  }
  if (initStarted) return;
  initStarted = true;

  void import('posthog-js')
    .then((mod) => {
      if (!isAnalyticsAllowed()) {
        initStarted = false;
        return;
      }
      const posthog = (mod.default ?? mod) as PostHogClient;
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: false,
        autocapture: false,
        disable_session_recording: true,
        persistence: 'localStorage',
        opt_out_capturing_by_default: false,
      });
      try {
        const props = attributionAsProps(loadAttribution());
        if (Object.keys(props).length > 0) {
          posthog.register?.(props);
        }
      } catch {
        /* non-fatal */
      }
      ph = posthog;
      initialized = true;
      flushPending();
    })
    .catch(() => {
      initStarted = false;
    });
}

/** Stop capture after the user opts out (mid-session safe). */
export function stopAnalyticsCapture(): void {
  pending.length = 0;
  if (!ph) return;
  try {
    ph.opt_out_capturing?.();
    ph.reset();
  } catch {
    /* noop */
  }
}

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  if (!isAnalyticsAllowed()) return;
  if (!initialized || !ph) {
    pending.push({ type: 'track', event, properties });
    return;
  }
  try {
    ph.capture(event, properties);
  } catch {
    // Analytics must never break the app.
  }
}

/** Tie events to the signed-in user (only after auth — anonymous stays anonymous). */
export function identifyUser(userId: string): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  if (!isAnalyticsAllowed()) return;
  if (!initialized || !ph) {
    pending.push({ type: 'identify', userId });
    return;
  }
  try {
    ph.identify(userId);
  } catch {
    // Non-fatal.
  }
}

export function resetAnalyticsIdentity(): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  if (!isAnalyticsAllowed()) return;
  if (!initialized || !ph) {
    pending.push({ type: 'reset' });
    return;
  }
  try {
    ph.reset();
  } catch {
    // Non-fatal.
  }
}
