'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePremium } from '@/hooks/usePremium';
import { logActivity } from '@/lib/activityLog';
import { logPillarWin } from '@/lib/pillarLog';
import { UnlockButton } from '@/components/UnlockButton';

type GpsPoint = { lat: number; lng: number; at: number };

export function TrackGpsPanel({ onLogged }: { onLogged?: () => void }) {
  const { t } = useTranslation();
  const { premium } = usePremium();
  const [tracking, setTracking] = useState(false);
  const [points, setPoints] = useState<GpsPoint[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const stopTracking = useCallback(() => {
    if (watchId != null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchId);
    }
    setWatchId(null);
    setTracking(false);
  }, [watchId]);

  const startTracking = () => {
    setError('');
    if (!navigator.geolocation) {
      setError(t('trackGpsUnsupported', { defaultValue: 'GPS not supported on this device.' }));
      return;
    }
    setPoints([]);
    setTracking(true);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPoints((prev) => [
          ...prev,
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            at: pos.timestamp,
          },
        ]);
      },
      () => setError(t('trackGpsDenied', { defaultValue: 'Location permission denied.' })),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    setWatchId(id);
  };

  const saveSession = () => {
    stopTracking();
    if (points.length < 2) {
      setError(t('trackGpsTooShort', { defaultValue: 'Need more GPS points — walk a bit longer.' }));
      return;
    }
    const start = points[0].at;
    const end = points[points.length - 1].at;
    const durationMin = Math.max(1, Math.round((end - start) / 60_000));
    let distanceKm = 0;
    for (let i = 1; i < points.length; i++) {
      distanceKm += haversineKm(points[i - 1], points[i]);
    }
    const today = new Date().toISOString().split('T')[0];
    logActivity({
      date: today,
      type: 'walk',
      durationMin,
      distanceKm: Math.round(distanceKm * 100) / 100,
      notes: `GPS track (${points.length} points)`,
    });
    logPillarWin('track', `GPS ${distanceKm.toFixed(2)} km`, { durationMin, distanceKm });
    setPoints([]);
    onLogged?.();
  };

  if (!premium) {
    return (
      <Card className="content-card border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-400" />
            {t('trackGpsTitle', { defaultValue: 'GPS track (Premium)' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {t('trackGpsPremiumDesc', {
              defaultValue: 'Record outdoor walks and runs with live distance — MapMy-style, Super Bundle.',
            })}
          </p>
          <UnlockButton productId="track-premium" price="8" title="Track Premium" isSubscription />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="content-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-400" />
          {t('trackGpsTitle', { defaultValue: 'GPS track (Premium)' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {tracking
            ? t('trackGpsRecording', {
                count: points.length,
                defaultValue: `Recording… ${points.length} points`,
              })
            : t('trackGpsIdle', { defaultValue: 'Start when you begin your walk or run.' })}
        </p>
        <div className="flex gap-2 flex-wrap">
          {!tracking ? (
            <Button size="sm" variant="fitness" onClick={startTracking}>
              {t('trackGpsStart', { defaultValue: 'Start GPS' })}
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={stopTracking}>
                {t('trackGpsStop', { defaultValue: 'Stop' })}
              </Button>
              <Button size="sm" variant="fitness" onClick={saveSession}>
                {t('trackGpsSave', { defaultValue: 'Save to log' })}
              </Button>
            </>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </CardContent>
    </Card>
  );
}

function haversineKm(a: GpsPoint, b: GpsPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
