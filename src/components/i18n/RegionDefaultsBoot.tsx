'use client';

/**
 * First-visit units from CDN country (/api/geo).
 * Does not change language — LocaleCountryChooser is the confirm step.
 */

import { useEffect } from 'react';
import {
  REGION_DEFAULTS_APPLIED_KEY,
  UNITS_EXPLICIT_KEY,
  UNITS_STORAGE_KEY,
  type RegionDefaults,
} from '@/lib/regionDefaults';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

type GeoResponse = RegionDefaults & { source?: string };

export function RegionDefaultsBoot() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (readRaw(REGION_DEFAULTS_APPLIED_KEY) === '1') return;

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch('/api/geo', { credentials: 'same-origin' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as GeoResponse;
        if (cancelled) return;

        const unitsExplicit = readRaw(UNITS_EXPLICIT_KEY) === '1';
        const hasUnits = readRaw(UNITS_STORAGE_KEY);

        if (!unitsExplicit && !hasUnits && (data.units === 'metric' || data.units === 'imperial')) {
          writeRaw(UNITS_STORAGE_KEY, data.units);
          window.dispatchEvent(
            new StorageEvent('storage', { key: UNITS_STORAGE_KEY, newValue: data.units })
          );
        }

        // Language is confirmed in LocaleCountryChooser — never silently
        // change it from /api/geo. Geo country is a hint; hosted service
        // still follows supportedRegions.ts.
      } catch {
        /* offline or geo unavailable — defaults stay as they are */
      } finally {
        // Marked applied either way, so a failing /api/geo does not retry every mount.
        writeRaw(REGION_DEFAULTS_APPLIED_KEY, '1');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
