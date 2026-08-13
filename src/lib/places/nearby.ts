import type { GeoOrigin, PlacePin } from './types';
import { hasCoords } from './types';

const EARTH_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in kilometres. */
export function haversineKm(a: GeoOrigin, b: GeoOrigin): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type NearbyPlace = PlacePin & { distanceKm: number | null };

/** Free-roam list, optionally sorted by distance when origin is known. */
export function sortByNearby(places: readonly PlacePin[], origin: GeoOrigin | null): NearbyPlace[] {
  const withDistance: NearbyPlace[] = places.map((p) => ({
    ...p,
    distanceKm: origin && hasCoords(p) ? haversineKm(origin, { lat: p.lat, lng: p.lng }) : null,
  }));
  if (!origin) return withDistance;
  return withDistance.sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return a.name.localeCompare(b.name);
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}
