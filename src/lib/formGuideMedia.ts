/**
 * Form guide media presentation — mid-set teaching on Active.
 *
 * Form Index ships silent loops under /form/{id}/side.mp4. The sheet used to
 * require a play tap (`controls` without `autoPlay`), so the athlete opened the
 * guide mid-set and stared at a poster. Autoplay muted is the free-logger bar.
 *
 * Reduced motion: never autoplay; show the poster (or still url) instead.
 */

export type FormGuideMediaMode = 'video-autoplay' | 'still';

export function resolveFormGuideMediaMode(opts: {
  mediaType: 'image' | 'video';
  prefersReducedMotion: boolean;
}): FormGuideMediaMode {
  if (opts.mediaType !== 'video') return 'still';
  if (opts.prefersReducedMotion) return 'still';
  return 'video-autoplay';
}

/** URL to render as a still (image packs, or video packs under reduced motion). */
export function formGuideStillUrl(opts: {
  mediaType: 'image' | 'video';
  url: string;
  poster?: string;
}): string {
  if (opts.mediaType === 'video' && opts.poster) return opts.poster;
  return opts.url;
}
