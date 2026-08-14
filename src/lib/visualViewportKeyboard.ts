/**
 * How much of the layout viewport the on-screen keyboard (or Safari chrome)
 * covers. Pure — the hook only reads visualViewport.
 *
 * Outdoor one-thumb: Log set lives in the ScreenDock at the bottom of
 * `h-screen`. iOS does not resize that box when the keyboard opens, so the
 * red control sits under the keys. Overlap is the pixels to pad off.
 */
export function visualViewportKeyboardOverlap(opts: {
  innerHeight: number;
  visualHeight: number;
  visualOffsetTop: number;
}): number {
  if (!Number.isFinite(opts.innerHeight) || opts.innerHeight <= 0) return 0;
  if (!Number.isFinite(opts.visualHeight) || opts.visualHeight <= 0) return 0;
  if (!Number.isFinite(opts.visualOffsetTop) || opts.visualOffsetTop < 0) {
    return 0;
  }
  const visualBottom = opts.visualOffsetTop + opts.visualHeight;
  return Math.max(0, Math.round(opts.innerHeight - visualBottom));
}
