/**
 * Short written cues on the open live exercise (`.973`).
 *
 * Setup first, then execute, cap 3. Optional still only from media we
 * already have. Empty invents nothing. Not a clip feed. Not on Today.
 */

import type { FormGuide } from '@/types/formGuide';
import { formGuideStillUrl } from '@/lib/formGuideMedia';

export const IN_SET_CUE_CAP = 3;
export const IN_SET_SETUP_CAP = 2;

export type InSetCues = {
  lines: string[];
  stillUrl: string | null;
};

function cleanLine(text: string): string | null {
  const trimmed = text.trim();
  return trimmed ? trimmed : null;
}

/** Local still only — refuse remote hosts, protocol-relative, and video files. */
export function honestInSetStillUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const raw = url.trim();
  if (!raw.startsWith('/')) return null;
  if (raw.startsWith('//')) return null;
  if (/https?:/i.test(raw)) return null;
  if (/youtube|youtu\.be|vimeo|discord|cdn\./i.test(raw)) return null;
  if (/\.(mp4|webm|mov)(\?|#|$)/i.test(raw)) return null;
  return raw;
}

/**
 * Slim a resolved FormGuide for the live card.
 * Null / empty guide → empty. Does not invent a generic brace line.
 */
export function resolveInSetCues(guide: FormGuide | null | undefined): InSetCues {
  if (!guide) return { lines: [], stillUrl: null };

  const setup = (guide.setup ?? []).map(cleanLine).filter((s): s is string => !!s);
  const execute = (guide.execute ?? []).map(cleanLine).filter((s): s is string => !!s);

  const lines: string[] = [];
  for (const line of setup) {
    if (lines.length >= IN_SET_SETUP_CAP) break;
    lines.push(line);
  }
  for (const line of execute) {
    if (lines.length >= IN_SET_CUE_CAP) break;
    lines.push(line);
  }

  let stillUrl: string | null = null;
  if (guide.mediaUrl) {
    const candidate = formGuideStillUrl({
      mediaType: guide.mediaType ?? 'image',
      url: guide.mediaUrl,
      poster: guide.mediaPosterUrl,
    });
    stillUrl = honestInSetStillUrl(candidate);
  }

  return { lines, stillUrl };
}

export function shouldShowInSetCues(params: {
  holdsActiveExercise: boolean;
  skippedThisSession?: boolean;
  hidden?: boolean;
  lines: string[];
}): boolean {
  if (!params.holdsActiveExercise) return false;
  if (params.skippedThisSession) return false;
  if (params.hidden) return false;
  return params.lines.length > 0;
}
