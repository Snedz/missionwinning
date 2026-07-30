'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { usePremium } from '@/hooks/usePremium';
import { ACTIVITY_LABELS, logActivity, type ActivityType } from '@/lib/activityLog';
import { logPillarWin } from '@/lib/pillarLog';
import { track } from '@/lib/analytics';
import {
  formatGpsActivityNotes,
  formatPaceMinPerKm,
  livePaceFromPoints,
  paceMinPerKm,
  segmentPaceSeries,
  totalTrackDistanceKm,
  type GpsPoint,
} from '@/lib/trackGps';
import { TrackGpsLockedPreview } from '@/components/track/TrackGpsLockedPreview';
import { isFreeBeta } from '@/lib/freeBeta';
import { localDateKey } from '@/lib/time/localDate';

const TrackPaceChart = dynamic(
  () => import('@/components/track/TrackPaceChart').then((m) => m.TrackPaceChart),
  { ssr: false }
);

const GPS_TYPES: ActivityType[] = ['walk', 'run', 'bike', 'hike'];

export function TrackGpsPanel({ onLogged }: { onLogged?: () => void }) {
  const { t } = useTranslation();
  const { premium } = usePremium();
  const [tracking, setTracking] = useState(false);
  const [gpsType, setGpsType] = useState<ActivityType>('walk');
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
    track('pillar_win', { pillar: 'track', action: 'gps_started' });
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
    const distanceKm = totalTrackDistanceKm(points);
    const avgPace = paceMinPerKm(distanceKm, durationMin);
    const today = localDateKey();
    logActivity({
      date: today,
      type: gpsType,
      durationMin,
      distanceKm: Math.round(distanceKm * 100) / 100,
      notes: formatGpsActivityNotes(ACTIVITY_LABELS[gpsType], points.length, avgPace),
    });
    logPillarWin('track', `GPS ${distanceKm.toFixed(2)} km`, { durationMin, distanceKm });
    track('pillar_win', { pillar: 'track', action: 'gps_saved', distanceKm });
    setPoints([]);
    onLogged?.();
  };

  if (!premium) {
    if (isFreeBeta()) return null;
    return <TrackGpsLockedPreview />;
  }

  const distanceKm = totalTrackDistanceKm(points);
  const livePace = livePaceFromPoints(points);
  const paceSeries = segmentPaceSeries(points);

  return (
    <Card className="content-card border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {t('trackGpsTitle', { defaultValue: 'GPS track (Premium)' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">
            {t('trackGpsTypeLabel', { defaultValue: 'Activity type' })}
          </Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {GPS_TYPES.map((act) => (
              <Button
                key={act}
                type="button"
                size="sm"
                variant={gpsType === act ? 'default' : 'outline'}
                disabled={tracking}
                onClick={() => setGpsType(act)}
              >
                {ACTIVITY_LABELS[act]}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t('trackGpsDistance', { defaultValue: 'Distance' })}: </span>
            <span className="font-mono font-medium">{distanceKm.toFixed(2)} km</span>
          </div>
          {livePace != null && (
            <div>
              <span className="text-muted-foreground">{t('trackGpsPace', { defaultValue: 'Pace' })}: </span>
              <span className="font-mono font-medium">{formatPaceMinPerKm(livePace)}</span>
            </div>
          )}
        </div>
        {paceSeries.length >= 2 && <TrackPaceChart data={paceSeries} />}
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
        {!tracking && points.length === 0 && !error && (
          <p className="text-xs text-muted-foreground">
            {t('trackGpsHint', {
              defaultValue: 'Allow location when prompted. Works best outdoors with clear sky.',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
