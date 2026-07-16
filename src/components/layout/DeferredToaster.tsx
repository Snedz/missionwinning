'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Toaster = dynamic(
  () => import('@/components/ui/toaster').then((m) => m.Toaster),
  { ssr: false }
);

/**
 * Mount Radix toast UI after idle so the toast primitive is off first paint.
 * First toasts after navigation still work once this mounts (~idle / 2s).
 */
export function DeferredToaster() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);
  if (!ready) return null;
  return <Toaster />;
}
