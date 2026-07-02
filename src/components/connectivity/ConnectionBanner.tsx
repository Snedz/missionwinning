'use client';

import { Compass, Wifi, WifiOff } from 'lucide-react';
import { useConnectivity } from '@/components/connectivity/ConnectivityProvider';
import { connectivityBannerCopy } from '@/lib/connectivityMode';

const STRIPE: Record<string, string> = {
  online: 'bg-emerald-600/90',
  lite: 'bg-amber-600/90',
  offline: 'bg-slate-600/90',
};

export function ConnectionBanner() {
  const { mode, outboxPending } = useConnectivity();
  const copy = connectivityBannerCopy(mode, outboxPending);

  if (!copy.message) return null;

  const Icon = mode === 'offline' ? WifiOff : mode === 'lite' ? Compass : Wifi;

  const stripe =
    mode === 'offline'
      ? STRIPE.offline
      : mode === 'lite'
        ? STRIPE.lite
        : outboxPending > 0
          ? STRIPE.lite
          : STRIPE.online;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${stripe} text-white text-xs px-4 py-1.5 flex items-center gap-2 shrink-0`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
      <span>
        {copy.message}
        {copy.detail ? (
          <>
            {' '}
            <span className="opacity-90">{copy.detail}</span>
          </>
        ) : null}
      </span>
    </div>
  );
}
