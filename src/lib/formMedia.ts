/**
 * Form Index media — clinical poster/loop packs under /public/form/.
 * Prefer raster form packs over legacy SVG sticks for Train / library.
 * See media/form-kit/FORM_DIRECTOR.md (Seedance-class director prompts + QA).
 *
 * Quality reset (.467): demote glitchy loops and cropped/wrong stills until
 * Form Director regen passes eyes-on QA. Prefer still-only over broken video.
 */

/** Exercise ids with shipped public/form/{id}/side.webp that pass framing QA. */
export const FORM_PACK_SIDE_IDS = new Set([
  'air-squat',
  'romanian-deadlift',
  'push-ups',
  'pull-ups',
  'thruster',
  'kettlebell-swing',
  'plank',
  'bench-press',
  'deadlift',
  'overhead-press',
  'front-squat',
  'lunges',
  'glute-bridge',
  'barbell-row',
  // Form Director regen (.468) — eyes-on PASS
  'burpees',
  'box-jump',
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
  // Empty/light-bar pilots (.472)
  'thruster',
  'overhead-press',
  'deadlift',
  // Still-only: front-squat, RDL, bench, barbell-row, pull-ups
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
