/**
 * Pinned reminder on one lift — their sticky, not History (`.996`).
 *
 * Opt-in. Empty invents nothing. Last History note is not a pin.
 * Device-local via safeStorage. Never copied onto a completed log.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export const EXERCISE_PIN_MAX = 200;
export const EXERCISE_PIN_MAX_IDS = 80;

const PIN_KEY = STORAGE_KEYS.pinnedNoteByExercise;

export function normalizeExercisePin(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > EXERCISE_PIN_MAX ? trimmed.slice(0, EXERCISE_PIN_MAX) : trimmed;
}

function readPinMap(): Record<string, string> {
  const raw = readJson<unknown>(PIN_KEY, {});
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [id, text] of Object.entries(raw as Record<string, unknown>)) {
    const key = id.trim();
    const kept = normalizeExercisePin(text);
    if (!key || !kept) continue;
    out[key] = kept;
  }
  return out;
}

function writePinMap(map: Record<string, string>): void {
  const keys = Object.keys(map);
  if (keys.length > EXERCISE_PIN_MAX_IDS) {
    for (const stale of keys.slice(0, keys.length - EXERCISE_PIN_MAX_IDS)) {
      delete map[stale];
    }
  }
  writeJson(PIN_KEY, map);
}

export function readPinnedNote(exerciseId: string): string | undefined {
  const id = exerciseId.trim();
  if (!id) return undefined;
  return readPinMap()[id];
}

export function writePinnedNote(exerciseId: string, value: unknown): void {
  const id = exerciseId.trim();
  if (!id) return;
  const kept = normalizeExercisePin(value);
  const map = readPinMap();
  delete map[id];
  if (kept) map[id] = kept;
  writePinMap(map);
}

export function clearPinnedNote(exerciseId: string): void {
  writePinnedNote(exerciseId, '');
}
