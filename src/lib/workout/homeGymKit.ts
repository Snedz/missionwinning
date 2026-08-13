/**
 * Local Home gym kit — what the athlete actually has.
 *
 * Free, no account, not Super Bundle bait. Young people start at $0: an explicit
 * empty save is floor-only. Unset storage keeps the coarse I-Day 3-profile
 * (bodyweight / dumbbells / full-gym) so a commercial gym is not silently stripped.
 *
 * Coach may filter substitutions with this list. It must not rank. Identity may
 * receive an emit of a mapped table pick — this module never imports identity.
 */

import type { Exercise } from '@/types';
import { readRaw, writeJson, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export const HOME_GYM_ITEMS = [
  'barbell',
  'rack',
  'plates',
  'dumbbells',
  'pull-up-bar',
  'floor',
] as const;

export type HomeGymItem = (typeof HOME_GYM_ITEMS)[number];

export type HomeGymKit = {
  readonly items: readonly HomeGymItem[];
};

const ITEM_SET = new Set<string>(HOME_GYM_ITEMS);

const COMMERCIAL_EQ = new Set([
  'machine',
  'cable',
  'sled',
  'tire',
  'bike',
  'rower',
  'rings',
  'various',
  'sandbag',
]);

const DUMBBELL_NEIGHBORS = new Set([
  'dumbbells',
  'kettlebell',
  'band',
  'bands',
  'medicine ball',
]);

const FLOOR_ONLY: HomeGymKit = { items: ['floor'] };

export const HOME_GYM_KIT_CHANGED = 'mw-home-gym-kit';

function normalizeEq(eq?: string): string {
  if (!eq) return 'bodyweight';
  return eq.trim().toLowerCase();
}

export function isHomeGymItem(value: string): value is HomeGymItem {
  return ITEM_SET.has(value);
}

export function kitHas(kit: HomeGymKit, item: HomeGymItem): boolean {
  return kit.items.includes(item);
}

/**
 * Clamp unknown keys. Explicit empty → floor-only ($0). Not for missing storage.
 */
export function parseHomeGymKit(raw: unknown): HomeGymKit {
  let values: unknown[] = [];
  if (Array.isArray(raw)) {
    values = raw;
  } else if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)) {
    values = (raw as { items: unknown[] }).items;
  }
  const items: HomeGymItem[] = [];
  const seen = new Set<HomeGymItem>();
  for (const v of values) {
    if (typeof v !== 'string') continue;
    const id = v.trim().toLowerCase();
    if (!isHomeGymItem(id) || seen.has(id)) continue;
    seen.add(id);
    items.push(id);
  }
  if (items.length === 0) return FLOOR_ONLY;
  return { items };
}

/** Missing or corrupt key → null (unset). Explicit `[]` → floor-only. */
export function loadHomeGymKit(): HomeGymKit | null {
  const raw = readRaw(STORAGE_KEYS.homeGymKit);
  if (raw === null || raw === '') return null;
  try {
    return parseHomeGymKit(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function kitToStorageEquipment(kit: HomeGymKit): string {
  if (kitHas(kit, 'barbell') || kitHas(kit, 'rack') || kitHas(kit, 'plates')) {
    return 'full-gym';
  }
  if (kitHas(kit, 'dumbbells')) return 'dumbbells';
  return 'bodyweight';
}

export function kitToEquipmentProfile(
  kit: HomeGymKit
): 'bodyweight' | 'dumbbells' | 'full-gym' {
  return kitToStorageEquipment(kit);
}

export function seedKitFromEquipmentProfile(
  profile: 'bodyweight' | 'dumbbells' | 'full-gym' | string,
): HomeGymKit | null {
  if (profile === 'bodyweight') return { items: ['floor'] };
  if (profile === 'dumbbells') return { items: ['floor', 'dumbbells'] };
  return null;
}

export function previewKitFromEquipment(storedEquipment: string): HomeGymKit {
  const v = storedEquipment.trim().toLowerCase();
  if (v === 'bodyweight' || v === 'bodyweight-only' || v.includes('bodyweight')) {
    return { items: ['floor'] };
  }
  if (v === 'dumbbells' || v === 'home-gym') return { items: ['floor', 'dumbbells'] };
  return { items: [...HOME_GYM_ITEMS] };
}

/** Emit-only map onto the existing Athlete Table `homeGym` picks. Never the reverse. */
export function kitToAthleteHomeGymPick(kit: HomeGymKit): 'bodyweight-only' | 'dumbbells' | 'rack-bars' {
  if (kitHas(kit, 'barbell') || kitHas(kit, 'rack')) return 'rack-bars';
  if (kitHas(kit, 'dumbbells')) return 'dumbbells';
  return 'bodyweight-only';
}

function isPullUpFamily(ex: Exercise): boolean {
  const s = `${ex.id} ${ex.name}`.toLowerCase();
  return /pull-?ups?|chin-?ups?|hanging-|inverted-row|negative-pull/.test(s);
}

function needsRack(ex: Exercise): boolean {
  if (normalizeEq(ex.equipment) !== 'barbell') return false;
  const s = `${ex.id} ${ex.name}`.toLowerCase();
  if (/split[\s-]?squat|hack[\s-]?squat/.test(s)) return false;
  return /\b(squat|bench)\b/.test(s);
}

/**
 * Catalog equipment → required kit items, or commercial (never matches a garage kit).
 */
export function kitRequirement(ex: Exercise): readonly HomeGymItem[] | 'commercial' {
  if (isPullUpFamily(ex)) return ['pull-up-bar'];
  const eq = normalizeEq(ex.equipment);
  if (COMMERCIAL_EQ.has(eq)) return 'commercial';
  if (eq === 'barbell' || eq === 'trap bar') {
    if (needsRack(ex)) return ['barbell', 'rack'];
    return ['barbell'];
  }
  if (DUMBBELL_NEIGHBORS.has(eq)) return ['dumbbells'];
  if (eq === 'bench') return [];
  return ['floor'];
}

export function kitMatchesExercise(ex: Exercise, kit: HomeGymKit): boolean {
  const need = kitRequirement(ex);
  if (need === 'commercial') return false;
  if (need.length === 0) return kitHas(kit, 'floor') || kitHas(kit, 'rack');
  return need.every((item) => kitHas(kit, item));
}

export function persistHomeGymKit(kit: HomeGymKit): void {
  const parsed = parseHomeGymKit(kit.items);
  writeJson(STORAGE_KEYS.homeGymKit, parsed.items);
  writeRaw(STORAGE_KEYS.equipment, kitToStorageEquipment(parsed));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(HOME_GYM_KIT_CHANGED));
  }
}

/** I-Day / Welcome: write a kit only when none is stored. Full-gym stays unset. */
export function seedHomeGymKitIfUnset(storedEquipment: string): void {
  if (loadHomeGymKit() !== null) return;
  const v = storedEquipment.trim().toLowerCase();
  const profile: 'bodyweight' | 'dumbbells' | 'full-gym' =
    v === 'bodyweight' || v === 'bodyweight-only' || v.includes('bodyweight')
      ? 'bodyweight'
      : v === 'dumbbells' || v === 'home-gym'
        ? 'dumbbells'
        : 'full-gym';
  const seed = seedKitFromEquipmentProfile(profile);
  if (!seed) return;
  writeJson(STORAGE_KEYS.homeGymKit, seed.items);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(HOME_GYM_KIT_CHANGED));
  }
}

export function toggleHomeGymItem(kit: HomeGymKit, item: HomeGymItem): HomeGymKit {
  if (kitHas(kit, item)) {
    return parseHomeGymKit(kit.items.filter((id) => id !== item));
  }
  return parseHomeGymKit([...kit.items, item]);
}
