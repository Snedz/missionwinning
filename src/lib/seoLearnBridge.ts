/**
 * SEO Learn surfaces → in-app Learn / public magazine (Flow-3).
 *
 * Dual pads:
 * - Paths: `/paths` (teaser) vs `/learn` (habit chrome + completion)
 * - Guide: `/guide` (public magazine, SEO canonical) vs `/learn/guide` (app progress)
 *
 * One content body per concept — hand off by id, do not fork curricula.
 */

/** Query on `/learn` to expand a free path from SEO. */
export const SEO_LEARN_PATH_QUERY = 'path';

/** Known free path ids — pass from FREE_LEARN_PATHS at call sites when available. */
export function parseSeoLearnPathParam(
  source: URLSearchParams | string | null | undefined,
  knownIds?: ReadonlySet<string> | readonly string[]
): string | null {
  if (source == null || source === '') return null;
  const params =
    typeof source === 'string'
      ? new URLSearchParams(source.startsWith('?') ? source.slice(1) : source)
      : source;
  const raw = params.get(SEO_LEARN_PATH_QUERY)?.trim() ?? '';
  if (!raw) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(raw)) return null;
  if (raw.length > 80) return null;
  const id = raw.toLowerCase();
  if (knownIds) {
    const set = knownIds instanceof Set ? knownIds : new Set(knownIds);
    if (!set.has(id)) return null;
  }
  return id;
}

/** Primary CTA from public path teaser → in-app Learn with that path expanded. */
export function seoLearnPathOpenHref(pathId: string): string {
  const id = pathId.trim().toLowerCase();
  if (!id) return '/learn';
  return `/learn?${SEO_LEARN_PATH_QUERY}=${encodeURIComponent(id)}`;
}

export function stripSeoLearnPathFromSearch(search: string): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.delete(SEO_LEARN_PATH_QUERY);
  const q = params.toString();
  return q ? `?${q}` : '';
}

/** Public magazine home — SEO canonical for Beyond the Basics. */
export const PUBLIC_GUIDE_HREF = '/guide';

/** Public magazine chapter — same chapter body as in-app free guide content. */
export function publicGuideChapterHref(chapterId: string): string {
  const id = chapterId.trim();
  if (!id) return PUBLIC_GUIDE_HREF;
  return `${PUBLIC_GUIDE_HREF}/${encodeURIComponent(id)}`;
}

/** In-app guide index (progress + PDF). */
export const APP_GUIDE_HREF = '/learn/guide';

/** In-app free chapter (progress mark-complete chrome). */
export function appGuideChapterHref(chapterId: string): string {
  const id = chapterId.trim();
  if (!id) return APP_GUIDE_HREF;
  return `${APP_GUIDE_HREF}/${encodeURIComponent(id)}`;
}
