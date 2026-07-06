'use client';
/**
 * Premium enrollment status from /api/premium/status.
 * Consumers: CoachPage, BundlePage, gated UI
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * Server-verified premium flag. In production, localStorage mw_premium is ignored
 * unless DEMO_PREMIUM is enabled on the server.
 */
export function usePremium() {
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/premium/status', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setPremium(!!data.premium);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Offline fallback: never grant premium from localStorage in production builds
          const demoOnly =
            process.env.NODE_ENV === 'development' &&
            localStorage.getItem('mw_premium') === 'true';
          setPremium(demoOnly);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { premium, loading, refetch };
}
