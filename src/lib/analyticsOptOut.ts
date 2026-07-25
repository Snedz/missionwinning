/**
 * Product analytics preference — privacy by default.
 *
 * Workouts, nutrition, and journey data already live local-first (device storage).
 * Optional PostHog product metrics only run when the user explicitly allows them
 * (or re-enables from Profile). Undecided = no capture. Do Not Track = hard off.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

const PREF_KEY = STORAGE_KEYS.analyticsPref;

export type AnalyticsPreference = 'allowed' | 'opted_out';

export function loadAnalyticsPreference(): AnalyticsPreference | null {
  const raw = readRaw(PREF_KEY);
  if (raw === 'allowed' || raw === 'opted_out') return raw;
  return null;
}

export function saveAnalyticsPreference(pref: AnalyticsPreference): void {
  if (typeof window === 'undefined') return;
  // Best-effort by design: a private-mode user who cannot persist the choice is
  // treated as undecided next visit, which means no capture. Failing closed.
  writeRaw(PREF_KEY, pref);
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('mw-analytics-pref', { detail: { preference: pref } })
      );
    }
  } catch {
    /* non-browser test shims */
  }
}

/** True only when the user has opted in and the browser is not DNT. */
export function isAnalyticsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator.doNotTrack === '1') return false;
  } catch {
    /* ignore */
  }
  return loadAnalyticsPreference() === 'allowed';
}

/** Whether to show the first-visit privacy banner (key present, no choice yet, no DNT). */
export function shouldShowAnalyticsBanner(): boolean {
  if (typeof window === 'undefined') return false;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return false;
  try {
    if (navigator.doNotTrack === '1') return false;
  } catch {
    /* ignore */
  }
  return loadAnalyticsPreference() === null;
}

export { PREF_KEY as ANALYTICS_PREF_KEY };
