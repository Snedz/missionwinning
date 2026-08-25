/**
 * Named custom exercise on the live Train picker (`.990`).
 *
 * A catalog miss used to kill the add and unmount the set row. They
 * type a name, it stays on this device and in the session, and they
 * keep logging. Unlimited. Free. Empty invents nothing. Not a shop.
 */

import { EXERCISES, getExerciseById } from '@/data/exercises';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import type { Exercise } from '@/types';

export const CUSTOM_ID_PREFIX = 'custom-';
export const CUSTOM_NAME_MAX = 80;

export type CustomExercise = {
  id: string;
  name: string;
  createdAt: string;
};

export type NamedCustomDecision =
  | { kind: 'catalog'; id: string }
  | { kind: 'reuse'; id: string }
  | { kind: 'create'; name: string };

export type CustomExerciseStore = {
  catalog?: readonly Exercise[];
  load?: () => CustomExercise[];
  save?: (rows: CustomExercise[]) => boolean;
  now?: () => string;
  id?: () => string;
};

/** Trim + collapse inner space. Blank → empty. Cap length. */
export function normalizeCustomName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const name = raw.trim().replace(/\s+/g, ' ');
  if (!name) return '';
  return name.length > CUSTOM_NAME_MAX ? name.slice(0, CUSTOM_NAME_MAX).trim() : name;
}

export function isCustomExerciseId(id: string): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX);
}

function looksLikeUuid(raw: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
}

/** Leftover id → readable name. A uuid leftover is just Custom. */
export function humanizeExerciseId(id: string): string {
  const trimmed = String(id ?? '').trim();
  if (!trimmed) return '';
  const body = trimmed.startsWith(CUSTOM_ID_PREFIX)
    ? trimmed.slice(CUSTOM_ID_PREFIX.length)
    : trimmed;
  if (!body || looksLikeUuid(body)) return 'Custom';
  const spaced = body.replace(/[-_]+/g, ' ').trim();
  return spaced || 'Custom';
}

export function mintCustomId(makeId?: () => string): string {
  const suffix =
    makeId?.() ??
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
  return suffix.startsWith(CUSTOM_ID_PREFIX) ? suffix : `${CUSTOM_ID_PREFIX}${suffix}`;
}

function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function decideNamedCustom(input: {
  name: unknown;
  catalog?: readonly Pick<Exercise, 'id' | 'name'>[];
  existing?: readonly Pick<CustomExercise, 'id' | 'name'>[];
}): NamedCustomDecision | null {
  const name = normalizeCustomName(input.name);
  if (!name) return null;
  const key = nameKey(name);
  const catalogHit = (input.catalog ?? []).find((row) => nameKey(row.name) === key);
  if (catalogHit) return { kind: 'catalog', id: catalogHit.id };
  const existingHit = (input.existing ?? []).find((row) => nameKey(row.name) === key);
  if (existingHit) return { kind: 'reuse', id: existingHit.id };
  return { kind: 'create', name };
}

function parseRow(raw: unknown): CustomExercise | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = typeof row.id === 'string' ? row.id.trim() : '';
  const name = normalizeCustomName(row.name);
  if (!id || !name) return null;
  const createdAt = typeof row.createdAt === 'string' ? row.createdAt : '';
  return { id, name, createdAt };
}

export function loadCustomExercises(): CustomExercise[] {
  const raw = readJson<unknown>(STORAGE_KEYS.customExercises, []);
  if (!Array.isArray(raw)) return [];
  const out: CustomExercise[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const row = parseRow(item);
    if (!row || seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

export function saveCustomExercises(rows: readonly CustomExercise[]): boolean {
  const clean: CustomExercise[] = [];
  const seen = new Set<string>();
  for (const item of rows) {
    const row = parseRow(item);
    if (!row || seen.has(row.id)) continue;
    seen.add(row.id);
    clean.push(row);
  }
  return writeJson(STORAGE_KEYS.customExercises, clean);
}

function asExercise(row: CustomExercise): Exercise {
  return { id: row.id, name: row.name, muscleGroups: [] };
}

export function upsertCustomExercise(
  name: unknown,
  store: CustomExerciseStore = {}
): { id: string; name: string } | null {
  const catalog = store.catalog ?? EXERCISES;
  const existing = store.load ? store.load() : loadCustomExercises();
  const decision = decideNamedCustom({ name, catalog, existing });
  if (!decision) return null;
  if (decision.kind === 'catalog') {
    const hit = catalog.find((row) => row.id === decision.id);
    return { id: decision.id, name: hit?.name ?? normalizeCustomName(name) };
  }
  if (decision.kind === 'reuse') {
    const hit = existing.find((row) => row.id === decision.id);
    return { id: decision.id, name: hit?.name ?? normalizeCustomName(name) };
  }
  const row: CustomExercise = {
    id: mintCustomId(store.id),
    name: decision.name,
    createdAt: store.now?.() ?? new Date().toISOString(),
  };
  const next = [...existing, row];
  if (store.save) store.save(next);
  else saveCustomExercises(next);
  return { id: row.id, name: row.name };
}

/**
 * Catalog, then their notebook, then a leftover synthetic so a live
 * session row is never unmounted. Empty id → null.
 */
export function resolveExercise(
  id: string | null | undefined,
  store: CustomExerciseStore = {}
): Exercise | null {
  const trimmed = String(id ?? '').trim();
  if (!trimmed) return null;
  const catalog = store.catalog ?? EXERCISES;
  const catalogHit = catalog.find((row) => row.id === trimmed) ?? getExerciseById(trimmed);
  if (catalogHit) return catalogHit;
  const existing = store.load ? store.load() : loadCustomExercises();
  const customHit = existing.find((row) => row.id === trimmed);
  if (customHit) return asExercise(customHit);
  return { id: trimmed, name: humanizeExerciseId(trimmed), muscleGroups: [] };
}

export function exerciseDisplayName(
  id: string | null | undefined,
  store: CustomExerciseStore = {}
): string {
  return resolveExercise(id, store)?.name ?? '';
}

/**
 * Catalog plus **their** named rows. Does not invent leftovers that
 * were never named.
 */
export function exercisesForPicker(
  catalog: readonly Exercise[] = EXERCISES,
  store: CustomExerciseStore = {}
): Exercise[] {
  const existing = store.load ? store.load() : loadCustomExercises();
  const seen = new Set(catalog.map((row) => row.id));
  const extra = existing.filter((row) => !seen.has(row.id)).map(asExercise);
  return extra.length > 0 ? [...extra, ...catalog] : [...catalog];
}
