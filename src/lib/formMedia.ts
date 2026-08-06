/**
 * Form Index media — clinical poster/loop packs under /public/form/.
 * Prefer raster form packs over legacy SVG sticks for Train / library.
 * See media/form-kit/FORM_DIRECTOR.md (Seedance-class director prompts + QA).
 *
 * Quality reset (.467): demote glitchy loops and cropped/wrong stills until
 * Form Director regen passes eyes-on QA. Prefer still-only over broken video.
 */

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
  'front-squat',
  'lunges',
  'glute-bridge',
  'barbell-row',
  // Form Director regen (.468) — eyes-on PASS
  'burpees',
  'box-jump',
  // Landmine family stills (.473) — press PASS; squat PASS (.541);
  // row demoted .541 (floating free-end / unclear floor pivot)
  'landmine-press',
  // 'landmine-row',
  'landmine-squat',
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
  'lunges',
  'box-jump',
  'burpees',
  'kettlebell-swing',
  // Empty-bar pilot still has clean still+loop (.472 thruster)
  'thruster',
  // Empty-bar / directed I2V from PASS stills (.476–.478)
  'deadlift',
  'romanian-deadlift',
  'front-squat',
  'barbell-row',
  'bench-press',
  // Landmine pilot (.479) — pivot fixed, arc press
  'landmine-press',
  // Still-only: overhead-press (I2V behind-neck FAIL), pull-ups (top crop FAIL),
  // landmine-row/squat (no loop pilot)
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
  if (!FORM_PACK_SIDE_IDS.has(exerciseId)) return null;

  if (FORM_PACK_VIDEO_IDS.has(exerciseId)) {
    return {
      mediaUrl: formPackSideVideoPath(exerciseId),
      mediaType: 'video',
      mediaPosterUrl: formPackSidePosterPath(exerciseId),
      mediaCaption: 'Side view · full range of motion',
    };
  }

  return {
    mediaUrl: formPackSidePosterPath(exerciseId),
    mediaType: 'image',
    mediaCaption: 'Side view · full range of motion',
  };
}
