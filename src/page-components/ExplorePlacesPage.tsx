'use client';
/**
 * Page: /explore — optional GPS nearby + free-roam pin board.
 * Quiet door from Account / More. Not Today. Not the log path.
 * See: docs/places/PLAN.md, app/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EXAMPLE_PUBLIC_PLACES } from '@/lib/places/examplePublicPlaces';
import { addPersonalPlace, loadPlaceDex, tagSessionOnPlace } from '@/lib/places/placeDex';
import { sortByNearby, type NearbyPlace } from '@/lib/places/nearby';
import { plotLngLat } from '@/lib/places/plot';
import { openStreetMapUrl } from '@/lib/places/openInMaps';
import { hasCoords, type GeoOrigin, type PlacePin } from '@/lib/places/types';
import { useWorkoutStore } from '@/store/workoutStore';

type GpsState = 'off' | 'pending' | 'on' | 'denied';

export function ExplorePlacesPage() {
  const { t } = useTranslation();
  const lastSessionId = useWorkoutStore((s) => s.workoutHistory[0]?.id ?? null);

  const [personal, setPersonal] = useState<PlacePin[]>([]);
  const [origin, setOrigin] = useState<GeoOrigin | null>(null);
  const [gps, setGps] = useState<GpsState>('off');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [tagNote, setTagNote] = useState<string | null>(null);

  useEffect(() => {
    setPersonal(loadPlaceDex());
  }, []);

  const pins = useMemo(
    () => sortByNearby([...personal, ...EXAMPLE_PUBLIC_PLACES], origin),
    [personal, origin]
  );

  const selected = pins.find((p) => p.id === selectedId) ?? null;

  const requestNearby = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGps('denied');
      return;
    }
    setGps('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGps('on');
      },
      () => setGps('denied'),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8_000 }
    );
  };

  const savePlace = (withGps: boolean) => {
    const lat = withGps && origin ? origin.lat : undefined;
    const lng = withGps && origin ? origin.lng : undefined;
    const place = addPersonalPlace({ name: newName, lat, lng });
    if (!place) return;
    setPersonal(loadPlaceDex());
    setNewName('');
    setSelectedId(place.id);
    setTagNote(null);
  };

  const tagLast = () => {
    if (!selected || selected.kind !== 'personal' || !lastSessionId) return;
    const updated = tagSessionOnPlace(selected.id, lastSessionId);
    if (!updated) return;
    setPersonal(loadPlaceDex());
    setTagNote(t('exploreTagged', { defaultValue: 'Last session tagged on this place.' }));
  };

  return (
    <PillarPageShell
      icon={MapPin}
      eyebrow={t('exploreEyebrow', { defaultValue: 'Places' })}
      title={t('exploreTitle', { defaultValue: 'Explore' })}
      subtitle={t('exploreSubtitle', {
        defaultValue:
          'Pins you have tagged, plus a few example public parks. Optional nearby — logging never needs GPS.',
      })}
      showLegalFooter
    >
      <p className="text-sm text-muted-foreground">
        {t('exploreNotContested', {
          defaultValue: 'Example parks are a catalog, not a contest. Nothing here is owned.',
        })}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={requestNearby} disabled={gps === 'pending'}>
          {t('exploreNearby', { defaultValue: 'Show nearby' })}
        </Button>
        <p className="self-center text-xs text-muted-foreground">
          {gps === 'on'
            ? t('exploreRoam', { defaultValue: 'Sorted by distance. Pan the list to roam.' })
            : gps === 'denied'
              ? t('exploreNearbyDenied', {
                  defaultValue: 'Location skipped — roam the list instead.',
                })
              : t('exploreGpsOptional', {
                  defaultValue: 'GPS is optional. Deny it and the board still works.',
                })}
        </p>
      </div>

      <PinBoard pins={pins} selectedId={selectedId} onSelect={setSelectedId} />

      <ul className="divide-y-2 divide-border border-2 border-border bg-card">
        {pins.map((pin) => (
          <li key={pin.id}>
            <button
              type="button"
              onClick={() => setSelectedId(pin.id)}
              className="flex min-h-[44px] w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted"
            >
              <span className="flex-1 font-semibold">{pin.name}</span>
              <span className="text-xs text-muted-foreground">
                {pin.kind === 'personal'
                  ? t('explorePersonal', { defaultValue: 'Yours' })
                  : t('exploreExamplePublic', { defaultValue: 'Example public' })}
                {pin.distanceKm != null
                  ? ` · ${t('exploreDistanceKm', { km: pin.distanceKm.toFixed(0), defaultValue: `${pin.distanceKm.toFixed(0)} km` })}`
                  : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selected && hasCoords(selected) ? (
        <a
          href={openStreetMapUrl(selected.lat, selected.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t('exploreOpenMaps', { defaultValue: 'Open in maps' })}
        </a>
      ) : null}

      {selected?.kind === 'personal' ? (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={tagLast}
            disabled={!lastSessionId}
          >
            {t('exploreTagLastSession', { defaultValue: 'Tag last session here' })}
          </Button>
          <p className="text-xs text-muted-foreground">
            {tagNote ??
              (lastSessionId
                ? t('exploreTagHint', {
                    defaultValue: 'Place is optional and added after the set.',
                  })
                : t('exploreNoSessions', {
                    defaultValue: 'Log a set first — then you can tag it here.',
                  }))}
          </p>
        </div>
      ) : null}

      <Card className="border-2 border-border bg-card">
        <CardContent className="space-y-3 pt-6">
          <p className="font-semibold">{t('exploreAddPlace', { defaultValue: 'Add a place' })}</p>
          <label className="block text-sm">
            {t('explorePlaceName', { defaultValue: 'Name' })}
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 border-2"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => savePlace(false)} disabled={!newName.trim()}>
              {t('exploreSavePlace', { defaultValue: 'Save to place-dex' })}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => savePlace(true)}
              disabled={!newName.trim() || !origin}
            >
              {t('exploreUseLocation', { defaultValue: 'Save with my location' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PillarPageShell>
  );
}

function PinBoard({
  pins,
  selectedId,
  onSelect,
}: {
  pins: NearbyPlace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const plotted = pins.filter(hasCoords);

  return (
    <div
      className="relative aspect-[2/1] w-full border-2 border-border bg-muted"
      role="img"
      aria-label={t('exploreBoardAria', { defaultValue: 'Place pins on a paper map' })}
    >
      {plotted.map((pin) => {
        const { xPct, yPct } = plotLngLat(pin.lat, pin.lng);
        const selected = pin.id === selectedId;
        return (
          <button
            key={pin.id}
            type="button"
            onClick={() => onSelect(pin.id)}
            aria-label={pin.name}
            aria-pressed={selected}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          >
            <span
              className={
                selected
                  ? 'block h-3 w-3 bg-primary-fill'
                  : pin.kind === 'personal'
                    ? 'block h-2.5 w-2.5 bg-foreground'
                    : 'block h-2.5 w-2.5 bg-muted-foreground'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
