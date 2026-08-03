'use client';
/**
 * Premium enrollment status from /api/premium/status.
 * Module-level cache avoids gate flicker on every nav.
 * Consumers: CoachPage, BundlePage, gated UI
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { isFreeBetaPremiumUnlocked } from '@/lib/freeBeta';
import { readRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

const TTL_MS = 60_000;

type PremiumCache = {
  premium: boolean;
  fetchedAt: number;
};

let cache: PremiumCache | null = null;
let inflight: Promise<boolean> | null = null;
const listeners = new Set<() => void>();

/**
 * Stable free-beta snapshot. `useSyncExternalStore` requires getSnapshot /
 * getServerSnapshot to return the **same reference** when nothing changed —
 * a fresh `{ premium: true, fetchedAt: Date.now() }` every call caused
 * "The result of getServerSnapshot should be cached to avoid an infinite loop"
 * on Learn/Active during free beta.
 */
const FREE_BETA_SNAPSHOT: PremiumCache = { premium: true, fetchedAt: 0 };

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PremiumCache | null {
  if (cache) return cache;
  if (isFreeBetaPremiumUnlocked()) return FREE_BETA_SNAPSHOT;
  return null;
}

function getServerSnapshot(): PremiumCache | null {
  // Open beta: treat as premium on SSR so gated UI does not flash locked.
  if (isFreeBetaPremiumUnlocked()) return FREE_BETA_SNAPSHOT;
  return null;
}

function demoFallbackPremium(): boolean {
  if (isFreeBetaPremiumUnlocked()) return true;
  return (
    process.env.NODE_ENV === 'development' &&
    readRaw(STORAGE_KEYS.premium) === 'true'
  );
}

async function fetchPremiumStatus(): Promise<boolean> {
  if (isFreeBetaPremiumUnlocked()) {
    cache = { premium: true, fetchedAt: Date.now() };
    notify();
    return true;
  }
  if (inflight) return inflight;
  inflight = fetch('/api/premium/status', { credentials: 'include' })
    .then((r) => r.json())
    .then((data) => {
      const premium = !!data.premium;
      cache = { premium, fetchedAt: Date.now() };
      notify();
      return premium;
    })
    .catch(() => {
      const premium = demoFallbackPremium();
      cache = { premium, fetchedAt: Date.now() };
      notify();
      return premium;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function cacheIsFresh(): boolean {
  return !!cache && Date.now() - cache.fetchedAt < TTL_MS;
}

/**
 * Server-verified premium flag. In production, localStorage mw_premium is ignored
 * unless DEMO_PREMIUM is enabled on the server.
 */
export function usePremium() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [loading, setLoading] = useState(() => !cacheIsFresh());
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    // Expire TTL but keep last known premium to avoid unlock flicker while polling.
    if (cache) {
      cache = { premium: cache.premium, fetchedAt: 0 };
    }
    notify();
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (cacheIsFresh()) {
      setLoading(false);
      void fetchPremiumStatus();
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    void fetchPremiumStatus().then(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const premium = snapshot?.premium ?? isFreeBetaPremiumUnlocked();
  return { premium, loading, refetch };
}
