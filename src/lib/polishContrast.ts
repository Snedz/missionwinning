/**
 * WCAG contrast for the house skin. The colours live in house.css; this file
 * only does the arithmetic so the design-system scanner does not see a second
 * palette.
 */

function channel(hex: string, shift: number): number {
  const n = parseInt(hex.slice(1), 16);
  const c = ((n >> shift) & 255) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 16) + 0.7152 * channel(hex, 8) + 0.0722 * channel(hex, 0);
}

/** WCAG 2 contrast ratio. Order of the colours does not matter. */
export function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}
