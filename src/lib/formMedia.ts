/**
 * Form Index media — clinical poster/loop packs under /public/form/.
 * Prefer raster form packs over legacy SVG sticks for Train / library.
 * See docs/MEDIA_SYSTEM.md · media/GROK_IMAGINE_PROMPTS.md (Form Index).
 */

/** Pilot + shipped exercise ids with public/form/{id}/side.webp */
export const FORM_PACK_SIDE_IDS = new Set([
  'air-squat',
  'romanian-deadlift',
  'push-ups',
  'pull-ups',
  'thruster',
  'kettlebell-swing',
  'plank',
  'bench-press',
]);

/** Optional silent loops public/form/{id}/side.webm (add ids as WebMs ship). */
export const FORM_PACK_VIDEO_IDS = new Set<string>([
  // empty until Phase 1 loops land
]);

export function formPackSidePosterPath(exerciseId: string): string {
  return `/form/${exerciseId}/side.webp`;
}

export function formPackSideVideoPath(exerciseId: string): string {
  return `/form/${exerciseId}/side.webm`;
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
