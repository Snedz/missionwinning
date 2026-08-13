/**
 * Personal place-dex — device-local. Sessions are tagged here after the set;
 * CompletedWorkoutLog is never required to carry a place.
 */

import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import type { PlacePin } from './types';

const MAX_SESSION_IDS = 50;

function isPersonalPlace(value: unknown): value is PlacePin {
  if (!value || typeof value !== 'object') return false;
  const p = value as PlacePin;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    p.kind === 'personal' &&
    (p.lat === undefined || typeof p.lat === 'number') &&
    (p.lng === undefined || typeof p.lng === 'number') &&
    (p.sessionIds === undefined || Array.isArray(p.sessionIds))
  );
}

export function loadPlaceDex(): PlacePin[] {
  const raw = readJson<unknown>(STORAGE_KEYS.placeDex);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isPersonalPlace).map((p) => ({
    ...p,
    sessionIds: Array.isArray(p.sessionIds) ? p.sessionIds.filter((id) => typeof id === 'string') : [],
  }));
}

export function savePlaceDex(places: PlacePin[]): void {
  writeJson(
    STORAGE_KEYS.placeDex,
    places.filter((p) => p.kind === 'personal')
  );
}

export function addPersonalPlace(input: {
  name: string;
  lat?: number;
  lng?: number;
}): PlacePin | null {
  const name = input.name.trim();
  if (!name) return null;
  const place: PlacePin = {
    id: `place-${Date.now()}`,
    name,
    kind: 'personal',
    sessionIds: [],
    ...(typeof input.lat === 'number' ? { lat: input.lat } : {}),
    ...(typeof input.lng === 'number' ? { lng: input.lng } : {}),
  };
  const next = [place, ...loadPlaceDex()];
  savePlaceDex(next);
  return place;
}

/**
 * Optional after-the-set tag. Does not mutate the workout log.
 * Returns null when the place is missing.
 */
export function tagSessionOnPlace(placeId: string, sessionId: string): PlacePin | null {
  const sid = sessionId.trim();
  if (!sid) return null;
  const dex = loadPlaceDex();
  const idx = dex.findIndex((p) => p.id === placeId && p.kind === 'personal');
  if (idx < 0) return null;
  const existing = dex[idx].sessionIds ?? [];
  const sessionIds = [sid, ...existing.filter((id) => id !== sid)].slice(0, MAX_SESSION_IDS);
  const updated: PlacePin = { ...dex[idx], sessionIds };
  const next = [...dex];
  next[idx] = updated;
  savePlaceDex(next);
  return updated;
}
