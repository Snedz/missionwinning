'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const JourneySyncInner = dynamic(
  () => import('@/components/layout/JourneySyncInner').then((m) => ({ default: m.JourneySyncInner })),
  { ssr: false }
);

/** Defer cloud journey sync until idle so first paint isn't blocked on Supabase. */
export function JourneySyncBoot() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const on = () => setReady(true);
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(on, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(on, 400);
    return () => clearTimeout(t);
  }, []);
  if (!ready) return null;
  return <JourneySyncInner />;
}
