'use client';

/**
 * First-visit language + units from CDN country (/api/geo).
 * Skips when the user already chose prefs in Profile (explicit flags).
 */

import { useEffect } from 'react';
import i18n from '@/i18n';
import { normalizeAppLang } from '@/i18n/appLangs';
import {
  LANG_EXPLICIT_KEY,
  REGION_DEFAULTS_APPLIED_KEY,
  UNITS_EXPLICIT_KEY,
  UNITS_STORAGE_KEY,
  type RegionDefaults,
} from '@/lib/regionDefaults';

type GeoResponse = RegionDefaults & { source?: string };

export function RegionDefaultsBoot() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(REGION_DEFAULTS_APPLIED_KEY) === '1') return;
    } catch {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch('/api/geo', { credentials: 'same-origin' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as GeoResponse;
        if (cancelled) return;

        const unitsExplicit = localStorage.getItem(UNITS_EXPLICIT_KEY) === '1';
        const langExplicit = localStorage.getItem(LANG_EXPLICIT_KEY) === '1';
        const hasUnits = localStorage.getItem(UNITS_STORAGE_KEY);

        if (!unitsExplicit && !hasUnits && (data.units === 'metric' || data.units === 'imperial')) {
          localStorage.setItem(UNITS_STORAGE_KEY, data.units);
          window.dispatchEvent(
            new StorageEvent('storage', { key: UNITS_STORAGE_KEY, newValue: data.units })
          );
        }

        if (!langExplicit && data.language) {
          const lng = normalizeAppLang(data.language);
          // Override navigator-only first paint with region default.
          await i18n.changeLanguage(lng);
        }

        localStorage.setItem(REGION_DEFAULTS_APPLIED_KEY, '1');
      } catch {
        try {
          localStorage.setItem(REGION_DEFAULTS_APPLIED_KEY, '1');
        } catch {
          /* private mode */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
