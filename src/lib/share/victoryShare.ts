/**
 * Victory share decision helpers — URL payload + file/text fallthrough (.452).
 * Sheet owns DOM share/clipboard; cancel-after-file must not hit clipboard.
 */

export function buildVictorySharePayload(params: {
  origin: string;
  refCode: string | null | undefined;
  shareText: string;
}): { shareUrl: string; fullText: string } {
  const shareUrl = params.refCode
    ? `${params.origin}/?ref=${encodeURIComponent(params.refCode)}`
    : `${params.origin}/?utm_source=share&utm_medium=victory`;
  return {
    shareUrl,
    fullText: `${params.shareText} ${shareUrl}`,
  };
}

export type VictoryFileShareResult = 'shared' | 'cancelled' | 'unavailable';
export type VictoryTextShareResult = 'shared' | 'cancelled' | 'unavailable';

/** After a file-share attempt: cancel/success stop; only unavailable continues. */
export function nextVictoryShareAfterFile(
  result: VictoryFileShareResult
): 'done' | 'try_text' {
  if (result === 'shared' || result === 'cancelled') return 'done';
  return 'try_text';
}

/** After text share: success stops; cancel/fail may clipboard. */
export function nextVictoryShareAfterText(
  result: VictoryTextShareResult,
  canClipboard: boolean
): 'shared' | 'clipboard' | 'failed' {
  if (result === 'shared') return 'shared';
  if (canClipboard) return 'clipboard';
  return 'failed';
}
