/**
 * Quiet Track snapshot — a number they already have (scale, tape).
 * Empty invents nothing. Measurements stay free. Not a wearable score.
 */

import {
  BODY_METRIC_KEYS,
  type BodyMetricEntry,
  type BodyMetricKey,
} from '@/lib/bodyMetrics';

export type QuietTrackSnapshot = {
  empty: boolean;
  last: BodyMetricEntry | null;
};

export function entryHasLoggedNumber(
  entry: BodyMetricEntry | null | undefined
): entry is BodyMetricEntry {
  if (!entry) return false;
  return BODY_METRIC_KEYS.some((key: BodyMetricKey) => {
    const value = entry[key];
    return value != null && Number.isFinite(value);
  });
}

export function canSaveQuietTrack(entry: BodyMetricEntry): boolean {
  return entryHasLoggedNumber(entry);
}

/**
 * Last logged number, or honest empty. Date-only rows do not count.
 * Never seeds 0 kg / strain / recovery.
 */
export function quietTrackSnapshot(
  entries: readonly BodyMetricEntry[]
): QuietTrackSnapshot {
  const last = entries.find(entryHasLoggedNumber) ?? null;
  if (!last) return { empty: true, last: null };
  return { empty: false, last };
}
