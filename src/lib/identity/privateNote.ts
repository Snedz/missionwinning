/**
 * Local-only private note on the Athlete Page (C5).
 *
 * Free text is allowed **on this device only**. It must never be passed into
 * `buildAthletePublicProjection` or `buildAthletePageShareData`. A colocated
 * test greps those modules for this storage key so a future import cannot
 * smuggle the note onto a share surface by accident.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

/** Soft cap — a note, not a blog. */
export const PRIVATE_NOTE_MAX = 280;

export function loadPrivateNote(): string {
  const raw = readRaw(STORAGE_KEYS.athletePrivateNote) ?? '';
  return raw.slice(0, PRIVATE_NOTE_MAX);
}

export function savePrivateNote(raw: string): string {
  const next = (raw ?? '').slice(0, PRIVATE_NOTE_MAX);
  writeRaw(STORAGE_KEYS.athletePrivateNote, next);
  return next;
}
