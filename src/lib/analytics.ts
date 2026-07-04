'use client';

import posthog from 'posthog-js';

/**
 * Product analytics — PostHog, privacy-first configuration.
 *
 * - Entirely disabled unless NEXT_PUBLIC_POSTHOG_KEY is set (dev/beta-off stays clean).
 * - Anonymous events only until a user signs in (`person_profiles: 'identified_only'`).
 * - No session recording, no autocapture — only the typed events below.
 * - Respects Do Not Track.
 *
 * The funnel these events exist to answer (STRATEGY.md #1 metric):
 *   visit → iday_started → iday_completed → first_workout_completed →
 *   workout_completed (repeat) → week-4 retention cohort.
 */

type AnalyticsEvent =
  | 'iday_started'
  | 'iday_completed'
  | 'first_workout_completed'
  | 'workout_completed'
  | 'pillar_win'
  | 'bundle_viewed'
  | 'waitlist_joined'
  | 'checkout_clicked'
  | 'pwa_installed'
  | 'coach_plan_generated'
  | 'coach_plan_loaded'
  | 'coach_week_generated'
  | 'coach_session_started'
  | 'coach_plan_adapted'
  | 'coach_taster_locked'
  | 'backup_exported'
  | 'backup_restored';

let initialized = false;

export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  if (navigator.doNotTrack === '1') return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: false,
    autocapture: false,
    disable_session_recording: true,
    persistence: 'localStorage',
  });
  initialized = true;
}

export function track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void {
  if (!initialized) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Analytics must never break the app.
  }
}

/** Tie events to the signed-in user (only after auth — anonymous stays anonymous). */
export function identifyUser(userId: string): void {
  if (!initialized) return;
  try {
    posthog.identify(userId);
  } catch {
    // Non-fatal.
  }
}

export function resetAnalyticsIdentity(): void {
  if (!initialized) return;
  try {
    posthog.reset();
  } catch {
    // Non-fatal.
  }
}
