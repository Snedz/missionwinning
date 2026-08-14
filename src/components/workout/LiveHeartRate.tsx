'use client';

import { useEffect, useRef, useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { isWearablesPubliclyEnabled } from '@/lib/wearables/flags';
import {
  connectHeartRateMonitor,
  isWebBluetoothAvailable,
  type BleHrConnection,
} from '@/lib/wearables/bleHeartRate';

/**
 * Live Bluetooth heart-rate strip for Active workout.
 * Gated by NEXT_PUBLIC_WEARABLES; requires Web Bluetooth (Chrome/Android).
 */
export function LiveHeartRate() {
  const { t } = useTranslation();
  const enabled = isWearablesPubliclyEnabled();
  const [bpm, setBpm] = useState<number | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const connRef = useRef<BleHrConnection | null>(null);

  useEffect(() => {
    return () => {
      connRef.current?.disconnect();
      connRef.current = null;
    };
  }, []);

  if (!enabled) return null;

  const supported = isWebBluetoothAvailable();

  const connect = async () => {
    setError('');
    try {
      connRef.current?.disconnect();
      const conn = await connectHeartRateMonitor((next) => setBpm(next));
      connRef.current = conn;
      setDeviceName(conn.deviceName);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t('liveHrConnectFailed', { defaultValue: 'Could not connect heart rate monitor.' })
      );
    }
  };

  const disconnect = () => {
    connRef.current?.disconnect();
    connRef.current = null;
    setDeviceName(null);
    setBpm(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-2 border-border bg-card px-3 py-2">
      <HeartPulse className="h-4 w-4 text-primary shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">
          {bpm != null
            ? t('liveHrBpm', { bpm, defaultValue: `${bpm} BPM` })
            : t('liveHrIdle', { defaultValue: 'Heart rate' })}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {!supported
            ? t('liveHrUnsupported', {
                defaultValue: 'Bluetooth HR needs Chrome or another browser with Web Bluetooth.',
              })
            : deviceName
              ? deviceName
              : t('liveHrHint', {
                  defaultValue: 'Optional Polar / Wahoo chest strap — not used in Mission Score.',
                })}
        </div>
        {error && <div className="text-[11px] text-destructive mt-0.5">{error}</div>}
      </div>
      {supported &&
        (deviceName ? (
          <Button type="button" size="sm" variant="ghost" className="min-h-[44px] tap-target" onClick={disconnect}>
            {t('liveHrDisconnect', { defaultValue: 'Disconnect' })}
          </Button>
        ) : (
          <Button type="button" size="sm" variant="outline" className="min-h-[44px] tap-target" onClick={() => void connect()}>
            {t('liveHrConnect', { defaultValue: 'Connect HR' })}
          </Button>
        ))}
    </div>
  );
}
