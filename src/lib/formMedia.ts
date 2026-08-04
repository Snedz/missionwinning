/**
 * Form Index media — clinical poster/loop packs under /public/form/.
 * Prefer raster form packs over legacy SVG sticks for Train / library.
 * See docs/MEDIA_SYSTEM.md · media/GROK_IMAGINE_PROMPTS.md (Form Index).
 */

/** Shipped exercise ids with public/form/{id}/side.webp */
export const FORM_PACK_SIDE_IDS = new Set([
  // Pilot loops (also in FORM_PACK_VIDEO_IDS)
  'air-squat',
  'romanian-deadlift',
  'push-ups',
  'pull-ups',
  'thruster',
  'kettlebell-swing',
  'plank',
  'bench-press',
  // Wave 2 stills
  'deadlift',
  'overhead-press',
  'front-squat',
  'lunges',
  'burpees',
  'glute-bridge',
  'barbell-row',
  'box-jump',
]);

/**
 * Silent loops under public/form/{id}/side.mp4 (480p Imagine → ship).
 * Prefer MP4 for free-tier pipeline (no ffmpeg WebM required).
 */
export const FORM_PACK_VIDEO_IDS = new Set([
  'air-squat',
  'romanian-deadlift',
  'push-ups',
  'pull-ups',
  'thruster',
  'kettlebell-swing',
  'plank',
  'bench-press',
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
