'use client';
/**
 * Page: /explore — leftover places pin board.
 * Quiet door from Account / More. Not Today. Not the log path.
 * Not a shop. Not the training catalog (that is /library + /builder).
 * See: docs/places/PLAN.md, docs/IA_SKELETON.md, app/INDEX.md.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { Input } from '@/components/ui/input';
import { EXAMPLE_PUBLIC_PLACES } from '@/lib/places/examplePublicPlaces';
import { addPersonalPlace, loadPlaceDex } from '@/lib/places/placeDex';
import { sortByNearby, type NearbyPlace } from '@/lib/places/nearby';
import { plotLngLat } from '@/lib/places/plot';
import { hasCoords, type PlacePin } from '@/lib/places/types';

export function ExplorePlacesPage() {
  const { t } = useTranslation();

  const [personal, setPersonal] = useState<PlacePin[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setPersonal(loadPlaceDex());
  }, []);

  const pins = useMemo(
    () => sortByNearby([...personal, ...EXAMPLE_PUBLIC_PLACES], null),
    [personal]
  );

  const savePlace = () => {
    const place = addPersonalPlace({ name: newName });
    if (!place) return;
    setPersonal(loadPlaceDex());
    setNewName('');
    setSelectedId(place.id);
  };

  return (
    <PillarPageShell
      className="house-explore"
      icon={MapPin}
      eyebrow={t('exploreEyebrow', { defaultValue: 'Places' })}
      title={t('exploreTitle', { defaultValue: 'Explore' })}
      subtitle={t('exploreSubtitle', {
        defaultValue:
          'Pins you have tagged, plus a few example public parks. Optional nearby — logging never needs GPS.',
      })}
    >
      <p className="house-lede">
        {t('exploreNotContested', {
          defaultValue: 'Example parks are a catalog, not a contest. Nothing here is owned.',
        })}
      </p>

      <PinBoard pins={pins} selectedId={selectedId} onSelect={setSelectedId} />

      <ul className="house-list">
        {pins.map((pin) => (
          <li key={pin.id} className={`house-item${selectedId === pin.id ? ' is-on' : ''}`}>
            <button
              type="button"
              onClick={() => setSelectedId(pin.id)}
              className="house-item-body"
            >
              <strong>{pin.name}</strong>
              <span>
                {pin.kind === 'personal'
                  ? t('explorePersonal', { defaultValue: 'Yours' })
                  : t('exploreExamplePublic', { defaultValue: 'Example public' })}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="house-card space-y-3">
        <p className="font-semibold">{t('exploreAddPlace', { defaultValue: 'Add a place' })}</p>
        <label className="block text-sm">
          {t('explorePlaceName', { defaultValue: 'Name' })}
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1"
          />
        </label>
        <div className="house-row">
          <button
            type="button"
            className="house-btn house-btn-primary"
            onClick={savePlace}
            disabled={!newName.trim()}
          >
            {t('exploreSavePlace', { defaultValue: 'Save to place-dex' })}
          </button>
        </div>
      </div>
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
  const plotted = pins.filter(
    (p): p is NearbyPlace & { lat: number; lng: number } => hasCoords(p)
  );

  return (
    <div
      className="house-board relative aspect-[2/1] w-full"
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
                  ? 'house-pin is-on'
                  : pin.kind === 'personal'
                    ? 'house-pin'
                    : 'house-pin is-faint'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
