'use client';

import { useEffect, useState } from 'react';

/**
 * Server-verified premium flag. In production, localStorage mw_premium is ignored
 * unless DEMO_PREMIUM is enabled on the server.
 */
export function usePremium() {
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
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
  }, []);

  return { premium, loading };
}
