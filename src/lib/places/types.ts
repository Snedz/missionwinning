/**
 * Explore places — personal place-dex + example public pins.
 * See docs/places/PLAN.md (frozen). Place never gates a set.
 */

export type PlaceKind = 'personal' | 'example-public';

export type PlacePin = {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  kind: PlaceKind;
  /** Completed-session ids tagged after the set — never required to log. */
  sessionIds?: string[];
};

export type GeoOrigin = {
  lat: number;
  lng: number;
};

export function hasCoords(place: PlacePin): place is PlacePin & { lat: number; lng: number } {
  return typeof place.lat === 'number' && typeof place.lng === 'number';
}
