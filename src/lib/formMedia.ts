/**
 * Form Index media — clinical poster/loop packs under /public/form/.
 * Prefer raster form packs over legacy SVG sticks for Train / library.
 * See media/form-kit/FORM_DIRECTOR.md (Seedance-class director prompts + QA).
 * Cast sets (who appears): src/lib/formCast.ts · docs/MEDIA.md.
 *
 * Quality reset (.467): demote glitchy loops and cropped/wrong stills until
 * Form Director regen passes eyes-on QA. Prefer still-only over broken video.
 */

import {
  FORM_PACK_CAPTION,
  formPackCastPosterPath,
  pickFormCastStill,
} from '@/lib/formCast';

/**
 * Exercise ids with shipped public/form/{id}/side.webp that pass framing QA.
 * Eyes-on demotes (.498): wrong exercise or hard-reject crop must leave this set
 * even if the file remains on disk for regen reference.
 *
 * Validation: compare still to movement standard (side view, full ROM phase,
 * correct implement) — CrossFit library / YouTube demos are **reference only**
 * (no CF embeds/IP). See media/form-kit/qa/MOVEMENT_STANDARDS.md.
 */
export const FORM_PACK_SIDE_IDS = new Set([
  'air-squat',
  'romanian-deadlift',
  'push-ups',
  // Hang setup still — chin-over still hard for model; full feet in frame (.540 re-QA)
  'pull-ups',
  'thruster',
  'kettlebell-swing',
  'plank',
  'bench-press',
  'deadlift',
  // Two-hand empty-bar lockout still (.540 re-QA after .498 wrong-exercise demote)
  'overhead-press',
  // .772 regen: previous still was a high-bar back squat (wrong exercise)
  'front-squat',
  'lunges',
  'glute-bridge',
  'barbell-row',
  // Form Director regen (.468) — eyes-on PASS
  'burpees',
  'box-jump',
  // Landmine family stills (.473) — press PASS; squat PASS (.541);
  // row re-wired .772 (floor pivot readable)
  'landmine-press',
  'landmine-row',
  'landmine-squat',
  // Catalog 006 — barbell squat cast set (.736); still-only, no loop
  'squats',
  // Wave A unique stills (.772)
  'inverted-row',
  'hip-thrust',
  'face-pull',
  'bicep-curl',
  'tricep-pushdown',
  'wall-sit',
  'bird-dog',
  'lat-pulldown',
  'goblet-squat',
  'pike-pushup',
  // Wave B (.772) — dead-bug / side-plank retries after wrong-exercise FAIL
  'dead-bug',
  'side-plank',
  'mountain-climbers',
  'hollow-hold',
  'cable-row',
  'lateral-raise',
  'dumbbell-press',
  'dumbbell-row',
]);

/**
 * Silent loops public/form/{id}/side.mp4 — only after Form Director still PASS
 * and video physics QA. Empty during quality reset (.467): stills only.
 * Files may still exist on disk; do not wire until regen.
 */
export const FORM_PACK_VIDEO_IDS = new Set<string>([
  // Directed I2V from PASS stills (.469–.472)
  'air-squat',
  'glute-bridge',
  'push-ups',
  'plank',
  'box-jump',
  'kettlebell-swing',
  // Empty-bar / directed I2V from PASS stills (.476–.478)
  'deadlift',
  'romanian-deadlift',
  'barbell-row',
  'bench-press',
  // Landmine pilot (.479) — pivot fixed, arc press
  'landmine-press',
  // Still-only: overhead-press (I2V behind-neck FAIL), pull-ups (top crop FAIL),
  // landmine-row/squat (no loop pilot).
  // .772 demote until I2V from replacement stills: front-squat (was back-squat),
  // burpees (plank phase read as push-up), thruster (duplicate front-squat
  // bottom), lunges (empty-handed vs catalog Dumbbells).
]);

export function formPackSidePosterPath(exerciseId: string): string {
  return `/form/${exerciseId}/side.webp`;
}

export function formPackSideVideoPath(exerciseId: string): string {
  return `/form/${exerciseId}/side.mp4`;
}

export function formPackFrontPosterPath(exerciseId: string): string {
  return `/form/${exerciseId}/front.webp`;
}

/**
 * Same-lift method wrappers → a wired Form Index pack.
 * Closed on purpose: only intensity/rep-scheme skins of the same movement.
 * Different implements or patterns (box-squat, floor-press, reverse-lunge)
 * stay unaliased so a card cannot show the wrong lift.
 */
export const FORM_PACK_ALIASES: Readonly<Record<string, string>> = {
  '20-rep-squat': 'squats',
  'rest-pause-squat': 'squats',
  'pause-squat': 'squats',
  'tempo-squat': 'squats',
  'pyramid-bench': 'bench-press',
  'forced-rep-bench': 'bench-press',
  'pause-bench': 'bench-press',
  'kettlebell-swing-2h': 'kettlebell-swing',
};

export function canonicalFormPackId(exerciseId: string): string {
  return FORM_PACK_ALIASES[exerciseId] ?? exerciseId;
}

/**
 * Unique-exercise poster for library cards. Never a shared pattern raster
 * and never an SVG — those are teaching fallbacks, not the named lift.
 */
export function formPackLibraryPosterUrl(exerciseId: string): string | null {
  const pack = resolveFormPackMedia(exerciseId);
  if (!pack) return null;
  if (pack.mediaType === 'video') return pack.mediaPosterUrl ?? null;
  return pack.mediaUrl;
}

export type FormPackMedia = {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  mediaPosterUrl?: string;
  mediaCaption?: string;
};

/**
 * Resolve owned form pack (poster / loop) for an exercise.
 * Returns null when no pack is registered — caller falls back to SVG/pattern.
 */
export function resolveFormPackMedia(exerciseId: string): FormPackMedia | null {
  const id = canonicalFormPackId(exerciseId);
  if (!FORM_PACK_SIDE_IDS.has(id)) return null;

  const cast = pickFormCastStill(id);
  if (cast) {
    // Cast packs are still-only until the loop is recast (MEDIA.md · video follow-up).
    return {
      mediaUrl: formPackCastPosterPath(id, cast.id),
      mediaType: 'image',
      mediaCaption: FORM_PACK_CAPTION,
    };
  }

  if (FORM_PACK_VIDEO_IDS.has(id)) {
    return {
      mediaUrl: formPackSideVideoPath(id),
      mediaType: 'video',
      mediaPosterUrl: formPackSidePosterPath(id),
      mediaCaption: FORM_PACK_CAPTION,
    };
  }

  return {
    mediaUrl: formPackSidePosterPath(id),
    mediaType: 'image',
    mediaCaption: FORM_PACK_CAPTION,
  };
}
