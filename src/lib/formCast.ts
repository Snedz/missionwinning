/**
 * Form Index cast sets — which still to show when an exercise has more than one.
 *
 * Representation: docs/MEDIA.md (who appears). Territory: src/lib/legal/supportedRegions.ts.
 * Representation ≠ service territory. Captions stay movement-only.
 *
 * 0.1 picker: hash(exerciseId) % set.length. Locale / preference later.
 * The free logger is never gated on seeing these stills.
 */

import { buildFormCastSets } from '@/lib/formCastRoster';


export const FORM_PACK_CAPTION = 'Side view · full range of motion';

/** Clothing that must remain readable on the still — not ethnicity labels. */
export type FormCastMarker = 'hijab' | 'kippah' | 'tzitzit';

export type FormCastDress = 'athletic' | 'modest';

export type FormCastMember = {
  id: string;
  dress: FormCastDress;
  markers?: readonly FormCastMarker[];
};

/**
 * Raster still sets. Ids are file suffixes: `/form/{exerciseId}/cast-{id}.webp`.
 * Built from CAST_EXERCISE_IDS — every raster pack is a set, not one body.
 */
export const FORM_CAST_SETS: Readonly<Record<string, readonly FormCastMember[]>> =
  buildFormCastSets();

export function formPackCastPosterPath(exerciseId: string, castId: string): string {
  return `/form/${exerciseId}/cast-${castId}.webp`;
}

/** Deterministic FNV-1a index. Stable across sessions; not a collage. */
export function pickFormCastIndex(exerciseId: string, count: number): number {
  if (count <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < exerciseId.length; i++) {
    h ^= exerciseId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % count;
}

export function pickFormCastStill(exerciseId: string): FormCastMember | null {
  const set = FORM_CAST_SETS[exerciseId];
  if (!set || set.length === 0) return null;
  return set[pickFormCastIndex(exerciseId, set.length)] ?? null;
}

export function formCastHasMarker(
  set: readonly FormCastMember[],
  marker: FormCastMarker
): boolean {
  return set.some((m) => m.markers?.includes(marker));
}
