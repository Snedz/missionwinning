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

        const langExplicit = readRaw(LANG_EXPLICIT_KEY) === '1';

        // Units stay metric until the athlete chooses imperial in Account.
        if (!langExplicit && data.language) {
          const lng = normalizeAppLang(data.language);
          // Override navigator-only first paint with region default.
          await i18n.changeLanguage(lng);
        }
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
